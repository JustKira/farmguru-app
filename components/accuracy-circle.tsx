import * as Location from 'expo-location';
import { Person } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Circle } from 'react-native-maps';

export const AccuracyCircle = () => {
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
  return userLocation ? (
    <>
      {userLocation.accuracy && userLocation.accuracy > 0 ? (
        <Circle
          center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
          radius={userLocation.accuracy}
          fillColor="rgba(0, 255, 0, 0.5)"
          strokeColor="rgba(0, 255, 0, 1)"
          strokeWidth={1}
          zIndex={2}
        />
      ) : (
        <></>
      )}
    </>
  ) : null;
};
