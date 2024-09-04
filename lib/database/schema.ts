import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'field',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'farm_id', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'position', type: 'string' },
        { name: 'boundary', type: 'string' },
      ],
    }),
  ],
});
