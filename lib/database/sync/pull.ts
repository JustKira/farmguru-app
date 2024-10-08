import { synchronize } from '@nozbe/watermelondb/sync';

import { getStorageFile, mapFieldRecords } from './helper';

import { axiosClient } from '~/lib/axios-client';
import { database } from '~/lib/database';
export async function PullSync() {
  const { data: farmsResponse } = await axiosClient.post('/fields/mobile/getFarms', {
    modifiedFrom: null,
  });

  const farmsData: FarmData[] = farmsResponse.data;

  // Map farm data
  const farmRecords = farmsData
    .filter((farm) => farm.fields.length > 0)
    .map((farm) => ({
      id: farm.id,
      name: farm.name,
      fields: JSON.stringify(farm.fields),
    }));

  // Extract field IDs
  const allFieldsIds = farmsData.reduce<string[]>((acc, farm) => {
    return [...acc, ...farm.fields.map((field) => field.id)];
  }, []);

  // Fetch field details
  const fieldsDetailsRequests = allFieldsIds.map((fieldId) => {
    return axiosClient.post<{ data: FieldInfoData }>('/fields/mobile/fieldInfo', {
      FieldId: fieldId,
    });
  });

  const fieldsDetailsResponses = await Promise.all(fieldsDetailsRequests);

  // Map field data
  const fieldRecords = mapFieldRecords(fieldsDetailsResponses);

  const scoutPoints =
    (
      await axiosClient.post<{ data: ScoutPointData[] | null }>('/fields/markers/get', {
        Ids: [],
        FieldIds: allFieldsIds,
        PageSize: 100,
        PageNumber: 1,
      })
    ).data.data ?? [];

  const scoutPointsRecord = scoutPoints.map((scoutPoint) => ({
    id: scoutPoint.id,
    field_id: scoutPoint.fieldId,
    date: new Date(scoutPoint.markerDate).getTime(),
    location: JSON.stringify(scoutPoint.markerLocation),
    photos: JSON.stringify(scoutPoint.photos),
    note: scoutPoint.notes,
    voice_note: scoutPoint.voiceNote,
    issue_category: scoutPoint.issueCategory,
    issue_severity: scoutPoint.issueSeverity,
    reply: scoutPoint.reply,
    voice_reply: scoutPoint.voiceReply,
  }));

  const scoutPointFiles = scoutPointsRecord.map((scoutPoint) => {
    const filesToGet = [];

    const photos = JSON.parse(scoutPoint.photos) as string[];

    photos.forEach((photo) => {
      if (photo.length === 0 || photo[0] === '') return;

      filesToGet.push(getStorageFile(photo, 'Photo'));
    });

    if (scoutPoint.voice_note) {
      if (scoutPoint.voice_note.length === 0) return;
      filesToGet.push(getStorageFile(scoutPoint.voice_note, 'Voice Note'));
    }

    return Promise.all(filesToGet);
  });

  await Promise.all(scoutPointFiles);

  const mapKeys: string[][] = [];

  fieldRecords.map((field) => {
    mapKeys.push(
      [
        field.default_overlay_key,
        field.nitrogen_overlay_key,
        field.anomaly_overlay_key,
        field.growth_overlay_key,
        field.irrigation_overlay_key,
      ].filter((key) => key !== '')
    ); // Clean up empty strings here
  });

  const mapImages = mapKeys
    .filter((key) => key.length !== 0)
    .map((keys) => {
      return Promise.all(keys.map((key) => getStorageFile(key, 'Map')));
    });

  await Promise.all(mapImages);

  await database.write(async () => {
    await database.unsafeResetDatabase();
  });

  await synchronize({
    database,
    pullChanges: async () => {
      // Fetch farm data
      // Prepare changes
      console.log('Pulling changes from server...');

      const changes: any = {
        farm: {
          created: farmRecords,
          updated: [],
          deleted: [],
        },
        field: {
          created: fieldRecords,
          updated: [],
          deleted: [],
        },
        scout_point: {
          created: scoutPointsRecord,
          updated: [],
          deleted: [],
        },
        irrigation_point: {
          created: [],
          updated: [],
          deleted: [],
        },
      };

      // Debug print changes
      // debugPrintChanges(changes, false);

      return {
        changes,
        timestamp: new Date().getTime(),
        experimentalStrategy: 'replacement',
      };
    },
  });
}
