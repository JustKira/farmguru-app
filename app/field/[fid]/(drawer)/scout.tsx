import BottomSheet, { BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { Warning } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AddScoutPoint } from '~/components/forms/scout-point';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import ScoutPoint from '~/lib/database/model/scout-point';
import getSeverity, { Severity } from '~/lib/get-severity';
import { useGetFieldDetails } from '~/lib/react-query/get-field';
import { useGetFieldScoutPoints } from '~/lib/react-query/get-field-scout-points';

export default function ScoutScreen() {
  const params = useGlobalSearchParams();

  const [selectedScoutPoint, setSelectedScoutPoint] = useState<ScoutPoint | null>(null);

  const [rerender, setRerender] = useState(0);

  const { data, isLoading } = useGetFieldDetails(params.fid as string);
  const { data: scoutPoints, isLoading: isScoutPointsLoading } = useGetFieldScoutPoints(
    params.fid as string
  );

  const { t } = useTranslation();

  useEffect(() => {
    const scoutPointId = params.scoutPointId as string;

    if (scoutPointId) {
      setSelectedScoutPoint(scoutPoints?.find((sp) => sp.id === scoutPointId) ?? null);
      handleOpenPress();
    }
  }, [params]);

  // Model
  const snapPoints = useMemo(() => ['100%'], []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleClosePress = () => bottomSheetRef.current?.close();

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  if (isLoading || isScoutPointsLoading) {
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

  return (
    <>
      <Stack.Screen />
      <BottomSheetModalProvider>
        <View className="flex flex-1 gap-2 p-4">
          <Text className="text-3xl font-black">{t('dash.scout.field_points')}</Text>

          <Button
            onPress={() => {
              setSelectedScoutPoint(null);
              handleOpenPress();
            }}>
            <Text> {t('dash.scout.add_marker')}</Text>
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
                <Pressable
                  onPress={() => {
                    setSelectedScoutPoint(item);
                    handleOpenPress();
                  }}
                  className="mb-1.5 flex w-full flex-row justify-between gap-2 bg-muted p-2">
                  <View className="flex flex-row gap-2">
                    <Warning size={24} color={color} weight="bold" />
                    <Text className="text-lg font-medium">{item.issueCategory}</Text>
                  </View>
                  <Text className="text-sm font-medium">
                    {format(item.date, 'EE ,d MMM yyy HH:mm aaa')}
                  </Text>
                </Pressable>
              );
            }}
            extraData={rerender}
            estimatedItemSize={5}
          />
        </View>

        <BottomSheet index={-1} snapPoints={snapPoints} ref={bottomSheetRef}>
          <BottomSheetView className="flex-1 px-2">
            <ScrollView>
              <AddScoutPoint
                onCreateOrUpdate={() => {
                  handleClosePress();
                  setRerender((prev) => prev + 1);
                }}
                field={data}
                scoutPoint={selectedScoutPoint ?? undefined}
              />
              <Button onPress={handleClosePress}>
                <Text>{t('cancel')}</Text>
              </Button>
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </BottomSheetModalProvider>
    </>
  );
}
