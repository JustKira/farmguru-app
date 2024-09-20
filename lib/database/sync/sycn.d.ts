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

type FieldRecord = {
  id: string;
  name: string;
  farm_id: string;
  location: string; // JSON string
  position: string; // JSON string
  position_min: string; // JSON string
  position_max: string; // JSON string
  area: string; // JSON string
  crop_type: string;
  plant_date: string; // ISO date string
  default_overlay_key: string;
  nitrogen_overlay_key: string;
  anomaly_overlay_key: string;
  growth_overlay_key: string;
  irrigation_overlay_key: string;
  last_info_update: string; // ISO date string
  last_irrigation_update: string; // ISO date string
  last_crop_update: string; // ISO date string
  last_scout_update: string; // ISO date string
  growth_percentage: string; // JSON string
  nitrogen_percentage: string; // JSON string
  stress_percentage: string; // JSON string
  trend_growth: string;
  trend_nitrogen: string;
  trend_stress: string;
  soil_moisture: number;
  days_to_wilting: number;
  advised_water: number;
  next_irrigation: string; // ISO date string
};

type ScoutPointData = {
  id: string;
  fieldId: string;
  markerDate: string; // ISO Date format string
  markerLocation: [number, number]; // Latitude, Longitude
  photos: string[]; // Array of photo URLs or empty strings
  issueSeverity: string;
  issueCategory: string;
  issueSubCategory: string;
  notes: string;
  status: string;
  lastView: string; // ISO Date format string
  reply: string;
  voiceNote: string;
  voiceReply: string;
  createdBy: string;
  createdOn: string; // ISO Date format string
  modifiedBy: string;
  modifiedOn: string; // ISO Date format string
  isDeleted: boolean;
};

interface ScoutPointToSync {
  MarkerId?: string;
  Date?: string;
  FieldId: string;
  IssueCategory?: string;
  IssueSeverity?: string;
  Location?: [number, number];
  Notes?: string;
  Photos?: string[];
  VoiceNote?: string;
}
