import { useNetInfo } from '@react-native-community/netinfo';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Farm } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { Button } from './ui/button';
import { Text } from './ui/text';

import { useColorScheme } from '~/lib/hooks/use-color-scheme';
import { useAuth } from '~/lib/providers/auth-provider';

export default function CustomFieldDrawerContent(props: any) {
  const { signOut } = useAuth();

  const { isWifiEnabled, isConnected } = useNetInfo();

  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <View className="pb-4 pt-10">
        <Image className="h-20" resizeMode="contain" source={require('~/assets/farmguru.png')} />
      </View>

      <DrawerContentScrollView {...props}>
        <DrawerItem
          label={t('navigation.farm')}
          icon={({ size, color }) => <Farm size={size} color={color} />}
          onPress={() => router.push('/(app_drawer)')}
        />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {isWifiEnabled && isConnected ? (
        <View className="px-2 pb-2">
          <Button onPress={() => router.push('/sync')}>
            <Text>{t('resync')}</Text>
          </Button>
        </View>
      ) : null}

      <View className="px-2 pb-2">
        <Button onPress={() => router.push('/(app_drawer)/profile')}>
          <Text>{t('navigation.profile')}</Text>
        </Button>
      </View>
    </View>
  );
}
