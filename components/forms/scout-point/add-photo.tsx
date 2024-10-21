import * as IP from 'expo-image-picker';
import { CameraPlus, ImageSquare, ImagesSquare } from 'phosphor-react-native';
import { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Image, Modal, Platform, View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';
import Toast from 'react-native-toast-message';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Text } from '~/components/ui/text';
import { useTranslation } from 'react-i18next';

export const AddPhoto = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value?: string;
}) => {
  const openCamera = async () => {
    try {
      const permissionResult = await IP.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          // @ts-ignore
          text2: "You've refused to allow this app to access your camera!",
          visibilityTime: 2000,
        });
        return;
      }
      const result = await IP.launchCameraAsync();
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setValue('photo', uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        // @ts-ignore
        text2: 'Failed to get Photo',
        visibilityTime: 2000,
      });
    }
  };

  const pickImage = async () => {
    try {
      const result = await IP.launchImageLibraryAsync({
        mediaTypes: IP.MediaTypeOptions.All,
        quality: 1,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setValue('photo', uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        // @ts-ignore
        text2: 'Failed to get Photo',
        visibilityTime: 2000,
      });
    }
  };
  const [viewImageModal, setViewImageModal] = useState(false);
  const { t } = useTranslation();
  return (
    <View className="flex w-full justify-between gap-2 pr-2">
      <Popover className="w-full">
        <PopoverTrigger asChild className="w-full">
          <Button variant="secondary" className="w-full">
            <View className="flex flex-row gap-2">
              <ImageSquare size={24} weight="bold" />
              <Text>
                {value
                  ? t('change_image')
                  : t('select', {
                      name: t('image'),
                    })}
              </Text>
            </View>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full gap-2" side={Platform.OS === 'web' ? 'bottom' : 'top'}>
          <View className="flex w-full flex-row gap-2 pr-2">
            <Button size="lg" className="w-1/2" onPress={() => openCamera()}>
              <View className="flex flex-row gap-2">
                <CameraPlus size={24} weight="bold" color="white" />
                <Text>{t('camera')}</Text>
              </View>
            </Button>
            <Button size="lg" className="w-1/2" onPress={() => pickImage()}>
              <View className="flex flex-row gap-2">
                <ImagesSquare size={24} weight="bold" color="white" />
                <Text>{t('gallery')}</Text>
              </View>
            </Button>
          </View>
          {value ? (
            <Button
              size="lg"
              variant="ghost"
              className="w-full"
              onPress={() => setViewImageModal(true)}>
              <View className="flex flex-row gap-2">
                <ImagesSquare size={24} weight="bold" />
                <Text>{t('view_photo')}</Text>
              </View>
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
      {viewImageModal && value ? (
        <Modal
          animationType="slide"
          visible={viewImageModal}
          onRequestClose={() => {
            setViewImageModal(!viewImageModal);
          }}>
          <View className="w-full flex-1 items-center justify-center gap-2  p-4">
            <View className="rounded-lg bg-white">
              <Image source={{ uri: value }} className="h-[400px] w-[400px]" />
            </View>
            <Button className="w-full" onPress={() => setViewImageModal(false)}>
              <Text>{t('cancel')}</Text>
            </Button>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};
