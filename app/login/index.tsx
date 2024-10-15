import { FontAwesome5 } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNetInfo } from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import * as Sentry from '@sentry/react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/hooks/use-color-scheme';
import { useAuth } from '~/lib/providers/auth-provider';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const { isDarkColorScheme } = useColorScheme();

  const [loading, setLoading] = React.useState(false);

  const { signIn } = useAuth();
  const { t } = useTranslation();

  const submit = handleSubmit(async (data) => {
    setLoading(true);

    try {
      await signIn(data.email, data.password);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'You have successfully logged in',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        //@ts-ignore
        text2: "We couldn't log you in. Please check your credentials and try again",
        visibilityTime: 2000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  const { isConnected } = useNetInfo();

  if (!isConnected) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Offline' }} />
        <View className="flex h-full justify-center">
          <Text className="text-xl font-medium">You are Offline</Text>
          <Text className="text-sm text-muted-foreground">
            It seems you are offline. Please check your internet connection and try again.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex h-full justify-center">
        <Card className="w-full justify-between border-transparent bg-transparent shadow-none">
          <CardHeader className="py-0">
            <View className="items-start justify-start">
              <Image resizeMode="cover" source={require('~/assets/farmguru.png')} />
            </View>
          </CardHeader>
          <CardContent className="gap-2">
            <Button
              onPress={() => {
                throw new Error('My first Sentry error!');
              }}
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="your@email.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="email"
            />
            {errors.email && <Text>{errors.email.message?.toString()}</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="********"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
              )}
              name="password"
            />
            {errors.password && <Text>{errors.password.message?.toString()}</Text>}

            <Button onPress={submit} disabled={loading}>
              <Text> {loading ? `${t('messages.loading')}` : `${t('login.signin')}`}</Text>
            </Button>

            {/* <Button
              onPress={() => {
                WebBrowser.openBrowserAsync(
                  'https://login.microsoftonline.com/5e007b6c-258b-4fde-adc1-8bf8a135885d/oauth2/v2.0/authorize?client_id=bcbae075-5cb8-42aa-900c-1ec403121b61&response_type=code&redirect_uri=https://api.ofi.farmguru.ai/accounts/authMobile&scope=https://graph.microsoft.com/user.read'
                );
              }}>
              <Text>
                <FontAwesome5 name="microsoft" size={24} /> {`${t('login.signin')}`}
              </Text>
            </Button> */}
          </CardContent>
        </Card>
      </View>
    </>
  );
}
