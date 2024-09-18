import { Model } from '@nozbe/watermelondb';
import { json, text } from '@nozbe/watermelondb/decorators';
import { z } from 'zod';

// Define schemas
const numberPairSchema = z.tuple([z.number(), z.number()]);

const FarmFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.array(numberPairSchema),
  position: numberPairSchema,
});

// Infer TypeScript type from Zod schema
type FarmFieldType = z.infer<typeof FarmFieldSchema>;

// Sanitizer function
const farmFieldArraySanitizer = (raw: any): FarmFieldType[] => {
  try {
    return z.array(FarmFieldSchema).parse(raw);
  } catch (error) {
    console.error('Error parsing fields', error);
    return [];
  }
};

class Farm extends Model {
  static table = 'farm';

  @text('name') name!: string;
  @json('fields', farmFieldArraySanitizer) fields!: FarmFieldType[];
}

export default Farm;
