import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Text } from '~/components/ui/text';
import { Textarea } from '~/components/ui/textarea';

export const Notes = ({ control }: { control: Control<z.infer<typeof formSchema>, any> }) => {
  const { t } = useTranslation();

  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">{t('notes')}</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Textarea placeholder="Add notes" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
        name="notes"
      />
    </View>
  );
};
