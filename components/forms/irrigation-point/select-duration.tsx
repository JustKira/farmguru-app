import { Control, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';

export const SelectDuration = ({
  control,
}: {
  control: Control<z.infer<typeof formSchema>, any>;
}) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Duration ( hours )</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            keyboardType="numeric"
            placeholder="Add notes"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value.toString()}
          />
        )}
        name="duration"
      />
    </View>
  );
};
