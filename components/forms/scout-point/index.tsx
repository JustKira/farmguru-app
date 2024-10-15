import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import * as Location from 'expo-location';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

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

export function AddScoutPoint({
  field,
  scoutPoint,
  onCreateOrUpdate,
  onCanceled,
  resetTrigger,
}: {
  field: Field;
  scoutPoint?: ScoutPoint;
  onCreateOrUpdate?: () => void;
  onCanceled?: () => void;
  resetTrigger: boolean;
}) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);

  useEffect(() => {
    resetWithDefaults();
  }, [resetTrigger]);

  const submit = handleSubmit(async (data) => {
    if (scoutPoint) {
      console.log('Updating scout point');
      try {
        await database.write(async () => {
          await scoutPoint.update((sp) => {
            // Check and update issueCategory
            if (data.issueCategory !== sp.issueCategory) {
              sp.issueCategory = data.issueCategory;
            }

            // Check and update issueSeverity
            if (data.issueSeverity !== sp.issueSeverity) {
              sp.issueSeverity = data.issueSeverity;
            }

            // Check and update date
            if (data.date.getTime() !== sp.date.getTime()) {
              sp.date = data.date;
            }

            // Check and update location
            if (
              data.location.latitude !== sp.location[0] ||
              data.location.longitude !== sp.location[1]
            ) {
              sp.location = [data.location.latitude, data.location.longitude];
            }

            // Check and update note
            if (data.notes !== sp.note) {
              sp.note = data.notes ?? '';
            }

            // Handle voice note update
            if (data.voiceNote && data.voiceNote !== storage.getString(sp.voiceNote)) {
              const vnId = nanoid();
              storage.set(vnId, data.voiceNote);
              sp.voiceNote = vnId;
            } else if (!data.voiceNote && sp.voiceNote) {
              sp.voiceNote = '';
            }

            // Handle photo update
            if (data.photo && data.photo !== storage.getString(sp.photos[0])) {
              const phId = nanoid();
              storage.set(phId, data.photo);
              sp.photos = [phId];
            } else if (!data.photo && sp.photos.length > 0) {
              sp.photos = [];
            }
          });
        });
        onCreateOrUpdate?.();

        console.log('Scout point updated');
      } catch (error) {
        console.error('Failed to update scout point', error);
      }
    } else {
      const vnId = nanoid();
      if (data.voiceNote) {
        storage.set(vnId, data.voiceNote);
      }

      const phId = nanoid();
      if (data.photo) {
        storage.set(phId, data.photo);
      }

      try {
        await database.write(async () => {
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
        });
        onCreateOrUpdate?.();
        console.log('Scout point created');
      } catch (error) {
        console.error('Failed to create scout point', error);
      }
    }

    resetWithDefaults();

    await queryClient.invalidateQueries({
      queryKey: getFieldsScoutPointsQueryKey(field.id),
    });
  });

  useEffect(() => {
    (async () => {
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

        if (scoutPoint) {
          setValue('location', {
            latitude: scoutPoint.location[0],
            longitude: scoutPoint.location[1],
          });
        } else {
          setValue('location', {
            latitude: locationSnap?.coords.latitude ?? 0,
            longitude: locationSnap?.coords.longitude ?? 0,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLocationLoading(false);
      }
    })();
  }, [scoutPoint]);

  useEffect(() => {
    if (scoutPoint) {
      setValue('issueCategory', scoutPoint.issueCategory);
      setValue('issueSeverity', scoutPoint.issueSeverity);
      setValue('date', scoutPoint.date);
      setValue('notes', scoutPoint.note);

      if (scoutPoint.voiceNote) {
        const file = storage.getString(scoutPoint.voiceNote);
        setValue('voiceNote', file);
      } else {
        setValue('voiceNote', undefined);
      }

      if (scoutPoint.photos.length > 0) {
        const file = storage.getString(scoutPoint.photos[0]);
        setValue('photo', file);
      } else {
        setValue('photo', undefined);
      }

      setValue('location', {
        latitude: scoutPoint.location[0],
        longitude: scoutPoint.location[1],
      });
    } else {
      setValue('issueCategory', 'insect');
      setValue('issueSeverity', 'early');
      setValue('date', new Date());
    }
  }, [scoutPoint]);

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

  return (
    <View className="mb-2 gap-2">
      {scoutPoint?.id ? <Text className="text-xs">{scoutPoint?.id}</Text> : null}
      <SelectCategory setValue={setValue} value={watch('issueCategory')} />
      {errors.issueCategory && <Text>{errors.issueCategory.message?.toString()}</Text>}
      <SelectSeverity setValue={setValue} value={watch('issueSeverity')} />
      {errors.issueSeverity && <Text>{errors.issueSeverity.message?.toString()}</Text>}
      <AddLocation
        userLocation={userLocation}
        isLocationLoading={isLocationLoading}
        value={watch('location')}
        setValue={setValue}
        field={field}
      />
      <Text>
        {isLocationLoading ? (
          <>
            <Text>{t('messages.loading')}</Text>
          </>
        ) : (
          <>
            <Text className="text-sm font-bold">{t('your-current-location')}</Text>
          </>
        )}
      </Text>
      {errors.location && <Text>{errors.location.message?.toString()}</Text>}
      <SelectDate control={control} />
      {errors.date && <Text>{errors.date.message?.toString()}</Text>}
      <Text>
        {watch('date') ? (
          <Badge>
            <Text>{format(watch('date'), 'EE ,d MMM yyy HH:mm aaa')}</Text>
          </Badge>
        ) : null}
      </Text>

      <Text className="text-md mt-4 font-medium capitalize text-muted-foreground">Optional</Text>
      <Notes control={control} />
      <AddVoiceNote setValue={setValue} value={watch('voiceNote')} />
      <AddPhoto setValue={setValue} value={watch('photo')} />
      <Button onPress={submit}>
        <Text>{t('submit')}</Text>
      </Button>
      <Button
        onPress={() => {
          onCanceled?.();
          resetWithDefaults();
        }}>
        <Text>{t('cancel')}</Text>
      </Button>
    </View>
  );
}
