import { View } from 'react-native';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';

export default function Home() {
  const { signOut } = useAuth();

  return (
    <View className="px-2">
      <Button variant="default" onPress={() => signOut()}>
        <Text>Sign out</Text>
      </Button>
    </View>
  );
}
