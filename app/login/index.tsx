import { zodResolver } from '@hookform/resolvers/zod';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
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

  const [loading, setLoading] = React.useState(false);

  const { signIn } = useAuth();
  const { t } = useTranslation();

  const submit = handleSubmit(async (data) => {
    setLoading(true);

    try {
      await signIn(data.email, data.password);
    } catch (error) {
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
        <Card className="w-full border-transparent bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="font-black">{t('farm_guru')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
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
          </CardContent>
        </Card>
      </View>
    </>
  );
}
