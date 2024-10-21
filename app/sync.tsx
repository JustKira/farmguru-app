import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
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
  const [progress, setProgress] = useState<number>(0);

  const [completed, setCompleted] = useState(false);

  const getRandomDelay = useCallback((min: number, max: number) => {
    return Math.random() * (max - min) + min;
  }, []);

  useEffect(() => {
    let timeoutId: any;
    const animateProgress = () => {
      if (completed) return;

      //@ts-ignore
      setProgress((prevProgress) => {
        if (prevProgress >= 0.99) return 0.99;

        let nextProgress;
        let delay;

        if (prevProgress < 0.35) {
          nextProgress = Math.min(0.35, prevProgress + Math.random() * 0.1);
          delay = getRandomDelay(50, 150);
        } else if (prevProgress < 0.55) {
          nextProgress = Math.min(0.55, prevProgress + Math.random() * 0.03);
          delay = getRandomDelay(200, 500);
        } else if (prevProgress < 0.75) {
          nextProgress = Math.min(0.75, prevProgress + Math.random() * 0.01);
          delay = getRandomDelay(500, 1000);
        } else if (prevProgress < 0.99) {
          nextProgress = Math.min(0.99, prevProgress + Math.random() * 0.005);
          delay = getRandomDelay(1000, 2000);
        }

        timeoutId = setTimeout(animateProgress, delay);
        return nextProgress;
      });
    };

    animateProgress();

    return () => clearTimeout(timeoutId);
  }, [getRandomDelay]);

  useEffect(() => {
    (async () => {
      await triggerSync({
        onSuccess: async () => {
          setCompleted(true);

          setProgress(1);
          await new Promise((resolve) => setTimeout(resolve, 1000));

          queryClient.removeQueries();
          router.dismissAll();
          router.replace('/(app_drawer)');
        },
      });
    })();
  }, []);

  return (
    <View className="flex flex-1 items-center justify-between gap-2 px-4">
      <View />
      <View className="items-center gap-2">
        <Progress.Pie size={150} color="green" progress={progress} />
        <Text className="text-center">{t('messages.loading')}</Text>
      </View>
      <Button variant="default" size="lg" className="mb-4 w-full" onPress={() => signOut()}>
        <Text>{t('signout')}</Text>
      </Button>
    </View>
  );
}
