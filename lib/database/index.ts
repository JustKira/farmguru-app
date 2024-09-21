import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';

import Farm from './model/farm';
import Field from './model/field';
import IrrigationPoint from './model/irrigation-point';
import ScoutPoint from './model/scout-point';

import migrations from '~/lib/database/migrations';
import schema from '~/lib/database/schema';

setGenerator(() => Crypto.randomUUID());

// WatermelonDB setup
export const adapter = new SQLiteAdapter({
  dbName: 'farmguru-db',
  schema,
  migrations,
  jsi: false,

  onSetUpError: (error) => {
    console.error('Failed to set up the database', error);
  },
});

// Initialize WatermelonDB database
export const database = new Database({
  adapter,
  modelClasses: [Field, Farm, ScoutPoint, IrrigationPoint],
});
