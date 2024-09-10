import { View } from '@rn-primitives/slot';
import { Stack, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';
// import { Platform } from 'react-native';

export default function Home() {
  const { signOut } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <SafeAreaView>
        <Text>Home</Text>
        <Button
          onPress={() => {
            signOut();
          }}>
          <Text>Sign Out</Text>
        </Button>
      </SafeAreaView>
    </>
  );
}
