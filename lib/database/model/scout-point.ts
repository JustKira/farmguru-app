import { Model } from '@nozbe/watermelondb';
import { date, json, text } from '@nozbe/watermelondb/decorators';
import { z } from 'zod';

// Zod schemas
const numberPairSchema = z.array(z.number());
const stringArraySchema = z.array(z.string());

// Sanitizers
const numberPairSanitizer = (raw: any) => {
  try {
    return numberPairSchema.parse(raw);
  } catch (error) {
    console.log('Error parsing number pair', error);
    return [0, 0]; // Default value or handle as needed
  }
};

const stringArraySanitizer = (raw: any) => {
  try {
    return stringArraySchema.parse(raw);
  } catch (error) {
    console.log('Error parsing string array', error);
    return []; // Default value or handle as needed
  }
};

class ScoutPoint extends Model {
  static table = 'scout_point';

  @text('field_id') fieldId!: string;
  @date('date') date!: Date;

  @json('location', numberPairSanitizer) location!: number[];
  @json('photos', stringArraySanitizer) photos!: string[];

  @text('note') note!: string;
  @text('voice_note') voiceNote!: string;

  @text('issue_category') issueCategory!: string;
  @text('issue_severity') issueSeverity!: string;

  // New fields
  @text('reply') reply!: string;
  @text('voice_reply') voiceReply!: string;
}

export default ScoutPoint;
