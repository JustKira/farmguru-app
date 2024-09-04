import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
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

  const { signIn } = useAuth();

  const submit = handleSubmit((data) => {
    signIn(data.email, data.password, '/');
  });

  return (
    <SafeAreaView className="flex-1 gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
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

          <Button onPress={submit}>
            <Text>Submit</Text>
          </Button>
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}
