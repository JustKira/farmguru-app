import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon } from 'react-native-maps';

import { Text } from '~/components/ui/text';
import Field from '~/lib/database/model/field';

interface FieldItemProps {
  field: Field;
}

const FarmMapItem: React.FC<FieldItemProps> = ({ field }) => {
  const router = useRouter();

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
    <Pressable
      onPress={() => {
        router.push(`/field/${field.id}/(drawer)`);
      }}
      className="mb-4 flex h-[225px] w-full flex-col">
      <Text className="text-lg">{field.name}</Text>

      <MapView
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        scrollEnabled={false}
        pitchEnabled={false}
        zoomEnabled={false}
        style={{
          flex: 1,
        }}>
        <Polygon coordinates={coordinates} strokeWidth={1} strokeColor="rgb(64 165 120)" />
      </MapView>
    </Pressable>
  );
};

export default FarmMapItem;
