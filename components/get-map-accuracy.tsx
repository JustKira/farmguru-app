import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './ui/text';

export const GetMapAccuracy = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);

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

  const insets = useSafeAreaInsets();
  return (
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
  );
};
