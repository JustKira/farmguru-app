import { synchronize } from '@nozbe/watermelondb/sync';
import * as FileSystem from 'expo-file-system';

import { axiosClient } from '~/lib/axios-client';
import { database } from '~/lib/database';
import uploadStorage from '~/lib/database/sync/helper';
import { storage } from '~/lib/mmkv/storage';

export async function PushSync() {
  await synchronize({
    database,
    pullChanges: async () => {
      return {
        changes: {},
        timestamp: new Date().getTime(),
        experimentalStrategy: 'replacement',
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log('Pushing Changes');

      const syncScoutPoint = async (scoutPoint: any, isUpdate = false) => {
        const scoutPointToSync: ScoutPointToSync = {
          FieldId: scoutPoint.field_id,
          Date: new Date(scoutPoint.date).toISOString(),
          IssueCategory: scoutPoint.issue_category,
          IssueSeverity: scoutPoint.issue_severity,
          Location: JSON.parse(scoutPoint.location) as [number, number],
          Notes: scoutPoint.note,
          Photos: [''],
          VoiceNote: '',
        };

        if (isUpdate) {
          scoutPointToSync.MarkerId = scoutPoint.id;
        }

        const photos = JSON.parse(scoutPoint.photos);
        if (photos?.length !== 0) {
          const file = photos?.[0];

          const filePath = storage.getString(file);

          if (file) {
            if (!filePath) return;
            const base64 = await FileSystem.readAsStringAsync(filePath, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const fileExtension = file.split('.').pop();

            if (base64 && fileExtension) {
              const key = await uploadStorage(base64, fileExtension);

              scoutPointToSync.Photos = [key];
            }
          }
        }

        if (scoutPoint.voice_note) {
          const filePath = storage.getString(scoutPoint.voice_note);
          if (!filePath) return;
          const base64 = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const fileExtension = scoutPoint.voice_note.split('.').pop();

          if (base64 && fileExtension) {
            const key = await uploadStorage(base64, fileExtension);
            console.log('Voice Note Key', key);

            scoutPointToSync.VoiceNote = key;
          }
        }

        try {
          const res = await axiosClient.post('/fields/markers/add', scoutPointToSync);
          console.log(`Scout Point ${isUpdate ? 'Update' : 'Sync'} Response`, res.data.data.id);
        } catch (error) {
          console.log(`Error ${isUpdate ? 'updating' : 'creating'} scout point`, error);
        }
      };

      // Handle created scout points
      await Promise.all(
        changes.scout_point.created.map((scoutPoint) => syncScoutPoint(scoutPoint))
      );

      // Handle updated scout points
      await Promise.all(
        changes.scout_point.updated.map((scoutPoint) => syncScoutPoint(scoutPoint, true))
      );
    },
  });
}
