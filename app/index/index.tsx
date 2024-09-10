import { Stack, Link, router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';
// import { Platform } from 'react-native';

const FarmsDummyData: {
  id: string;
  name: string;
  // fields: {
  //   id: string;
  //   name: string;
  //   location: {
  //     lng: number;
  //     lat: number;
  //   };
  // }[];
}[] = [
  {
    id: '1',
    name: 'Farm 1',
  },
  {
    id: '2',
    name: 'Farm 2',
  },
  {
    id: '3',
    name: 'Farm 3',
  },
];

export default function Home() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Farms' }} />

      <View className="px-2 bg-red-500">
        <Text>Home</Text>
        <Select defaultValue={{ value: 'apple', label: 'Apple' }}>
          <SelectTrigger>
            <SelectValue
              className="text-sm native:text-lg text-foreground"
              placeholder="Select a fruit"
            />
          </SelectTrigger>
          <SelectContent insets={contentInsets} className="w-[250px]">
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem label="Apple" value="apple">
                Apple
              </SelectItem>
              <SelectItem label="Banana" value="banana">
                Banana
              </SelectItem>
              <SelectItem label="Blueberry" value="blueberry">
                Blueberry
              </SelectItem>
              <SelectItem label="Grapes" value="grapes">
                Grapes
              </SelectItem>
              <SelectItem label="Pineapple" value="pineapple">
                Pineapple
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          onPress={() => {
            router.replace('/field/(drawer)/');
          }}>
          <Text>drawer</Text>
        </Button>
      </View>
    </>
  );
}
