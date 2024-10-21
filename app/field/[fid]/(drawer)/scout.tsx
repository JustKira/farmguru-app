import BottomSheet, { BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { Href, Stack, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { Warning } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AddScoutPoint, AddScoutPointHandles } from '~/components/forms/scout-point';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import ScoutPoint from '~/lib/database/model/scout-point';
import getSeverity, { Severity } from '~/lib/get-severity';
import useBackHandler from '~/lib/hooks/use-back-handler';
import { useGetFieldDetails } from '~/lib/react-query/get-field';
import { useGetFieldScoutPoints } from '~/lib/react-query/get-field-scout-points';

export default function ScoutScreen() {
  const params = useGlobalSearchParams();

  const addScoutPointRef = useRef<AddScoutPointHandles>(null);
  const [selectedScoutPoint, setSelectedScoutPoint] = useState<ScoutPoint | null>(null);

  const [rerender, setRerender] = useState(0);

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  const { data: scoutPoints, isLoading: isScoutPointsLoading } = useGetFieldScoutPoints(
    params.fid as string
  );

  const { t } = useTranslation();

  useEffect(() => {
    if (scoutPoints && params.scoutPointId) {
      const scoutPointId = params.scoutPointId as string;
      const scoutPoint = scoutPoints.find((sp) => sp.id === scoutPointId);
      if (scoutPoint) {
        setOpen(true);
        addScoutPointRef.current?.open(scoutPoint);
      }
    }
  }, [params]);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    addScoutPointRef.current?.reset();
    setOpen(false);
    setSelectedScoutPoint(null);
  }, [pathname]);

  useBackHandler(
    () => {
      if (open) {
        addScoutPointRef.current?.reset();
        return true;
      } else {
        return false;
      }
    },
    () => {
      router.push(`/field/${params.fid}/(drawer)/scout` as Href);
    }
  );

  // const handleClosePress = () => {
  //   bottomSheetRef.current?.close();
  //   setFormResetTrigger((prev) => !prev);
  //   setOpen(false);
  // };

  // const handleOpenPress = () => {
  //   bottomSheetRef.current?.expand();
  //   setOpen(true);
  // };

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
      {/* <TapInfo age={0} type={data.cropType} lastUpdate={data.lastCropUpdate} /> */}
      <BottomSheetModalProvider>
        <View className="flex flex-1 gap-2 p-4">
          <Text className="text-3xl font-black">{t('dash.scout.field_points')}</Text>

          <Button
            onPress={() => {
              setOpen(true);
              addScoutPointRef.current?.open();
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
                    setOpen(true);
                    addScoutPointRef.current?.open(item);
                  }}
                  className="mb-1.5 flex w-full flex-row justify-between gap-2 bg-muted p-2">
                  <View className="flex flex-row gap-2">
                    <Warning size={24} color={color} weight="bold" />
                    <Text className="text-lg font-medium">
                      {t(item.issueCategory.toLocaleLowerCase() as any)}
                    </Text>
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

        <AddScoutPoint
          onScoutPointAdded={() => {
            setRerender((prev) => prev + 1);
            setOpen(false);
          }}
          onCancel={() => {
            setOpen(false);
          }}
          ref={addScoutPointRef}
          field={data}
        />
      </BottomSheetModalProvider>
    </>
  );
}
