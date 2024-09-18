import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';

import { Text } from '~/components/ui/text';
import { appSync } from '~/lib/database/sync';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    appSync().then(() => {
      router.replace('/(app_drawer)');
    });
  }, []);

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text>Loading...</Text>
      <Progress.Circle size={30} indeterminate />
    </View>
  );
}
