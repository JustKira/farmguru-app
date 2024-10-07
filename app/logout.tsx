import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';

import { PushSync } from '~/lib/database/sync';
import { useAuth } from '~/lib/providers/auth-provider';

export default function Sync() {
  const auth = useAuth();

  const [progress, setProgress] = useState<number>(0);

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      await PushSync();

      setCompleted(true);

      setProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      auth.signOut();
    };

    performLogout();
  }, []);

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

  return (
    <View className="flex flex-1 items-center justify-center">
      <View className="items-center">
        <Progress.Pie size={150} color="green" progress={progress} />
      </View>
    </View>
  );
}
