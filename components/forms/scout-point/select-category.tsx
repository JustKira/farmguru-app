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
import { useTranslation } from 'react-i18next';

export const SelectCategory = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value: string;
}) => {
  const { t } = useTranslation();

  const categoryItems = [
    { label: t('insect'), value: 'insect' },
    { label: t('disease'), value: 'disease' },
    { label: t('growth'), value: 'growth' },
    { label: t('others'), value: 'others' },
  ];

  return (
    <View>
      <Text>
        {t(`select`, {
          name: t('category'),
        })}
      </Text>
      <Select
        onValueChange={(value) => (value ? setValue('issueCategory', value.value) : null)}
        value={{
          value,
          label: t(value),
        }}>
        <SelectTrigger>
          <SelectValue placeholder={t('select_category')} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {categoryItems.map((item) => (
            <SelectItem key={item.value} label={item.label} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </View>
  );
};
