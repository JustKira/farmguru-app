import * as Location from 'expo-location'; // Import expo-location
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Person } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      // Start watching position
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500, // Update every 0.5 seconds
          distanceInterval: 0, // Update regardless of distance change
        },
        (location: Location.LocationObject) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          });
        }
      );
    })();

    // Cleanup function to remove the subscription when component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

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
          {userLocation && (
            <Marker coordinate={userLocation} title="Your Location">
              <View className="flex size-8 items-center justify-center rounded-full bg-green-500">
                <Person weight="bold" />
              </View>
            </Marker>
          )}
        </MapView>
        <View
          style={{
            top: insets.top + 8,
          }}
          className="absolute right-2 z-50 rounded-full bg-background px-3 py-1">
          {userLocation?.accuracy ? (
            <Text className="font-black">
              {t('uncertain')}
              {userLocation?.accuracy.toFixed()}m
            </Text>
          ) : null}
        </View>
        <Button
          variant="secondary"
          onPress={() => {
            router.back();
          }}
          className="absolute bottom-2 left-2 z-50 flex flex-row  gap-2">
          <ArrowLeft size={24} />
          <Text className="text-center font-medium">{t('back')}</Text>
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
