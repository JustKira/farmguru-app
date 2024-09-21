import { Bug, DotsThreeCircle, Plant, QuestionMark, Virus } from 'phosphor-react-native';
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

export const SelectCategory = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: string;
}) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Select a category</Text>
      <Select
        onValueChange={(value) => (value ? setValue('issueCategory', value.value) : null)}
        value={{
          value,
          label: value?.charAt(0).toUpperCase() + value?.slice(1),
        }}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder="Select a fruit"
          />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            <SelectItem label="Insect" value="insect" icon={<Bug />}>
              Insect
            </SelectItem>
            <SelectItem label="Disease" value="disease" icon={<Virus />}>
              Disease
            </SelectItem>
            <SelectItem label="Growth" value="growth" icon={<Plant />}>
              Growth
            </SelectItem>
            <SelectItem label="Others" value="others" icon={<DotsThreeCircle />}>
              Others
            </SelectItem>
            <SelectItem label="DontKnow" value="dontknow" icon={<QuestionMark />}>
              DontKnow
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};
