import { MapPin, MapPinArea, MapPinPlus, Person } from 'phosphor-react-native';
import { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Modal, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { z } from 'zod';

import { formSchema } from '.';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import Field from '~/lib/database/model/field';

export const AddLocation = ({
  field,
  setValue,
  isLocationLoading,
  value,
  userLocation,
}: {
  field: Field;
  isLocationLoading: boolean;
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: {
    latitude: number;
    longitude: number;
  };
  userLocation: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null;
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

  const { t } = useTranslation();

  return (
    <>
      <View className="flex w-full flex-row justify-between gap-2 pr-2">
        <Button
          variant="secondary"
          className="w-full"
          disabled={isLocationLoading}
          onPress={() => {
            setModalVisible(true);
          }}>
          <View className="flex flex-row gap-2">
            <MapPinArea size={24} weight="bold" />
            <Text>
              {isLocationLoading
                ? t('messages.loading')
                : t('select', {
                    name: t('location'),
                  })}
            </Text>
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

            {userLocation ? <Marker coordinate={userLocation} pinColor="#4287f5" /> : null}

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
              <Text>
                {t('reset', {
                  name: t('location'),
                })}
              </Text>
            </Button>
            <Button
              onPress={() => {
                setModalVisible(false);
              }}>
              <Text>
                {t('confirm', {
                  name: t('location'),
                })}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};
