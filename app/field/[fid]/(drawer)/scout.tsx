import BottomSheet, { BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { Warning } from 'phosphor-react-native';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';

import { AddScoutPoint } from '~/components/forms/add-scout-point';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import getSeverity, { Severity } from '~/lib/get-severity';
import { useGetFieldDetails } from '~/lib/react-query/get-field';
import { useGetFieldScoutPoints } from '~/lib/react-query/get-field-scout-points';

export default function ScoutScreen() {
  const params = useGlobalSearchParams();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);
  const { data: scoutPoints, isLoading: isScoutPointsLoading } = useGetFieldScoutPoints(
    params.fid as string
  );

  // Model
  const snapPoints = useMemo(() => ['100%'], []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleClosePress = () => bottomSheetRef.current?.close();

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  if (isLoading || isScoutPointsLoading) {
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Scout',
        }}
      />
      <BottomSheetModalProvider>
        <View className="flex flex-1 gap-2 p-4">
          <Text className="text-3xl font-black">Scout Points</Text>

          <Button onPress={handleOpenPress}>
            <Text>Add Scout Point</Text>
          </Button>

          <FlashList
            data={scoutPoints ?? []}
            renderItem={({ item }) => {
              const color = item.issueSeverity.toLocaleLowerCase()
                ? getSeverity(item.issueSeverity.toLocaleLowerCase() as Severity, {
                    late: () => 'red',
                    moderate: () => 'orange',
                    early: () => 'yellow',
                  })
                : 'yellow';

              return (
                <View className="mb-1.5 flex w-full flex-row justify-between gap-2 bg-muted p-2">
                  <View className="flex flex-row gap-2">
                    <Warning size={24} color={color} weight="bold" />
                    <Text className="text-lg font-medium">{item.issueCategory}</Text>
                  </View>
                  <Text className="text-sm font-medium">
                    {format(item.date, 'EE ,d MMM yyy HH:mm aaa')}
                  </Text>
                </View>
              );
            }}
            extraData={isScoutPointsLoading}
            estimatedItemSize={5}
          />
        </View>

        <BottomSheet
          index={-1}
          snapPoints={snapPoints}
          ref={bottomSheetRef}
          onChange={handleSheetChanges}>
          <BottomSheetView className="flex-1 px-2">
            <AddScoutPoint />
            <Button onPress={handleClosePress}>
              <Text>Close</Text>
            </Button>
          </BottomSheetView>
        </BottomSheet>
      </BottomSheetModalProvider>
    </>
  );
}
