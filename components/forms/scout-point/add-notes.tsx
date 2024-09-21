import { Control, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Text } from '~/components/ui/text';
import { Textarea } from '~/components/ui/textarea';

export const Notes = ({ control }: { control: Control<z.infer<typeof formSchema>, any> }) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">notes</Text>
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
