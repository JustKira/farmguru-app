import { Stack, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

import { Text } from '~/components/ui/text';
import { useGetFieldDetails } from '~/lib/react-query/getField';

export default function MapScreen() {
  const params = useGlobalSearchParams();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Map (Loading...)',
          }}
        />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Map (Error)',
          }}
        />
        <View>
          <Text>Field not found</Text>
        </View>
      </>
    );
  }

  const initialRegion = {
    latitude: data.position[0],
    longitude: data.position[1],
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const coordinates = data.location.map((loc) => ({
    latitude: loc[0],
    longitude: loc[1],
  }));

  console.log(data.defaultOverlayKey);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1">
        <MapView
          initialRegion={initialRegion}
          style={{ width: '100%', height: '100%' }}
          provider={PROVIDER_GOOGLE}
          mapType="satellite">
          <Polygon coordinates={coordinates} strokeWidth={4} strokeColor="rgb(64 165 120)" />
        </MapView>
      </View>
    </>
  );
}
