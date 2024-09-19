import { zodResolver } from '@hookform/resolvers/zod';
import { Bug, DotsThreeCircle, Plant, QuestionMark, Virus } from 'phosphor-react-native';
import { Control, Controller, FieldValues, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { Textarea } from '../ui/textarea';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function AddScoutPoint() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  return (
    <View className="mb-2 gap-2">
      <SelectCategory />
      <SelectSeverity />
      <Notes control={control} />
    </View>
  );
}

const SelectCategory = () => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Select a category</Text>
      <Select defaultValue={{ value: 'insect', label: 'Insect' }}>
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

const SelectSeverity = () => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Select a severity</Text>
      <Select defaultValue={{ value: 'early', label: 'Early' }}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder="Select a fruit"
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

const Notes = ({ control }: { control: Control<FieldValues, any> }) => {
  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">Add notes</Text>
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

{
  /* <Controller
control={control}
render={({ field: { onChange, onBlur, value } }) => (
  <Input
    placeholder="your@email.com"
    onBlur={onBlur}
    onChangeText={onChange}
    value={value}
  />
)}
name="email"
/>
{errors.email && <Text>{errors.email.message?.toString()}</Text>} */
}
