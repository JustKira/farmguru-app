import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export const SelectDate = ({ control }: { control: Control<z.infer<typeof formSchema>, any> }) => {
  const [type, setType] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  const { t } = useTranslation();

  return (
    <View className="flex w-full flex-row justify-between gap-2 pr-2">
      <Button
        onPress={() => {
          setType('date');
          setShow(true);
        }}
        variant="secondary"
        className="w-1/2">
        <Text>{t('select_date')}</Text>
      </Button>
      <Button
        onPress={() => {
          setType('time');
          setShow(true);
        }}
        variant="secondary"
        className="w-1/2">
        <Text>{t('select_time')}</Text>
      </Button>
      {show && (
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <DateTimePicker
              value={value}
              mode={type}
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShow(false);
                onChange(selectedDate);
              }}
            />
          )}
          name="date"
        />
      )}
    </View>
  );
};
