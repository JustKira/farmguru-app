import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Audio } from 'expo-av';
import * as IP from 'expo-image-picker';
import * as Location from 'expo-location';
import { nanoid } from 'nanoid';
import {
  Bug,
  CameraPlus,
  DotsThreeCircle,
  ImageSquare,
  ImagesSquare,
  MapPinArea,
  MapPinPlus,
  Microphone,
  Plant,
  QuestionMark,
  Virus,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Control, Controller, useForm, UseFormSetValue } from 'react-hook-form';
import { Image, Modal, Platform, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { z } from 'zod';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { Textarea } from '../ui/textarea';

import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { database } from '~/lib/database';
import Field from '~/lib/database/model/field';
import ScoutPoint from '~/lib/database/model/scout-point';
import { storage } from '~/lib/mmkv/storage';
import { getFieldsScoutPointsQueryKey } from '~/lib/react-query/get-field-scout-points';

const formSchema = z.object({
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
}: {
  field: Field;
  scoutPoint?: ScoutPoint;
  onCreateOrUpdate?: () => void;
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

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>();

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

        reset({
          issueCategory: 'insect',
          issueSeverity: 'early',
          date: new Date(),
        });
        onCreateOrUpdate?.();
        console.log('Scout point created');
      } catch (error) {
        console.error('Failed to create scout point', error);
      }
    }
    await queryClient.invalidateQueries({
      queryKey: getFieldsScoutPointsQueryKey(field.id),
    });
  });

  useEffect(() => {
    (async () => {
      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');

        setValue('location', {
          latitude: field.position[0],
          longitude: field.position[1],
        });

        return;
      }

      // Fetch user's current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      if (scoutPoint) {
        setValue('location', {
          latitude: scoutPoint.location[0],
          longitude: scoutPoint.location[1],
        });
      } else {
        setValue('location', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    if (scoutPoint) {
      setValue('issueCategory', scoutPoint.issueCategory);
      setValue('issueSeverity', scoutPoint.issueSeverity);
      setValue('date', scoutPoint.date);
      setValue('notes', scoutPoint.note);

      if (scoutPoint.voiceNote) {
        const file = storage.getString(scoutPoint.voiceNote);
        setValue('voiceNote', file);
      }

      if (scoutPoint.photos.length > 0) {
        const file = storage.getString(scoutPoint.photos[0]);
        setValue('photo', file);
      }
    } else {
      setValue('issueCategory', 'insect');
      setValue('issueSeverity', 'early');
      setValue('date', new Date());
    }
  }, [scoutPoint]);

  return (
    <View className="mb-2 gap-2">
      {scoutPoint?.id ? <Text className="text-xs">{scoutPoint?.id}</Text> : null}
      <SelectCategory setValue={setValue} value={watch('issueCategory')} />
      {errors.issueCategory && <Text>{errors.issueCategory.message?.toString()}</Text>}
      <SelectSeverity setValue={setValue} value={watch('issueSeverity')} />
      {errors.issueSeverity && <Text>{errors.issueSeverity.message?.toString()}</Text>}
      <LocationPicker value={watch('location')} setValue={setValue} field={field} />
      <Text>
        {watch('location') ? ( //if location matches userlocation then show text that reflect that
          <>
            {userLocation?.latitude === watch('location').latitude &&
            userLocation?.longitude === watch('location').longitude ? (
              <Badge>
                <Text>Your Current Location</Text>
              </Badge>
            ) : (
              <Badge>
                <Text>
                  lat:{watch('location').latitude.toFixed(4)}, lng{' '}
                  {watch('location').longitude.toFixed(4)}
                </Text>
              </Badge>
            )}
          </>
        ) : null}
      </Text>
      {errors.location && <Text>{errors.location.message?.toString()}</Text>}
      <DatePicker control={control} />
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
      <VoiceRecorder
        setValue={setValue}
        // value={watch('voiceNote')}
      />
      <AddPhoto setValue={setValue} value={watch('photo')} />
      <Button onPress={submit}>
        <Text>Submit</Text>
      </Button>
    </View>
  );
}

const SelectCategory = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: string;
}) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Select a category</Text>
      <Select
        onValueChange={(value) => (value ? setValue('issueCategory', value.value) : null)}
        value={{
          value,
          label: value?.charAt(0).toUpperCase() + value?.slice(1),
        }}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder="Select a fruit"
          />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            <SelectItem label="Insect" value="insect" icon={<Bug />}>
              Insect
            </SelectItem>
            <SelectItem label="Disease" value="disease" icon={<Virus />}>
              Disease
            </SelectItem>
            <SelectItem label="Growth" value="growth" icon={<Plant />}>
              Growth
            </SelectItem>
            <SelectItem label="Others" value="others" icon={<DotsThreeCircle />}>
              Others
            </SelectItem>
            <SelectItem label="DontKnow" value="dontknow" icon={<QuestionMark />}>
              DontKnow
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

const SelectSeverity = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: string;
}) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Select a severity</Text>
      <Select
        onValueChange={(value) => (value ? setValue('issueSeverity', value.value) : null)}
        value={{
          value,
          label: value?.charAt(0).toUpperCase() + value?.slice(1),
        }}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder="Select a severity"
          />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectGroup>
            <SelectLabel>Severity</SelectLabel>
            <SelectItem label="Early" value="early">
              Early
            </SelectItem>
            <SelectItem label="Moderate" value="moderate">
              Moderate
            </SelectItem>
            <SelectItem label="Late" value="late">
              Late
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

const Notes = ({ control }: { control: Control<z.infer<typeof formSchema>, any> }) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">notes</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Textarea placeholder="Add notes" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
        name="notes"
      />
    </View>
  );
};

const DatePicker = ({ control }: { control: Control<z.infer<typeof formSchema>, any> }) => {
  const [type, setType] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);
  return (
    <View className="flex w-full flex-row justify-between gap-2 pr-2">
      <Button
        onPress={() => {
          setType('date');
          setShow(true);
        }}
        variant="secondary"
        className="w-1/2">
        <Text>Select Date</Text>
      </Button>
      <Button
        onPress={() => {
          setType('time');
          setShow(true);
        }}
        variant="secondary"
        className="w-1/2">
        <Text>Select Time </Text>
      </Button>
      {show && (
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <DateTimePicker
              value={value}
              mode={type}
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShow(false);
                onChange(selectedDate);
              }}
            />
          )}
          name="date"
        />
      )}
    </View>
  );
};

const VoiceRecorder = ({ setValue }: { setValue: UseFormSetValue<z.infer<typeof formSchema>> }) => {
  const [recording, setRecording] = useState<Audio.Recording>();

  async function startRecording() {
    try {
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== 'granted') {
        console.log('Audio recording permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();

    if (uri) setValue('voiceNote', uri);
  }

  return (
    <View className="flex w-full flex-row justify-between gap-2 pr-2">
      <Button
        variant="secondary"
        className="w-full"
        onPress={async () => {
          if (recording) {
            stopRecording();
          } else {
            await startRecording();
          }
        }}>
        <View className="flex flex-row gap-2">
          {recording ? (
            <Microphone size={24} weight="bold" color="red" />
          ) : (
            <Microphone size={24} weight="bold" />
          )}
          <Text>{recording ? 'Stop Recording' : 'Record Voice Note'}</Text>
        </View>
      </Button>
    </View>
  );
};

const LocationPicker = ({
  field,
  setValue,
  value,
}: {
  field: Field;
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: {
    latitude: number;
    longitude: number;
  };
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const initialRegion = {
    latitude: field.position[0],
    longitude: field.position[1],
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const coordinates = field.location.map((loc) => ({
    latitude: loc[0],
    longitude: loc[1],
  }));

  return (
    <>
      <View className="flex w-full flex-row justify-between gap-2 pr-2">
        <Button
          variant="secondary"
          className="w-full"
          onPress={() => {
            setModalVisible(true);
          }}>
          <View className="flex flex-row gap-2">
            <MapPinArea size={24} weight="bold" />
            <Text>Pick Location</Text>
          </View>
        </Button>
      </View>
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View className="flex-1">
          <MapView
            initialRegion={initialRegion}
            provider={PROVIDER_GOOGLE}
            mapType="satellite"
            onPress={(event) => {
              setValue('location', {
                latitude: event.nativeEvent.coordinate.latitude,
                longitude: event.nativeEvent.coordinate.longitude,
              });
            }}
            style={{
              flex: 1,
            }}>
            {value?.latitude && value?.longitude ? (
              <Marker
                coordinate={{
                  latitude: value.latitude,
                  longitude: value.longitude,
                }}>
                <View className="flex size-8 items-center justify-center rounded-full bg-green-500">
                  <MapPinPlus weight="bold" />
                </View>
              </Marker>
            ) : null}

            <Polygon coordinates={coordinates} strokeWidth={4} strokeColor="rgb(64 165 120)" />
          </MapView>
          <View className="absolute bottom-2 left-2 flex flex-row gap-2">
            <Button
              variant="secondary"
              onPress={() => {
                setValue('location', {
                  latitude: field.position[0],
                  longitude: field.position[1],
                });
              }}>
              <Text>Reset Location</Text>
            </Button>
            <Button
              onPress={() => {
                setModalVisible(false);
              }}>
              <Text>Confirm Location</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};

const AddPhoto = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value?: string;
}) => {
  const openCamera = async () => {
    const permissionResult = await IP.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    const result = await IP.launchCameraAsync();
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setValue('photo', uri);
    }
  };

  const pickImage = async () => {
    const result = await IP.launchImageLibraryAsync({
      mediaTypes: IP.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setValue('photo', uri);
    }
  };

  const [viewImageModal, setViewImageModal] = useState(false);

  return (
    <View className="flex w-full justify-between gap-2 pr-2">
      <Popover className="w-full">
        <PopoverTrigger asChild className="w-full">
          <Button variant="secondary" className="w-full">
            <View className="flex flex-row gap-2">
              <ImageSquare size={24} weight="bold" />
              {value ? <Text>Change Image</Text> : <Text>Add Image</Text>}
            </View>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full gap-2" side={Platform.OS === 'web' ? 'bottom' : 'top'}>
          <View className="flex w-full flex-row gap-2 pr-2">
            <Button size="lg" className="w-1/2" onPress={() => openCamera()}>
              <View className="flex flex-row gap-2">
                <CameraPlus size={24} weight="bold" color="white" />
                <Text>Camera</Text>
              </View>
            </Button>
            <Button size="lg" className="w-1/2" onPress={() => pickImage()}>
              <View className="flex flex-row gap-2">
                <ImagesSquare size={24} weight="bold" color="white" />
                <Text>Gallery</Text>
              </View>
            </Button>
          </View>
          {value ? (
            <Button
              size="lg"
              variant="ghost"
              className="w-full"
              onPress={() => setViewImageModal(true)}>
              <View className="flex flex-row gap-2">
                <ImagesSquare size={24} weight="bold" />
                <Text>View Selected Image</Text>
              </View>
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
      {viewImageModal && value ? (
        <Modal
          animationType="slide"
          visible={viewImageModal}
          onRequestClose={() => {
            setViewImageModal(!viewImageModal);
          }}>
          <View className="w-full flex-1 items-center justify-center gap-2  p-4">
            <View className="rounded-lg bg-white">
              <Image source={{ uri: value }} className="h-[400px] w-[400px]" />
            </View>
            <Button className="w-full" onPress={() => setViewImageModal(false)}>
              <Text>Close</Text>
            </Button>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};
