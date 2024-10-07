import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useLanguage } from '~/lib/providers/language-provider';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage } = useLanguage();
  return (
    <>
      <Stack.Screen
        options={{
          title: t('navigation.profile'),
        }}
      />
      <View className="gap-2 px-2">
        <Button variant="default" onPress={() => router.push('/logout')}>
          <Text>{t('signout')}</Text>
        </Button>
        <Button
          onPress={() => {
            changeLanguage(currentLanguage === 'ar' ? 'en' : 'ar');
          }}>
          <Text>Change Language {currentLanguage === 'ar' ? 'English' : 'Arabic'}</Text>
        </Button>
      </View>
    </>
  );
}
