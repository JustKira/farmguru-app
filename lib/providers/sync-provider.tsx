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
const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const DEBUG_HOURS = 3 * 60 * 1000; // 1 minute in milliseconds

const SYNC_DURATION = DEBUG_HOURS;
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

  // Sync function to be triggered
  const triggerSync = async ({ onSuccess }: { onSuccess?: () => void } = {}): Promise<void> => {
    // check if can sync based on connection
    if (!isConnected) return console.log('No internet connection');

    if (isSyncing) return; // Prevent multiple syncs at once
    setIsSyncing(true);

    try {
      // Simulate a sync operation (replace this with actual logic)
      console.log('Syncing data...');

      await PushSync();

      await PullSync();
      // After successful sync, save the current time
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

  // Effect to trigger sync if conditions are met
  useEffect(() => {
    if (!isConnected) return; // Do not sync if not connected

    const now = new Date();

    // Check if lastSync exists and if more than 12 hours have passed
    if (!lastSync || now.getTime() - lastSync.getTime() > SYNC_DURATION) {
      router.replace('/sync');
    }
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
