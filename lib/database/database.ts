import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Field from './model/field';

import migrations from '~/lib/database/migrations';
import schema from '~/lib/database/schema';

// WatermelonDB setup
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: false,

  onSetUpError: () => {},
});

// Initialize WatermelonDB database
export const watermelondb = new Database({
  adapter,
  modelClasses: [Field],
});
