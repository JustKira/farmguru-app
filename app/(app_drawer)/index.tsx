import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { View } from 'react-native';

import FarmMapItem from '~/components/farm-map-item';
import { Text } from '~/components/ui/text';
import { database } from '~/lib/database';
import Farm from '~/lib/database/model/farm';
import Field from '~/lib/database/model/field';

export default function Home() {
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
                      return <FarmMapItem field={field as Field} />;
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
