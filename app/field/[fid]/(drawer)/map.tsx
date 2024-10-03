import { Href, Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import MapView, { Marker, Overlay, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GetMapAccuracy } from '~/components/get-map-accuracy';
import { MapTracker } from '~/components/map-tracker';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import useBackHandler from '~/lib/hooks/use-back-handler';
import { storage } from '~/lib/mmkv/storage';
import { useGetFieldDetails } from '~/lib/react-query/get-field';
import { useGetFieldScoutPoints } from '~/lib/react-query/get-field-scout-points';

type MapTypes = 'general' | 'crop' | 'irrigation' | 'scout';

export default function MapScreen() {
  const params = useGlobalSearchParams();

  const router = useRouter();

  const { data, isLoading } = useGetFieldDetails(params.fid as string);
  const { data: scoutPoints, isLoading: isScoutPointsLoading } = useGetFieldScoutPoints(
    params.fid as string
  );
  const insets = useSafeAreaInsets();

  const type = params.type as MapTypes;

  const [overlayKey, setOverlayKey] = useState<string | null>(null);

  const { t } = useTranslation();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  useBackHandler(
    () => {
      return true;
    },
    () => {
      let path = '';

      switch (type) {
        case 'crop':
          path = '/crop';
          break;
        case 'irrigation':
          path = '/irrigation';
          break;
        case 'scout':
          path = '/scout';
          break;
        default:
          path = '/';
          break;
      }

      router.navigate(`/field/${params.fid}/(drawer)${path}` as Href);
    }
  );

  useEffect(() => {
    if (data !== undefined && isLoading === false) {
      switch (type) {
        case 'general':
          setOverlayKey(data.defaultOverlayKey);
          break;
        case 'crop':
          setOverlayKey(data.anomalyOverlayKey);
          break;
        case 'irrigation':
          setOverlayKey(data.irrigationOverlayKey);
          break;
        case 'scout':
          setOverlayKey(data.defaultOverlayKey);
          break;
      }
    }
  }, [type, isLoading, data]);

  if (isLoading || isScoutPointsLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Map (Loading...)',
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
            headerTitle: 'Map (Error)',
          }}
        />
        <View>
          <Text>Field not found</Text>
        </View>
      </>
    );
  }

  const initialRegion = {
    latitude: data.position[0],
    longitude: data.position[1],
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const coordinates = data.location.map((loc) => ({
    latitude: loc[0],
    longitude: loc[1],
  }));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {/* <LocationProvider timeInterval={2500}> */}
      <View className="flex-1">
        {type === 'crop' ? (
          <Select
            onValueChange={(v) => {
              if (v?.value) {
                switch (v.value) {
                  case 'anomaly':
                    setOverlayKey(data.anomalyOverlayKey);
                    break;
                  case 'nitrogen':
                    setOverlayKey(data.nitrogenOverlayKey);
                    break;
                  case 'growth':
                    setOverlayKey(data.growthOverlayKey);
                    break;
                }
              }
            }}
            defaultValue={{ value: 'anomaly', label: 'Stress' }}>
            <SelectTrigger
              className="absolute z-50 w-[250px]"
              style={{ top: insets.top + 4, bottom: insets.bottom + 4, left: 12, right: 12 }}>
              <SelectValue
                className="native:text-lg text-sm text-foreground"
                placeholder="Select a fruit"
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className="w-[250px]">
              <SelectGroup>
                <SelectItem label="Stress" value="anomaly">
                  Stress
                </SelectItem>
                <SelectItem label="Nitrogen" value="nitrogen">
                  Nitrogen
                </SelectItem>

                <SelectItem label="Growth" value="growth">
                  Growth
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}
        <MapView
          initialRegion={initialRegion}
          style={{ width: '100%', height: '100%' }}
          provider={PROVIDER_GOOGLE}
          mapType="satellite">
          <MapOverlay
            overlayKey={overlayKey}
            bound={[
              [data.positionMin[0], data.positionMin[1]],
              [data.positionMax[0], data.positionMax[1]],
            ]}
          />

          {type === 'scout' ? (
            <>
              {scoutPoints?.map((point) => {
                const latlng = point.location;

                return (
                  <Marker
                    onPress={() => {
                      console.log('Pressed');
                      router.push(
                        //@ts-ignore
                        `/field/${params.fid as string}/(drawer)/scout?scoutPointId=${point.id}`
                      );
                    }}
                    key={point.id}
                    coordinate={{
                      latitude: latlng[0],
                      longitude: latlng[1],
                    }}
                  />
                );
              })}
            </>
          ) : null}
          <Polygon coordinates={coordinates} strokeWidth={4} strokeColor="rgb(64 165 120)" />
          <MapTracker />
        </MapView>
        <GetMapAccuracy />
        <Button
          variant="secondary"
          onPress={() => {
            let path: string;

            switch (type) {
              case 'crop':
                path = '/crop';
                break;
              case 'irrigation':
                path = '/irrigation';
                break;
              case 'scout':
                path = '/scout';
                break;
              default:
                path = '/';
                break;
            }

            console.log(path);

            router.navigate(`/field/${params.fid as string}/(drawer)${path}` as Href);
          }}
          className="absolute bottom-2 left-2 z-50 flex flex-row  gap-2">
          <ArrowLeft size={24} />
          <Text className="text-center font-medium">{t('back')}</Text>
        </Button>
      </View>
      {/* </LocationProvider> */}
    </>
  );
}

const MapOverlay = ({
  bound,
  overlayKey,
}: {
  overlayKey?: string | null;
  bound: [[number, number], [number, number]];
}) => {
  if (!overlayKey) return <></>;
  const overlay = storage.getString(overlayKey);
  if (overlay === null) return <></>;
  return <Overlay bounds={bound} image={{ uri: overlay }} />;
};
