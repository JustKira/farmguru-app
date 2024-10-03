import { Grains } from 'phosphor-react-native';
import { View } from 'react-native';
import { Text } from './ui/text';
import { useTranslation } from 'react-i18next';

export function TapInfo({
  type,
  age,
  lastUpdate,
}: {
  type: string;
  age: number;
  lastUpdate: Date;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex w-full flex-row items-center justify-between">
      <View className="flex aspect-square w-[32%] items-center justify-center gap-2 rounded-lg bg-muted">
        <Grains size={48} />
        <View className="flex gap-1">
          <Text className="text-center text-lg font-medium">{t('dialog.crop_info.type')}</Text>
          <Text className="text-center text-lg font-bold">{type}</Text>
        </View>
      </View>
      <View className="flex aspect-square w-[32%] items-center justify-center gap-2 rounded-lg bg-muted">
        <Grains size={48} />
        <View className="flex gap-1">
          <Text className="text-center text-lg font-medium">{t('dialog.crop_info.type')}</Text>
          <Text className="text-center text-lg font-bold">{type}</Text>
        </View>
      </View>
      <View className="flex aspect-square w-[32%] items-center justify-center gap-2 rounded-lg bg-muted ">
        <Grains size={48} />
        <View className="flex gap-1">
          <Text className="text-center text-lg font-medium">{t('dialog.crop_info.type')}</Text>
          <Text className="text-center text-lg font-bold">{type}</Text>
        </View>
      </View>
    </View>
  );
}
