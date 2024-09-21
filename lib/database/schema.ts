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

        { name: 'crop_type', type: 'string' },
        { name: 'plant_date', type: 'number' }, // Changed from string to number for date

        // Maps
        { name: 'default_overlay_key', type: 'string' },
        { name: 'nitrogen_overlay_key', type: 'string' },
        { name: 'anomaly_overlay_key', type: 'string' },
        { name: 'growth_overlay_key', type: 'string' },
        { name: 'irrigation_overlay_key', type: 'string' },

        // Last updates (Dates)
        { name: 'last_info_update', type: 'number' }, // Changed from string to number for date
        { name: 'last_irrigation_update', type: 'number' }, // Changed from string to number for date
        { name: 'last_crop_update', type: 'number' }, // Changed from string to number for date
        { name: 'last_scout_update', type: 'number' }, // Changed from string to number for date

        { name: 'growth_percentage', type: 'string' }, // number[]
        { name: 'nitrogen_percentage', type: 'string' }, // number[]
        { name: 'stress_percentage', type: 'string' }, // number[]

        { name: 'trend_growth', type: 'number' },
        { name: 'trend_nitrogen', type: 'number' },
        { name: 'trend_stress', type: 'number' },
        { name: 'soil_moisture', type: 'number' },
        { name: 'days_to_wilting', type: 'number' },
        { name: 'advised_water', type: 'number' },
        { name: 'next_irrigation', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'farm',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'fields', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'irrigation_point',
      columns: [
        { name: 'field_id', type: 'string' },
        { name: 'duration', type: 'number' },
        { name: 'date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'scout_point',
      columns: [
        { name: 'field_id', type: 'string' },
        { name: 'date', type: 'number' }, // Changed from string to number for date
        { name: 'location', type: 'string' }, // JSON (tuple [number, number])
        { name: 'photos', type: 'string' }, // JSON (string[])
        { name: 'note', type: 'string' },
        { name: 'voice_note', type: 'string' },
        { name: 'issue_category', type: 'string' },
        { name: 'issue_severity', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // New fields for reply
        { name: 'reply', type: 'string' },
        { name: 'voice_reply', type: 'string' },
      ],
    }),
  ],
});
