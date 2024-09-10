import '~/global.css';

import '~/lib/database/database';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/hooks/use-color-scheme';
import { storage } from '~/lib/mmkv/storage';
import { AuthProvider } from '~/lib/providers/auth-provider';

// Define theme constants
const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};

const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

// Prevent the splash screen from auto-hiding before getting the color scheme
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = storage.getString('theme'); // Use MMKV to get the theme
      if (Platform.OS === 'web') {
        // Adds the background color to the html element to prevent a white background on overscroll
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        storage.set('theme', colorScheme); // Use MMKV to set the theme
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null; // Return null while loading
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <SafeAreaProvider>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <AuthProvider signInPath="/login" protectedRoutes={[/^\/$/, /^\/field\/.*/]}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          <PortalHost />
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
