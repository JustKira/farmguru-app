import '~/global.css';

import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NAV_THEME } from '~/lib/constants';
import { database } from '~/lib/database';
import { appSync } from '~/lib/database/sync';
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

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const router = useRouter();

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
    <DatabaseProvider database={database}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          //value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}
          value={LIGHT_THEME}>
          <SafeAreaProvider>
            <StatusBar
              // style={isDarkColorScheme ? 'light' : 'dark'}
              style="light"
            />
            <AuthProvider
              onSignInSuccess={async () => {
                await appSync();
                router.replace('/(app_drawer)');
                // await reloadAppAsync();
              }}
              onSignOutSuccess={async () => {
                await database.write(async () => {
                  await database.unsafeResetDatabase();
                });
                router.replace('/login');
                // await reloadAppAsync();
              }}
              signInPath="/login"
              protectedRoutes={[/^\/$/, /^\/field\/.*/]}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
              <PortalHost />
            </AuthProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
