import * as IP from 'expo-image-picker';
import { CameraPlus, ImageSquare, ImagesSquare } from 'phosphor-react-native';
import { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Image, Modal, Platform, View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Text } from '~/components/ui/text';

export const AddPhoto = ({
  setValue,
  value,
}: {
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  value?: string;
}) => {
  const openCamera = async () => {
    const permissionResult = await IP.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    const result = await IP.launchCameraAsync();
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setValue('photo', uri);
    }
  };

  const pickImage = async () => {
    const result = await IP.launchImageLibraryAsync({
      mediaTypes: IP.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setValue('photo', uri);
    }
  };

  const [viewImageModal, setViewImageModal] = useState(false);

  return (
    <View className="flex w-full justify-between gap-2 pr-2">
      <Popover className="w-full">
        <PopoverTrigger asChild className="w-full">
          <Button variant="secondary" className="w-full">
            <View className="flex flex-row gap-2">
              <ImageSquare size={24} weight="bold" />
              {value ? <Text>Change Image</Text> : <Text>Add Image</Text>}
            </View>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full gap-2" side={Platform.OS === 'web' ? 'bottom' : 'top'}>
          <View className="flex w-full flex-row gap-2 pr-2">
            <Button size="lg" className="w-1/2" onPress={() => openCamera()}>
              <View className="flex flex-row gap-2">
                <CameraPlus size={24} weight="bold" color="white" />
                <Text>Camera</Text>
              </View>
            </Button>
            <Button size="lg" className="w-1/2" onPress={() => pickImage()}>
              <View className="flex flex-row gap-2">
                <ImagesSquare size={24} weight="bold" color="white" />
                <Text>Gallery</Text>
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
                <Text>View Selected Image</Text>
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
              <Text>Close</Text>
            </Button>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};