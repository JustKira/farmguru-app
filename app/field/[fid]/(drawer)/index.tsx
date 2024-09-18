import { Stack, useGlobalSearchParams } from 'expo-router';
import { Grains, Plant, TrendDown, TrendUp } from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

import { Text } from '~/components/ui/text';
import { useGetFieldDetails } from '~/lib/react-query/getField';

export default function GeneralScreen() {
  const params = useGlobalSearchParams();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'General',
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
            headerTitle: 'General (Error)',
          }}
        />
        <View>
          <Text>Field not found</Text>
        </View>
      </>
    );
  }

  const items: { label: string; value: number; icon: JSX.Element; isNegativeNature: boolean }[] = [
    {
      label: 'nutrients',
      value: data.trendNitrogen,
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
          <Grains size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
      isNegativeNature: false,
    },
    {
      label: 'growth',
      value: data.trendGrowth,
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
          <Plant size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
      isNegativeNature: false,
    },
    {
      label: 'stress',
      value: data.trendStress,
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
          <Plant size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
      isNegativeNature: true,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'General',
        }}
      />
      <View className="flex flex-1 gap-2 p-4">
        <Text className="text-3xl font-black">Weekly Changes</Text>
        <FlatGrid
          itemDimension={200}
          data={items}
          style={{
            flex: 1,
          }}
          maxItemsPerRow={2}
          spacing={6}
          renderItem={({ item }) => {
            const { ...rest } = item;
            return <TrendBlock {...rest} />;
          }}
        />
      </View>
    </>
  );
}

interface TrendBlockProps {
  value: number;
  icon: JSX.Element; // New icon prop
  isNegativeNature?: boolean;
  label: string;
}

function TrendBlock({ icon, isNegativeNature, label, value }: TrendBlockProps) {
  const isTrendingPositive = isNegativeNature ? value <= 0 : value >= 0;

  return (
    <View className="flex-row items-center justify-between rounded-md ">
      {/* Icon on the left */}
      <View className="flex-row items-center">
        <View className="mr-2">{icon}</View>
        <View>
          <Text className="text-2xl font-medium capitalize">{label}</Text>
          <Text className="text-lg text-muted-foreground">{value.toFixed(2)}%</Text>
        </View>
      </View>
      {/* Trending indicator */}
      <View>
        {isTrendingPositive ? (
          <TrendUp weight="bold" size={48} color="rgb(74 222 128)" />
        ) : (
          <TrendDown size={48} color="red" />
        )}
      </View>
    </View>
  );
}
