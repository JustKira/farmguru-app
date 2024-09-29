import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

import { Button } from './ui/button';
import { Text } from './ui/text';

const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

const PermissionRequester = ({ children }: { children: React.ReactNode }) => {
  const [hasPermission, setHasPermission] = useState(false);

  const checkAndRequestPermission = async () => {
    const permission = await requestLocationPermission();
    setHasPermission(permission);
  };

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  if (hasPermission) {
    return children;
  }

  return (
    <View>
      <Text>This app requires location permission to function properly.</Text>
      <Button onPress={checkAndRequestPermission}>
        <Text>Request Permission</Text>
      </Button>
    </View>
  );
};

export { PermissionRequester };
