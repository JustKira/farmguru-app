import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

import { SelectDate } from './select-date';
import { SelectDuration } from './select-duration';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { database } from '~/lib/database';
import IrrigationPoint from '~/lib/database/model/irrigation-point';

export const formSchema = z.object({
  duration: z.coerce.number().min(1, 'Duration must be at least 1 hour'),
  date: z.date(),
});

const AddIrrigationPoint = ({
  fieldId,
  onCreateSuccess,
}: {
  fieldId: string;
  onCreateSuccess?: () => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: 0,
      date: new Date(),
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await database.write(async () => {
        await database.get<IrrigationPoint>('irrigation_point').create((ip) => {
          ip.fieldId = fieldId;
          ip.duration = data.duration;
          ip.date = data.date;
        });
      });

      onCreateSuccess?.();

      console.log('Irrigation point created');
    } catch (error) {
      console.error('Failed to create irrigation point', error);
    }

    reset();
  });

  return (
    <View className="mb-2 gap-2">
      <SelectDuration control={control} />
      {errors.duration && <Text className="text-red-500">{errors.duration.message}</Text>}

      <SelectDate control={control} />
      {errors.date && <Text className="text-red-500">{errors.date.message}</Text>}

      <Text>
        {watch('date') && (
          <Badge>
            <Text>{format(watch('date'), 'EE, d MMM yyyy HH:mm aaa')}</Text>
          </Badge>
        )}
      </Text>

      <Button onPress={onSubmit}>
        <Text>{t('add')}</Text>
      </Button>
    </View>
  );
};

export default AddIrrigationPoint;
