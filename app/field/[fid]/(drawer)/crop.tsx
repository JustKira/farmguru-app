import { field } from '@nozbe/watermelondb/decorators';
import { Stack, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

import { useGetFieldDetails } from '~/lib/react-query/get-field';
export default function CropScreen() {
  const params = useGlobalSearchParams();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Crop (Loading...)',
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
            headerTitle: 'Crop (Error)',
          }}
        />
        <View>
          <Text>Field not found</Text>
        </View>
      </>
    );
  }

  const items: FieldPercentagesProps[] = [
    {
      label: 'nutrients',
      percentages: data.nitrogenPercentage,
      colors: ['#ffff66', '#aad466', '#55aa66', '#007f66'],
    },
    {
      label: 'growth',
      percentages: data.growthPercentage,
      colors: ['#b9e176', '#c7e77f', '#d7ee89', '#e3f399'],
    },
    {
      label: 'stress',
      percentages: data.anomalyPercentage,
      colors: ['#8b0000', '#ffa500', '#ffff00', '#006837'],
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Crop',
        }}
      />
      <View className="flex flex-1 gap-2 p-4">
        <Text className="text-3xl font-black">Crop Analysis</Text>
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
            return <FieldPercentages {...rest} />;
          }}
        />
      </View>
    </>
  );
}

interface FieldPercentagesProps {
  label: string;
  percentages?: number[];
  colors?: string[];
}

function FieldPercentages({
  label,
  percentages,
  colors = ['#2E7D32', '#4CAF50', '#8BC34A', '#FFEB3B'], // Default colors
}: FieldPercentagesProps) {
  const levels = ['High', 'Medium', 'Low', 'Very Low'];

  const data = useMemo(() => {
    return levels.map((level, index) => ({
      level,
      percentage: percentages?.[index] ?? 0,
      color: colors[index],
    }));
  }, [percentages, colors]);

  return (
    <View className="my-2 rounded-lg p-2 ">
      {/* Sales Report and Amount */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold capitalize text-black">{label}</Text>
      </View>

      {/* Bars Section */}
      <View className="mt-3 space-y-2">
        {data.map(({ level, percentage, color }) => (
          <View key={level} className="flex-row items-center justify-between">
            {/* Level label */}
            <Text className="text-sm text-black" style={{ width: 70 }}>
              {level}
            </Text>
            {/* Background bar */}
            <View className="h-3 flex-1 rounded-full bg-muted">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </View>
            {/* Percentage label */}
            <Text
              className="text-right text-base font-medium text-muted-foreground"
              style={{ width: 50 }}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
