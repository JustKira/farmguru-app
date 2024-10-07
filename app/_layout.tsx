import '~/global.css';

import { Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// import { PermissionRequester } from '~/components/permission-requester';
import Toast from 'react-native-toast-message';

import { NAV_THEME } from '~/lib/constants';
import { database } from '~/lib/database';
import { useColorScheme } from '~/lib/hooks/use-color-scheme';
import { storage } from '~/lib/mmkv/storage';
import { bootCryptoPolyfill } from '~/lib/polyfill/crypto-polyfill';
import { AuthProvider } from '~/lib/providers/auth-provider';
import { LanguageProvider } from '~/lib/providers/language-provider';
import { SyncProvider } from '~/lib/providers/sync-provider';

import './i18n.ts';

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
bootCryptoPolyfill();

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
        storage.set('theme', 'light'); // Use MMKV to set the theme
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme('light');
        setIsColorSchemeLoaded(true);
        return;
      }

      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  // React.useEffect(() => {
  //   const checkAppVersion = async () => {
  //     try {
  //       const latestVersion = await VersionCheck.getLatestVersion({
  //         provider: 'playStore',
  //         packageName: 'com.vais.farmgate',
  //         ignoreErrors: true,
  //       });

  //       const currentVersion = VersionCheck.getCurrentVersion();

  //       if (latestVersion > currentVersion) {
  //         Alert.alert(
  //           'Update Required',
  //           'A new version of the app is available. Please update to continue using the app.',
  //           [
  //             {
  //               text: 'Update Now',
  //               onPress: async () => {
  //                 Linking.openURL(
  //                   await VersionCheck.getPlayStoreUrl({ packageName: 'com.vais.farmgate' })
  //                 );
  //               },
  //             },
  //           ],
  //           { cancelable: false }
  //         );
  //       } else {
  //         // App is up-to-date; proceed with the app
  //       }
  //     } catch (error) {
  //       // Handle error while checking app version
  //     }
  //   };

  //   if (Platform.OS === 'android') {
  //     checkAppVersion();
  //   }
  // }, []);

  if (!isColorSchemeLoaded) {
    return null; // Return null while loading
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <SafeAreaProvider>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
            <AuthProvider
              onSignInSuccess={async () => {
                router.replace('/sync');
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
              <SyncProvider>
                {/* <PermissionRequester> */}
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
                <Toast />
                <PortalHost />
                {/* </PermissionRequester> */}
              </SyncProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
