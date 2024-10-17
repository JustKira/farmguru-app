import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import * as Location from 'expo-location';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { AddLocation } from './add-location';
import { Notes } from './add-notes';
import { AddPhoto } from './add-photo';
import { AddVoiceNote } from './add-voice-note';
import { SelectCategory } from './select-category';
import { SelectDate } from './select-date';
import { SelectSeverity } from './select-severity';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { database } from '~/lib/database';
import Field from '~/lib/database/model/field';
import ScoutPoint from '~/lib/database/model/scout-point';
import { storage } from '~/lib/mmkv/storage';
import { getFieldsScoutPointsQueryKey } from '~/lib/react-query/get-field-scout-points';

export const formSchema = z.object({
  issueCategory: z.string(),
  issueSeverity: z.string(),
  notes: z.string().optional(),
  date: z.date(),
  voiceNote: z.string().optional(),
  photo: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface AddScoutPointProps {
  field: Field;
}

export interface AddScoutPointHandles {
  reset: () => void;
  open: (sp?: ScoutPoint) => void;
}

export const AddScoutPoint = forwardRef<AddScoutPointHandles, AddScoutPointProps>(
  ({ field }, ref) => {
    const snapPoints = useMemo(() => ['100%'], []);

    const [scoutPoint, setScoutPoint] = useState<ScoutPoint | null>(null);

    const bottomSheetRef = useRef<BottomSheet>(null);

    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const voiceNoteRef = useRef<{ startRecording: () => void; stopRecording: () => void }>(null);

    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<{
      latitude: number;
      longitude: number;
      accuracy: number | null;
    } | null>(null);

    const {
      control,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        issueCategory: 'insect',
        issueSeverity: 'early',
        date: new Date(),
        notes: '',
        voiceNote: undefined,
        photo: undefined,
        location: {
          latitude: 0,
          longitude: 0,
        },
      },
    });

    const resetWithDefaults = () => {
      reset({
        issueCategory: 'insect',
        issueSeverity: 'early',
        date: new Date(),
        notes: '',
        voiceNote: undefined,
        photo: undefined,
        location: {
          latitude: userLocation?.latitude ?? 0,
          longitude: userLocation?.longitude ?? 0,
        },
      });
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        voiceNoteRef.current?.stopRecording();
        setScoutPoint(null);
        resetWithDefaults();
        bottomSheetRef.current?.forceClose();
      },
      // submit: handleSubmit(onSubmit),
      open: (sp) => {
        voiceNoteRef.current?.stopRecording();
        setScoutPoint(null);
        resetWithDefaults();
        bottomSheetRef.current?.expand();
        if (sp) setScoutPoint(sp);
      },
    }));

    useEffect(() => {
      const fetchLocation = async () => {
        setIsLocationLoading(true);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
          }

          const locationSnap = await Location.getLastKnownPositionAsync();
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          });

          setValue('location', {
            latitude: scoutPoint?.location[0] ?? locationSnap?.coords.latitude ?? 0,
            longitude: scoutPoint?.location[1] ?? locationSnap?.coords.longitude ?? 0,
          });
        } catch (error) {
          console.error('Error getting location:', error);
        } finally {
          setIsLocationLoading(false);
        }
      };

      fetchLocation();
    }, [scoutPoint, setValue]);

    useEffect(() => {
      if (scoutPoint) {
        setValue('issueCategory', scoutPoint.issueCategory);
        setValue('issueSeverity', scoutPoint.issueSeverity);
        setValue('date', scoutPoint.date);
        setValue('notes', scoutPoint.note);
        setValue(
          'voiceNote',
          scoutPoint.voiceNote ? storage.getString(scoutPoint.voiceNote) : undefined
        );
        setValue(
          'photo',
          scoutPoint.photos.length > 0 ? storage.getString(scoutPoint.photos[0]) : undefined
        );
        setValue('location', {
          latitude: scoutPoint.location[0],
          longitude: scoutPoint.location[1],
        });
      }
    }, [scoutPoint, setValue]);

    const onSubmit = async (data: FormData) => {
      try {
        await database.write(async () => {
          if (scoutPoint) {
            await updateScoutPoint(scoutPoint, data);
          } else {
            await createScoutPoint(data);
          }
        });

        voiceNoteRef.current?.stopRecording();
        setScoutPoint(null);
        resetWithDefaults();
        bottomSheetRef.current?.forceClose();

        await queryClient.invalidateQueries({
          queryKey: getFieldsScoutPointsQueryKey(field.id),
        });
      } catch (error) {
        console.error('Failed to save scout point', error);
      }
    };

    const updateScoutPoint = async (sp: ScoutPoint, data: FormData) => {
      await sp.update((point) => {
        point.issueCategory = data.issueCategory;
        point.issueSeverity = data.issueSeverity;
        point.date = data.date;
        point.location = [data.location.latitude, data.location.longitude];
        point.note = data.notes ?? '';

        if (data.voiceNote && data.voiceNote !== storage.getString(point.voiceNote)) {
          const vnId = nanoid();
          storage.set(vnId, data.voiceNote);
          point.voiceNote = vnId;
        } else if (!data.voiceNote) {
          point.voiceNote = '';
        }

        if (data.photo && data.photo !== storage.getString(point.photos[0])) {
          const phId = nanoid();
          storage.set(phId, data.photo);
          point.photos = [phId];
        } else if (!data.photo) {
          point.photos = [];
        }
      });
    };

    const createScoutPoint = async (data: FormData) => {
      const vnId = data.voiceNote ? nanoid() : '';
      const phId = data.photo ? nanoid() : '';

      if (data.voiceNote) storage.set(vnId, data.voiceNote);
      if (data.photo) storage.set(phId, data.photo);

      await database.get<ScoutPoint>('scout_point').create((sp) => {
        sp.fieldId = field.id;
        sp.date = data.date;
        sp.location = [data.location.latitude, data.location.longitude];
        sp.photos = data.photo ? [phId] : [];
        sp.issueCategory = data.issueCategory;
        sp.issueSeverity = data.issueSeverity;
        sp.note = data.notes ?? '';
        sp.voiceNote = data.voiceNote ? vnId : '';
      });
    };

    return (
      <BottomSheet index={-1} snapPoints={snapPoints} ref={bottomSheetRef}>
        <BottomSheetScrollView className="flex-1 px-2">
          <View className="mb-2 gap-2">
            {scoutPoint?.id && <Text className="text-xs">{scoutPoint.id}</Text>}
            <SelectCategory setValue={setValue} value={watch('issueCategory')} />
            {errors.issueCategory && <Text>{errors.issueCategory.message}</Text>}
            <SelectSeverity setValue={setValue} value={watch('issueSeverity')} />
            {errors.issueSeverity && <Text>{errors.issueSeverity.message}</Text>}
            <AddLocation
              userLocation={userLocation}
              isLocationLoading={isLocationLoading}
              value={watch('location')}
              setValue={setValue}
              field={field}
            />
            <Text>
              {isLocationLoading ? (
                <Text>{t('messages.loading')}</Text>
              ) : (
                <Text className="text-sm font-bold">
                  {watch('location')?.latitude === userLocation?.latitude &&
                  watch('location')?.longitude === userLocation?.longitude
                    ? t('your-current-location')
                    : `lng:${watch('location')?.latitude?.toFixed(6)}, lat:${watch('location')?.longitude?.toFixed(6)}`}
                </Text>
              )}
            </Text>
            {errors.location && <Text>{errors.location.message}</Text>}
            <SelectDate control={control} />
            {errors.date && <Text>{errors.date.message}</Text>}
            {watch('date') && (
              <Badge>
                <Text>{format(watch('date'), 'EE, d MMM yyyy HH:mm aaa')}</Text>
              </Badge>
            )}
            <Text className="text-md mt-4 font-medium capitalize text-muted-foreground">
              Optional
            </Text>
            <Notes control={control} />
            <AddVoiceNote ref={voiceNoteRef} setValue={setValue} value={watch('voiceNote')} />
            <AddPhoto setValue={setValue} value={watch('photo')} />
            <Button onPress={handleSubmit(onSubmit)}>
              <Text>{t('submit')}</Text>
            </Button>
            <Button
              onPress={() => {
                voiceNoteRef.current?.stopRecording();
                setScoutPoint(null);
                resetWithDefaults();
                bottomSheetRef.current?.forceClose();
              }}>
              <Text>{t('cancel')}</Text>
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default AddScoutPoint;
