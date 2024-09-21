import BottomSheet, { BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { Clock, Drop, DropHalf, DropHalfBottom, Plant } from 'phosphor-react-native';
import { useMemo, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

import AddIrrigationPoint from '~/components/forms/irrigation-point';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useGetFieldDetails } from '~/lib/react-query/get-field';

export default function IrrigationScreen() {
  const params = useGlobalSearchParams();
  const snapPoints = useMemo(() => ['100%'], []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Irrigation',
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
            headerTitle: 'Irrigation (Error)',
          }}
        />
        <View>
          <Text>Field not found</Text>
        </View>
      </>
    );
  }
  const handleClosePress = () => bottomSheetRef.current?.close();

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const items: { label: string; value: string; icon: JSX.Element }[] = [
    {
      label: 'Soil moister root zone',
      value: data.soilMoisture ? `${data.soilMoisture} %` : '0 %',
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg border-green-400 bg-green-400/15">
          <DropHalfBottom size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
    },
    {
      label: 'Days to Wilting',
      value: data.daysToWilting ? `${data.daysToWilting} days` : '0 days',
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg border-green-400 bg-green-400/15">
          <Plant size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
    },
    {
      label: 'Next Irrigation',
      value: data.nextIrrigation ? `${data.nextIrrigation} days` : '0 days',
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
          <Drop size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
    },
    {
      label: 'Advised Irrigation Duration',
      value: data.daysToWilting ? `${data.daysToWilting} hours` : '0 hours',
      icon: (
        <View className="flex size-16 items-center justify-center rounded-lg border-green-400 bg-green-400/15">
          <Clock size={32} color="rgb(74 222 128)" />
        </View>
      ), // Pass the icon
    },
    // {
    //   label: 'growth',
    //   value: data.trendGrowth,
    //   icon: (
    //     <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
    //       <Drop size={32} color="rgb(74 222 128)" />
    //     </View>
    //   ), // Pass the icon
    // },
    // {
    //   label: 'stress',
    //   value: data.trendStress,
    //   icon: (
    //     <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
    //       <Drop size={32} color="rgb(74 222 128)" />
    //     </View>
    //   ), // Pass the icon
    // },
  ];

  if (!data) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Irrigation (Error)',
          }}
        />
        <View>
          <Text>Field not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Irrigation',
        }}
      />
      <BottomSheetModalProvider>
        <View className="flex flex-1 gap-2 p-4">
          <Text className="text-3xl font-black">Irrigation Info</Text>
          <Button
            onPress={() => {
              handleOpenPress();
            }}
            variant="secondary">
            <Text>Add Irrigation</Text>
          </Button>
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
              return <InfoBlock {...rest} />;
            }}
          />
        </View>
        <BottomSheet index={-1} snapPoints={snapPoints} ref={bottomSheetRef}>
          <BottomSheetView className="flex-1 px-2">
            <ScrollView>
              <AddIrrigationPoint
                onCreateSuccess={() => {
                  handleClosePress();
                }}
                fieldId={data.id}
              />
              <Button onPress={handleClosePress}>
                <Text>Close</Text>
              </Button>
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </BottomSheetModalProvider>
    </>
  );
}

interface InfoBlockProps {
  value: string;
  icon: JSX.Element; // New icon prop
  label: string;
}

function InfoBlock({ icon, label, value }: InfoBlockProps) {
  return (
    <View className="flex-row items-center justify-between rounded-md ">
      {/* Icon on the left */}
      <View className="flex-row items-center">
        <View className="mr-2">{icon}</View>
        <View>
          <Text className="text-2xl font-medium capitalize">{label}</Text>
          <Text className="text-lg text-muted-foreground">{value}</Text>
        </View>
      </View>
      {/* Trending indicator */}
    </View>
  );
}
