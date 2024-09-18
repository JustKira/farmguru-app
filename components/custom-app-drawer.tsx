import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image, View } from 'react-native';

import { useColorScheme } from '~/lib/hooks/use-color-scheme';

export default function CustomAppDrawerContent(props: any) {
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
    </View>
  );
}
