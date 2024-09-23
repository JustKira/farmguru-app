import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
  const { t } = useTranslation();
  const severityItems = [
    { label: t('early'), value: 'early' },
    { label: t('moderate'), value: 'moderate' },
    { label: t('late'), value: 'late' },
  ];

  return (
    <View className="gap-1.5">
      <Text className="text-lg font-medium capitalize">
        {t(`select`, {
          name: t('severity'),
        })}
      </Text>
      <Select
        onValueChange={(value) => (value ? setValue('issueSeverity', value.value) : null)}
        value={{
          value,
          label: t(value),
        }}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder={t('select_severity')}
          />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectGroup>
            {severityItems.map((item) => (
              <SelectItem key={item.value} label={item.label} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};
