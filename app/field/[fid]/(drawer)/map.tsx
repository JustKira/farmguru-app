import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Overlay, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
        </MapView>
        <Button
          variant="secondary"
          onPress={() => {
            router.back();
          }}
          className="absolute bottom-2 left-2 z-50 flex flex-row  gap-2">
          <ArrowLeft size={24} />
          <Text className="text-center font-medium">Go Back</Text>
        </Button>
      </View>
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