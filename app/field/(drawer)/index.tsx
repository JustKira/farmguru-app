import { Stack } from 'expo-router';
import { CloudSun, DropHalfBottom, Grains } from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

import { InfoCard, InfoCardProps } from '~/components/info-card';
import { Badge } from '~/components/ui/badge';
import { Text } from '~/components/ui/text';

export default function GeneralScreen() {
  const [items] = React.useState<InfoCardProps[]>([
    {
      cardHeader: {
        subTitle: 'Status',
        title: 'Weather',
      },
      icon: <CloudSun size={32} weight="duotone" color="white" />,
      iconClassName: 'bg-gray-600',
      children: (
        <>
          <View className="flex-row gap-1">
            <Badge variant="secondary">
              <Text>Cloudy</Text>
            </Badge>
            <Badge variant="destructive">
              <Text>Heatwave in 4 days</Text>
            </Badge>
          </View>
        </>
      ),
    },
    {
      cardHeader: {
        subTitle: 'Status',
        title: 'Crop Vitals',
      },
      icon: <Grains size={32} weight="fill" color="white" />,
      iconClassName: 'bg-lime-600',
    },
    {
      cardHeader: {
        subTitle: 'Status',
        title: 'Irrigation',
      },
      icon: <DropHalfBottom size={32} weight="fill" color="white" />,
      iconClassName: 'bg-blue-600',
    },
    {
      cardHeader: {
        subTitle: 'Status',
        title: 'Weather',
      },
      icon: <CloudSun size={32} weight="duotone" color="white" />,
      iconClassName: 'bg-gray-600',
    },
  ]);

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex flex-1 bg-muted/30 md:flex-row">
        <FlatGrid
          itemDimension={200}
          data={items}
          style={{
            flex: 1,
          }}
          maxItemsPerRow={2}
          spacing={8}
          renderItem={({ item }) => {
            const { children, ...rest } = item;
            return <InfoCard {...rest}>{children}</InfoCard>;
          }}
        />
        <View className="hidden gap-1 md:block md:w-[40%]">
          <View className="flex-1 rounded-xl border border-border bg-card/75 p-4" />
          <View className="flex-1 rounded-xl border border-border bg-card/75 p-4">
            <Text>Notifications</Text>
          </View>
        </View>
      </View>
    </>
  );
}
