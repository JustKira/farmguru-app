import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { PullSync, PushSync } from '../database/sync';
import { storage } from '../mmkv/storage';

// Define types and interfaces for better TypeScript support
interface SyncContextType {
  lastSync: Date | null;
  triggerSync: ({ onSuccess }: { onSuccess?: () => void }) => Promise<void>;
  isSyncing: boolean;
}

interface SyncProviderProps {
  children: ReactNode;
}

const SYNC_KEY = 'lastSync';
const SYNC_TIME_KEY = 'syncTime';
const DEFAULT_SYNC_TIME = '02:00'; // Default sync time (2 AM)

// Create the SyncContext
const SyncContext = createContext<SyncContextType | undefined>(undefined);

// SyncProvider component
export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const { isConnected } = useNetInfo();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  // Function to get last sync time from MMKV storage
  const loadLastSyncTime = () => {
    const lastSyncTime = storage.getString(SYNC_KEY);
    if (lastSyncTime) {
      setLastSync(new Date(parseInt(lastSyncTime, 10)));
    }
  };

  // Function to save the sync time in MMKV storage
  const saveSyncTime = (time: Date) => {
    storage.set(SYNC_KEY, time.getTime().toString());
    setLastSync(time);
  };

  // Function to get the sync time
  const getSyncTime = (): string => {
    return storage.getString(SYNC_TIME_KEY) || DEFAULT_SYNC_TIME;
  };

  // Sync function to be triggered
  const triggerSync = async ({ onSuccess }: { onSuccess?: () => void } = {}): Promise<void> => {
    if (!isConnected) return console.log('No internet connection');
    if (isSyncing) return; // Prevent multiple syncs at once

    setIsSyncing(true);
    try {
      console.log('Starting sync...');
      await PushSync();
      await PullSync();
      saveSyncTime(new Date());
      console.log('Sync completed.');
      onSuccess?.();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Effect to load the last sync time on component mount
  useEffect(() => {
    loadLastSyncTime();
  }, []);

  // Effect to check and trigger sync daily at the specified time
  useEffect(() => {
    const checkAndSync = () => {
      const now = new Date();
      const [syncHour, syncMinute] = getSyncTime().split(':').map(Number);
      const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

      // Check if it's sync time and if we haven't synced today
      if (
        now.getHours() === syncHour &&
        now.getMinutes() === syncMinute &&
        (lastSyncDate.getDate() !== now.getDate() ||
          lastSyncDate.getMonth() !== now.getMonth() ||
          lastSyncDate.getFullYear() !== now.getFullYear())
      ) {
        router.replace('/sync');
        triggerSync();
      }
    };

    const interval = setInterval(checkAndSync, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isConnected, lastSync]);

  return (
    <SyncContext.Provider value={{ lastSync, triggerSync, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
};

// Custom hook to use SyncContext
export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
