import { UseFormSetValue } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Text } from '~/components/ui/text';

export const SelectSeverity = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: string;
}) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Select a severity</Text>
      <Select
        onValueChange={(value) => (value ? setValue('issueSeverity', value.value) : null)}
        value={{
          value,
          label: value?.charAt(0).toUpperCase() + value?.slice(1),
        }}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder="Select a severity"
          />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectGroup>
            <SelectLabel>Severity</SelectLabel>
            <SelectItem label="Early" value="early">
              Early
            </SelectItem>
            <SelectItem label="Moderate" value="moderate">
              Moderate
            </SelectItem>
            <SelectItem label="Late" value="late">
              Late
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};
