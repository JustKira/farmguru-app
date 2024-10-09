import BottomSheet, { BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { Href, Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { Clock, Drop, DropHalf, DropHalfBottom, Plant } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

import AddIrrigationPoint from '~/components/forms/irrigation-point';
import { TapInfo } from '~/components/tap-info';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import useBackHandler from '~/lib/hooks/use-back-handler';
import { useGetFieldDetails } from '~/lib/react-query/get-field';

export default function IrrigationScreen() {
  const params = useGlobalSearchParams();
  const snapPoints = useMemo(() => ['100%'], []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const { t } = useTranslation();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);

  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    bottomSheetRef.current?.close();
  }, [router]);

  useBackHandler(
    () => {
      if (open) {
        handleClosePress();
        return true;
      } else {
        return false;
      }
    },
    () => {
      router.replace(`/field/${params.fid}/(drawer)/irrigation` as Href);
    }
  );

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setOpen(false);
  };

  const handleOpenPress = () => {
    bottomSheetRef.current?.expand();
    setOpen(true);
  };

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

  const items: { label: string; value: string; icon: JSX.Element }[] = [
    {
      label: t('dash.irr.soil_moisture_root_zone'),
      value: data.soilMoisture ? `${data.soilMoisture} %` : '0 %',
      icon: (
        <>
          <DropHalfBottom size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
    },
    {
      label: t('days_to_wilting'),
      value: data.daysToWilting
        ? `${data.daysToWilting}  ${t('global.days')}`
        : `0 ${t('global.days')}`,
      icon: (
        <>
          <Plant size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
    },
    {
      label: t('next_irrigation'),
      value: data.nextIrrigation
        ? `${data.nextIrrigation} ${t('global.days')}`
        : `0 ${t('global.days')}`,
      icon: (
        <>
          <Drop size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
    },
    {
      label: t('days_to_wilting'),
      value: data.daysToWilting
        ? `${data.daysToWilting} ${t('global.hours')}`
        : `0 ${t('global.hours')}`,
      icon: (
        <>
          <Clock size={48} color="rgb(74 222 128)" />
        </>
      ), // Pass the icon
    },
    // {
    //   label: 'growth',
    //   value: data.trendGrowth,
    //   icon: (
    //     <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
    //       <Drop size={48} color="rgb(74 222 128)" />
    //     </View>
    //   ), // Pass the icon
    // },
    // {
    //   label: 'stress',
    //   value: data.trendStress,
    //   icon: (
    //     <View className="flex size-16 items-center justify-center rounded-lg bg-green-400/15">
    //       <Drop size={48} color="rgb(74 222 128)" />
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
      <TapInfo plantDate={data.plantDate} type={data.cropType} lastUpdate={data.lastCropUpdate} />
      <BottomSheetModalProvider>
        <View className="flex flex-1 gap-2 p-4">
          {/* <Text className="text-3xl font-black">Irrigation Info</Text> */}
          <Text className="text-3xl font-medium">{t('water_field_status')}</Text>
          <Button
            onPress={() => {
              handleOpenPress();
            }}
            variant="secondary">
            <Text> {`${t('actions.add')} ${t('nav.irrigation')}`}</Text>
          </Button>
          <FlatGrid
            itemDimension={50}
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
                <Text>{t('cancel')}</Text>
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
    <View className=" gap- flex aspect-square  justify-between rounded-md border-2 border-muted bg-muted/50 px-4 py-8">
      {/* Icon on the left */}
      <View className="flex size-10 items-center justify-center rounded-lg">{icon}</View>
      <View>
        <Text className="text-xl font-bold capitalize">{label}</Text>
        <Text className="text-2xl text-muted-foreground">{value}</Text>
      </View>
    </View>
  );
}
