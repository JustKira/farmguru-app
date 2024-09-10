import { synchronize } from '@nozbe/watermelondb/sync';
import { watermelondb } from './database';
async function appSync() {
  await synchronize({
    database: watermelondb,
    pullChanges: async ({ lastPulledAt }) => {
      return {
        changes: {},
        timestamp: 0,
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {},
  });
}
