import { Model } from '@nozbe/watermelondb';
import { date, field, json, text } from '@nozbe/watermelondb/decorators';
import { z } from 'zod';

// Zod schemas
const numberPairSchema = z.tuple([z.number(), z.number()]);
const numberPairArraySchema = z.array(numberPairSchema);
const numberArraySchema = z.array(z.number());

// Sanitizers
const numberPairSanitizer = (raw: any) => {
  try {
    return numberPairSchema.parse(raw);
  } catch (error) {
    console.log('Error parsing number pair', error);
    return [0, 0]; // Default value or handle as needed
  }
};

const numberPairArraySanitizer = (raw: any) => {
  try {
    return numberPairArraySchema.parse(raw);
  } catch (error) {
    console.log('Error parsing array of number pairs', error);
    return [];
  }
};

const numberArraySanitizer = (raw: any) => {
  try {
    return numberArraySchema.parse(raw);
  } catch (error) {
    console.log('Error parsing number array', error);
    return [];
  }
};

class Field extends Model {
  static table = 'field';

  @text('name') name!: string;
  @text('farm_id') farmId!: string;

  @json('location', numberPairArraySanitizer) location!: [number, number][];
  @json('position', numberPairSanitizer) position!: [number, number];
  @json('position_min', numberPairSanitizer) positionMin!: [number, number];
  @json('position_max', numberPairSanitizer) positionMax!: [number, number];
  @json('area', numberPairSanitizer) area!: [number, number];
  @text('crop_type') cropType!: string;
  @date('plant_date') plantDate!: Date;

  @text('default_overlay_key') defaultOverlayKey!: string;
  @text('nitrogen_overlay_key') nitrogenOverlayKey!: string;
  @text('anomaly_overlay_key') anomalyOverlayKey!: string;
  @text('growth_overlay_key') growthOverlayKey!: string;

  @text('irrigation_overlay_key') irrigationOverlayKey!: string;

  @date('last_info_update') lastInfoUpdate!: Date;
  @date('last_irrigation_update') lastIrrigationUpdate!: Date;
  @date('last_crop_update') lastCropUpdate!: Date;
  @date('last_scout_update') lastAnomalyUpdate!: Date;

  // @field('farm') farm!: Farm;
  @json('growth_percentage', numberArraySanitizer) growthPercentage!: number[];
  @json('irrigation_percentage', numberArraySanitizer) irrigationPercentage!: number[];
  @json('nitrogen_percentage', numberArraySanitizer) nitrogenPercentage!: number[];
  @json('stress_percentage', numberArraySanitizer) anomalyPercentage!: number[];

  @field('trend_growth') trendGrowth!: number;
  @field('trend_nitrogen') trendNitrogen!: number;
  @field('trend_stress') trendStress!: number;

  @field('soil_moisture') soilMoisture!: number;
  @field('days_to_wilting') daysToWilting!: number;
  @field('advised_water') advisedWater!: number;

  @date('next_irrigation') nextIrrigation!: Date;
}

export default Field;
