import { Model } from '@nozbe/watermelondb';
import { date, readonly, field, json } from '@nozbe/watermelondb/decorators';
import { z } from 'zod';

class IrrigationPoint extends Model {
  static table = 'irrigation_point';

  // The field to which the irrigation point belongs
  @field('field_id') fieldId!: string;

  // Duration of the irrigation event in hours (or any other unit)
  @field('duration') duration!: number;

  // Date of the irrigation event
  @date('date') date!: Date;

  // Read-only fields for created and updated timestamps
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}

export default IrrigationPoint;
