import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';
import { useSync } from '~/lib/providers/sync-provider';

export default function Sync() {
  const router = useRouter();
  const { triggerSync } = useSync();
  const queryClient = useQueryClient();

  const { signOut } = useAuth();
  const { t } = useTranslation();

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
    <View className="flex flex-1 items-center justify-between gap-2 px-4">
      <View />
      <Progress.Circle size={75} color="green" indeterminate borderWidth={5} />
      <Button variant="default" size={'lg'} className="mb-4 w-full" onPress={() => signOut()}>
        <Text>{t('signout')}</Text>
      </Button>
    </View>
  );
}
