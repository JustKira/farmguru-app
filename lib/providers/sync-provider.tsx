import { useNetInfo } from '@react-native-community/netinfo';
import { format, isAfter, startOfDay } from 'date-fns';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';

import { PullSync, PushSync } from '../database/sync';
import { storage } from '../mmkv/storage';

interface SyncContextType {
  lastSync: Date | null;
  triggerSync: ({ onSuccess }: { onSuccess?: () => void }) => Promise<void>;
  isSyncing: boolean;
}

interface SyncProviderProps {
  children: ReactNode;
}

const LAST_SYNC_KEY = 'lastSync';
const SYNC_HOUR = 4; // 4 AM

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const { isConnected } = useNetInfo();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const loadLastSyncTime = useCallback(() => {
    const lastSyncTime = storage.getString(LAST_SYNC_KEY);
    if (lastSyncTime) {
      const parsedDate = new Date(parseInt(lastSyncTime, 10));
      console.log('Loaded last sync time:', format(parsedDate, 'yyyy-MM-dd HH:mm:ss'));
      setLastSync(parsedDate);
    } else {
      console.log('No last sync time found');
    }
  }, []);

  const saveSyncTime = useCallback((time: Date) => {
    storage.set(LAST_SYNC_KEY, time.getTime().toString());
    setLastSync(time);
    console.log('Saved sync time:', format(time, 'yyyy-MM-dd HH:mm:ss'));
  }, []);

  const triggerSync = useCallback(
    async ({ onSuccess }: { onSuccess?: () => void } = {}): Promise<void> => {
      if (!isConnected) {
        console.log('No internet connection, sync aborted');
        return;
      }
      if (isSyncing) {
        console.log('Sync already in progress, aborting');
        return;
      }
      setIsSyncing(true);
      try {
        console.log('Starting sync...');
        await PushSync();
        await PullSync();
        const newSyncTime = new Date();
        saveSyncTime(newSyncTime);
        console.log('Sync completed at:', format(newSyncTime, 'yyyy-MM-dd HH:mm:ss'));
        onSuccess?.();
      } catch (error) {
        console.error('Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    },
    [isConnected, isSyncing, saveSyncTime]
  );

  useEffect(() => {
    loadLastSyncTime();
  }, [loadLastSyncTime]);

  useEffect(() => {
    const checkAndSync = () => {
      const now = new Date();
      const lastSyncDate = lastSync || new Date(0);

      console.log('Checking sync at', format(now, 'yyyy-MM-dd HH:mm:ss'));
      console.log('Last sync:', lastSync ? format(lastSync, 'yyyy-MM-dd HH:mm:ss') : 'Never');

      const isNewDay = isAfter(startOfDay(now), startOfDay(lastSyncDate));
      const isAfterSyncHour = now.getHours() >= SYNC_HOUR;

      console.log('Is new day:', isNewDay);
      console.log('Is after sync hour:', isAfterSyncHour);

      if (isNewDay && isAfterSyncHour) {
        console.log('Conditions met, triggering sync...');
        router.replace('/sync');
        triggerSync();
      } else {
        console.log('Conditions not met, sync not triggered');
      }
    };

    const interval = setInterval(checkAndSync, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isConnected, lastSync, triggerSync, router]);

  return (
    <SyncContext.Provider value={{ lastSync, triggerSync, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
