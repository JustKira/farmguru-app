import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';

import { Text } from '~/components/ui/text';
import { useSync } from '~/lib/providers/sync-provider';

export default function Sync() {
  const router = useRouter();
  const { triggerSync } = useSync();
  const queryClient = useQueryClient();
  useEffect(() => {
    (async () => {
      await triggerSync({
        onSuccess: () => {
          queryClient.removeQueries();
          router.replace('/(app_drawer)');
        },
      });
    })();
  }, []);

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text>Loading...</Text>
      <Progress.Circle size={30} indeterminate />
    </View>
  );
}
