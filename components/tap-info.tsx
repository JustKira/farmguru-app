import { Entypo, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from './ui/text';

export function TapInfo({
  type,
  plantDate,
  lastUpdate,
}: {
  type: string;
  plantDate: Date;
  lastUpdate: Date;
}) {
  const { t } = useTranslation();
  const today = new Date();
  const cropAge = Math.abs(
    (new Date(plantDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  ).toFixed();

  return (
    <View className="flex w-full flex-row items-center justify-between">
      <View className="flex aspect-square w-[32%] items-center justify-center gap-2 rounded-lg bg-muted">
        <FontAwesome6 name="wheat-awn" size={32} color="rgb(74 222 128)" />
        <View className="flex gap-1">
          <Text className="text-center text-lg font-medium">{t('dialog.crop_info.type')}</Text>
          <Text className="text-center text-lg font-bold">{type}</Text>
        </View>
      </View>
      <View className="flex aspect-square w-[32%] items-center justify-center gap-2 rounded-lg bg-muted">
        <Entypo name="flower" size={32} color="rgb(74 222 128)" />
        <View className="flex gap-1">
          <Text className="text-center text-lg font-medium">{t('dialog.crop_info.age')}</Text>
          <Text className="text-center text-lg font-bold">{cropAge}</Text>
        </View>
      </View>
      <View className="flex aspect-square w-[32%] items-center justify-center gap-2 rounded-lg bg-muted ">
        <MaterialIcons name="update" size={32} color="rgb(74 222 128)" />
        <View className="flex gap-1">
          <Text className="text-center text-lg font-medium">{t('last_update')}</Text>
          <Text className="text-center text-lg font-bold">{format(lastUpdate, 'dd/MM/yyyy')}</Text>
        </View>
      </View>
    </View>
  );
}
