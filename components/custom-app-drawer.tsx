import { useNetInfo } from '@react-native-community/netinfo';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { Button } from './ui/button';
import { Text } from './ui/text';

import { useColorScheme } from '~/lib/hooks/use-color-scheme';

export default function CustomAppDrawerContent(props: any) {
  const { isDarkColorScheme } = useColorScheme();
  const { isWifiEnabled, isConnected } = useNetInfo();

  const { t } = useTranslation();

  const router = useRouter();
  return (
    <View className="flex-1">
      <View className="pb-4 pt-10">
        <Image
          className="h-24"
          resizeMode="contain"
          source={
            isDarkColorScheme
              ? require('~/assets/farmguru.png')
              : require('~/assets/farmguru_dark.png')
          }
        />
      </View>

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {isWifiEnabled && isConnected ? (
        <View className="px-2 pb-2">
          <Button onPress={() => router.push('/sync')}>
            <Text>{t('resync')}</Text>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
