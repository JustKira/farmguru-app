import { Stack, useGlobalSearchParams } from 'expo-router';
import { Grains, Plant, TrendDown, TrendUp } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

import { TapInfo } from '~/components/tap-info';
import { Text } from '~/components/ui/text';
import { useGetFieldDetails } from '~/lib/react-query/get-field';

export default function GeneralScreen() {
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

  const items: { label: string; value: number; icon: JSX.Element; isNegativeNature: boolean }[] = [
    {
      label: 'nutrients',
      value: data.trendNitrogen,
      icon: (
        <>
          <Grains size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
      isNegativeNature: false,
    },
    {
      label: 'growth',
      value: data.trendGrowth,
      icon: (
        <>
          <Plant size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
      isNegativeNature: false,
    },
    {
      label: 'stress',
      value: data.trendStress,
      icon: (
        <>
          <Plant size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
      isNegativeNature: true,
    },
  ];

  return (
    <>
      <Stack.Screen />
      <View className="flex flex-1 gap-6 p-4">
        <TapInfo plantDate={data.plantDate} type={data.cropType} lastUpdate={data.lastInfoUpdate} />
        <Text className="text-3xl font-black">{t('weekly_change')}</Text>
        <FlatGrid
          itemDimension={50}
          data={items}
          style={{
            flex: 1,
          }}
          maxItemsPerRow={2}
          spacing={10}
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
  const { t } = useTranslation();
  const isTrendingPositive = isNegativeNature ? value <= 0 : value >= 0;

  return (
    <View className="items- flex aspect-square justify-center gap-2 rounded-md border-2 border-muted bg-muted/50 p-4">
      {/* Icon on the left */}
      <View className="flex size-10 items-center justify-center rounded-lg">{icon}</View>
      <View className="flex-row items-center">
        <View>
          <Text className="text-2xl font-bold capitalize">{t(label as any)}</Text>
          <Text className="text-lg text-muted-foreground">{value.toFixed(2)}%</Text>
        </View>
      </View>
      {/* Trending indicator */}
      <View>
        {isTrendingPositive ? (
          <TrendUp weight="bold" size={48} color="rgb(74 222 128)" />
        ) : (
          <TrendDown size={48} weight="bold" color="red" />
        )}
      </View>
    </View>
  );
}
