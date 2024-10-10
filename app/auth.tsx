import * as Linking from 'expo-linking';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useAuth } from '~/lib/providers/auth-provider';

export default function Details() {
  const params = useGlobalSearchParams();
  const url = Linking.useURL();

  const { oauth } = useAuth();

  useEffect(() => {
    console.log(params.accessToken, params.refreshToken);
    oauth({
      accessToken: params.accessToken as string,
      refreshToken: params.refreshToken as string,
    });
  }, [url]);

  return (
    <>
      <Stack.Screen options={{ title: 'Auth', headerShown: false }} />
      <View className="flex h-full items-center justify-center gap-8 px-4 py-2">
        <Text className="text-xl font-black uppercase">Authenticating...</Text>
      </View>
    </>
  );
}
