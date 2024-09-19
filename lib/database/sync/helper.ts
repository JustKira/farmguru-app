import * as FileSystem from 'expo-file-system';

import { axiosClient } from '~/lib/axios-client';
import { storage } from '~/lib/mmkv/storage';

export const mapFieldRecords = (
  fieldsDetailsResponses: { data: { data: FieldInfoData } }[]
): FieldRecord[] => {
  return fieldsDetailsResponses.map((response) => {
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
      plant_date: field.plantdate,
      default_overlay_key: field.defaultOverlayKey,
      nitrogen_overlay_key: field.nitrogenOverlayKey,
      anomaly_overlay_key: field.anomalyOverlayKey,
      growth_overlay_key: field.growthOverlayKey,
      irrigation_overlay_key: field.irrigationOverlayKey,
      last_info_update: field.lastInfoDate,
      last_irrigation_update: field.lastIrrigationDate,
      last_crop_update: field.lastCropDate,
      last_scout_update: field.lastScoutDate,
      growth_percentage: JSON.stringify(field.growthPercentage),
      nitrogen_percentage: JSON.stringify(field.nitrogenPercentage),
      stress_percentage: JSON.stringify(field.stressPercentage),
      trend_growth: field.trendGrowth,
      trend_nitrogen: field.trendNitrogen,
      trend_stress: field.trendStress,
      soil_moisture: field.soilMoistureRoot,
      days_to_wilting: field.daysToWilting,
      advised_water: field.advisedWater,
      next_irrigation: field.nextIrrigation,
    };
  }) as unknown as FieldRecord[];
};

export const getMapImage = async (key: string) => {
  if (!key || key.length === 0) return;

  const storageResult = await axiosClient.post<{ data: string }>('/storage/get', {
    Key: key,
    ActionMaker: 'system',
  });

  const url = storageResult.data.data;

  const filename = url.split('/').pop() || `${key}_default_filename`;
  const localUri = `${FileSystem.cacheDirectory}${filename}`;

  const result = await FileSystem.downloadAsync(url, localUri);

  storage.set(key, result.uri);
};
