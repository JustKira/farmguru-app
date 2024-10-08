import { Stack, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import { TapInfo } from '~/components/tap-info';

import { useGetFieldDetails } from '~/lib/react-query/get-field';
export default function CropScreen() {
  const params = useGlobalSearchParams();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <>
        <Stack.Screen />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Stack.Screen />
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
      colors: ['#ffff66', '#aad466', '#55aa66', '#007f66'].reverse(),
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
      <Stack.Screen />
      <TapInfo plantDate={data.plantDate} type={data.cropType} lastUpdate={data.lastCropUpdate} />
      <View className="flex flex-1 gap-2 p-4">
        <Text className="text-3xl font-black">{t('crop_analytics')}</Text>
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

  const { t } = useTranslation();

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
        {/* @ts-ignore */}
        <Text className="text-xl font-bold capitalize text-black">{t(label)}</Text>
      </View>

      {/* Bars Section */}
      <View className="mt-3 space-y-2">
        {data.map(({ level, percentage, color }) => (
          <View key={level} className="flex-row items-center justify-between">
            {/* Level label */}
            <Text className="text-sm text-black" style={{ width: 70 }}>
              {/* @ts-ignore */}
              {t(level.toLowerCase())}
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
