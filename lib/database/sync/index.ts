import { synchronize } from '@nozbe/watermelondb/sync';
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
// import debugPrintChanges from '@nozbe/watermelondb/sync/debugPrintChanges';

import { getMapImage, mapFieldRecords } from './helper';

import { axiosClient } from '~/lib/axios-client';
import { database } from '~/lib/database';
import ScoutPoint from '../model/scout-point';

const appSync = async () => {
  let isSyncing = true;

  const logger = new SyncLogger(10);

  const { data: farmsResponse } = await axiosClient.post('/fields/mobile/getFarms', {
    modifiedFrom: null,
  });

  const farmsData: FarmData[] = farmsResponse.data;

  // Map farm data
  const farmRecords = farmsData.map((farm) => ({
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

  const scoutPoints = await axiosClient.post<{ data: ScoutPointData[] }>('/fields/markers/get', {
    Ids: [],
    FieldIds: allFieldsIds,
    PageSize: 100,
    PageNumber: 1,
  });

  const scoutPointsRecord = scoutPoints.data.data.map((scoutPoint) => ({
    id: scoutPoint.id,
    field_id: scoutPoint.fieldId,
    date: scoutPoint.markerDate,
    location: JSON.stringify(scoutPoint.markerLocation),
    photos: JSON.stringify(scoutPoint.photos),
    note: scoutPoint.notes,
    voice_note: scoutPoint.voiceNote,
    issue_category: scoutPoint.issueCategory,
    issue_severity: scoutPoint.issueSeverity,
    reply: scoutPoint.reply,
    voice_reply: scoutPoint.voiceReply,
  }));

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
      return Promise.all(keys.map((key) => getMapImage(key)));
    });

  await Promise.all(mapImages);

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      // Fetch farm data
      // Prepare changes
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
      };

      // Debug print changes
      // debugPrintChanges(changes, false);

      return {
        changes,
        timestamp: new Date().getTime(),
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      // Implement push logic if needed
    },
    log: logger.newLog(),
  });

  isSyncing = false;
  return isSyncing;
};

export { appSync };
