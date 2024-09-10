import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image, View } from 'react-native';

import { Text } from './ui/text';

import { useColorScheme } from '~/lib/hooks/use-color-scheme';

export default function CustomDrawerContent(props: any) {
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
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <Text className="text-3xl text-foreground">Sign out</Text>
    </View>
  );
}
