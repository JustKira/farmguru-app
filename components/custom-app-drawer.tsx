import { useNetInfo } from '@react-native-community/netinfo';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { Button } from './ui/button';
import { Text } from './ui/text';

export default function CustomAppDrawerContent(props: any) {
  const { isConnected } = useNetInfo();

  const { t } = useTranslation();

  const router = useRouter();
  return (
    <View className="flex-1">
      <View className="pb-4 pt-10">
        <Image className="h-20" resizeMode="contain" source={require('~/assets/farmguru.png')} />
      </View>

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {isConnected ? (
        <View className="px-2 pb-2">
          <Button onPress={() => router.push('/sync')}>
            <Text>{t('resync')}</Text>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
