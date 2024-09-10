import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, Sun } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { useColorScheme } from '~/lib/hooks/use-color-scheme';
import { cn } from '~/lib/utils';

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  return (
    <Pressable
      onPress={() => {
        const newTheme = isDarkColorScheme ? 'light' : 'dark';
        setColorScheme(newTheme);
        setAndroidNavigationBar(newTheme);
        AsyncStorage.setItem('theme', newTheme);
      }}>
      {({ pressed }) => (
        <View
          className={cn(
            'aspect-square flex-1 items-start justify-center pt-0.5 text-foreground web:px-5',
            pressed && 'opacity-70'
          )}>
          {isDarkColorScheme ? <Moon /> : <Sun />}
        </View>
      )}
    </Pressable>
  );
}
