import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';

import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';
import { useSync } from '~/lib/providers/sync-provider';

export default function Sync() {
  const auth = useAuth();
  useEffect(() => {
    auth.signOut();
  }, []);

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text>Loading...</Text>
      <Progress.Circle size={30} indeterminate />
    </View>
  );
}
