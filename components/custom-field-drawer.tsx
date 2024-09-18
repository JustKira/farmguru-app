import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Farm } from 'phosphor-react-native';
import { Image, View } from 'react-native';

import { Button } from './ui/button';
import { Text } from './ui/text';

import { useColorScheme } from '~/lib/hooks/use-color-scheme';
import { useAuth } from '~/lib/providers/auth-provider';

export default function CustomFieldDrawerContent(props: any) {
  const { signOut } = useAuth();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

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
        <DrawerItem
          label="Farms"
          icon={({ size, color }) => <Farm size={size} color={color} />}
          onPress={() => router.push('/(app_drawer)')}
        />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View className="px-2 pb-2">
        <Button onPress={() => signOut()}>
          <Text>Sign out</Text>
        </Button>
      </View>
    </View>
  );
}
