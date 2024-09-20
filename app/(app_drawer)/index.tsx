import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon } from 'react-native-maps';

import { Text } from '~/components/ui/text';
import { database } from '~/lib/database';
import Farm from '~/lib/database/model/farm';

export default function Home() {
  const router = useRouter();

  const getFarms = useQuery({
    queryKey: ['farm', 'all'],
    queryFn: async () => {
      const data = await database.get<Farm>('farm').query();
      return data;
    },
  });

  // const getFarms = database.withChangesForTables(['farm']).;

  return (
    <>
      <Stack.Screen options={{ title: 'Farms', headerShown: true }} />
      <View className="flex flex-1 gap-2">
        <View className="flex-1 px-3.5">
          <FlashList
            data={getFarms.data}
            renderItem={({ item: farm }) => {
              return (
                <View className="w-full">
                  <Text className="mb-1.5 text-xl font-bold">{farm.name}</Text>
                  <FlashList
                    data={farm.fields}
                    estimatedItemSize={5}
                    renderItem={({ item: field }) => {
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
                            <Polygon
                              coordinates={coordinates}
                              strokeWidth={1}
                              strokeColor="rgb(64 165 120)"
                            />
                          </MapView>
                        </Pressable>
                      );
                    }}
                  />
                </View>
              );
            }}
            extraData={getFarms.isPending || getFarms.isLoading}
            estimatedItemSize={5}
          />
        </View>
      </View>
    </>
  );
}
