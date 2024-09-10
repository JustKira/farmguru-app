import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'field',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'farm_id', type: 'string' },
        { name: 'location', type: 'string' }, // JSON
        { name: 'position', type: 'string' }, // JSON
        { name: 'position_min', type: 'string' }, // JSON
        { name: 'position_max', type: 'string' }, // JSON
        { name: 'area', type: 'string' }, // JSON

        {
          name: 'crop_type',
          type: 'string',
        },
        {
          name: 'plant_date',
          type: 'string',
        },

        //Maps
        {
          name: 'default_overlay_key',
          type: 'string',
        },
        {
          name: 'nitrogen_overlay_key',
          type: 'string',
        },
        {
          name: 'anomaly_overlay_key',
          type: 'string',
        },
        {
          name: 'growth_overlay_key',
          type: 'string',
        },
        {
          name: 'irrigation_overlay_key',
          type: 'string',
        },

        //Last updates (Dates)
        {
          name: 'last_info_update',
          type: 'string',
        },
        {
          name: 'last_irrigation_update',
          type: 'string',
        },
        {
          name: 'last_crop_update',
          type: 'string',
        },
        {
          name: 'last_scout_update',
          type: 'string',
        },

        {
          name: 'growth_percentage',
          type: 'string', // number[]
        },
        {
          name: 'nitrogen_percentage',
          type: 'string', // number[]
        },
        {
          name: 'stress_percentage',
          type: 'string', // number[]
        },
        {
          name: 'trend_growth',
          type: 'number',
        },
        {
          name: 'trend_nitrogen',
          type: 'number',
        },
        {
          name: 'trend_stress',
          type: 'number',
        },
        {
          name: 'soil_moisture',
          type: 'number',
        },
        {
          name: 'days_to_wilting',
          type: 'number',
        },
        {
          name: 'advised_water',
          type: 'number',
        },
        {
          name: 'next_irrigation',
          type: 'string',
        },
      ],
    }),
    tableSchema({
      name: 'farm',
      columns: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'field_ids',
          type: 'string', // number[]
        },
      ],
    }),
  ],
});
