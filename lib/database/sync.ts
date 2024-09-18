import { synchronize } from '@nozbe/watermelondb/sync';
import debugPrintChanges from '@nozbe/watermelondb/sync/debugPrintChanges';
import { database } from '.';
import { axiosClient } from '../axios-client';

import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';

interface FieldInfoData {
  id: string;
  name: string;
  farmId: string;
  location: [number, number][];
  position: [number, number];
  positionMin: [number, number];
  positionMax: [number, number];
  area: [number, number];
  cropType: string;
  plantdate: string;
  defaultOverlayKey: string;
  nitrogenOverlayKey: string;
  anomalyOverlayKey: string;
  growthOverlayKey: string;
  irrigationOverlayKey: string;
  lastInfoDate: string;
  lastIrrigationDate: string;
  lastCropDate: string;
  lastScoutDate: string;
  growthPercentage: number[];
  nitrogenPercentage: number[];
  stressPercentage: number[];
  trendGrowth: number;
  trendNitrogen: number;
  trendStress: number;
  soilMoistureRoot: number;
  daysToWilting: number;
  nextIrrigation: string; // Assuming it's a date string
  advisedWater: number;
}

interface FarmData {
  id: string;
  name: string;
  fields: {
    id: string;
    name: string;
    location: [number, number][];
    position: [number, number];
  }[];
}

const appSync = async () => {
  let isSyncing = true;

  const logger = new SyncLogger(10);

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      // Fetch farm data
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
      const fieldRecords = fieldsDetailsResponses.map((response) => {
        const field = response.data.data;

        return {
          id: field.id,
          name: field.name,
          farm_id: field.farmId,
          location: JSON.stringify(field.location),
          position: JSON.stringify(field.position),
          position_min: JSON.stringify(field.positionMin),
          position_max: JSON.stringify(field.positionMax),
          area: JSON.stringify(field.area),
          crop_type: field.cropType,
          plant_date: field.plantdate ? Date.parse(field.plantdate) : null,
          default_overlay_key: field.defaultOverlayKey,
          nitrogen_overlay_key: field.nitrogenOverlayKey,
          anomaly_overlay_key: field.anomalyOverlayKey,
          growth_overlay_key: field.growthOverlayKey,
          irrigation_overlay_key: field.irrigationOverlayKey,
          last_info_update: field.lastInfoDate ? Date.parse(field.lastInfoDate) : null,
          last_irrigation_update: field.lastIrrigationDate
            ? Date.parse(field.lastIrrigationDate)
            : null,
          last_crop_update: field.lastCropDate ? Date.parse(field.lastCropDate) : null,
          last_scout_update: field.lastScoutDate ? Date.parse(field.lastScoutDate) : null,
          growth_percentage: JSON.stringify(field.growthPercentage),
          nitrogen_percentage: JSON.stringify(field.nitrogenPercentage),
          stress_percentage: JSON.stringify(field.stressPercentage),
          trend_growth: field.trendGrowth,
          trend_nitrogen: field.trendNitrogen,
          trend_stress: field.trendStress,
          soil_moisture: field.soilMoistureRoot,
          days_to_wilting: field.daysToWilting,
          advised_water: field.advisedWater,
          next_irrigation: field.nextIrrigation ? Date.parse(field.nextIrrigation) : null,
        };
      });

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
