import { X } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View, Image } from 'react-native';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

interface ImageViewerProps {
  imageUri?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUri }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    console.log('imageUri', imageUri);
  }, [imageUri]);

  if (!imageUri) {
    return <></>;
  }

  return (
    <View>
      <Button variant="secondary" onPress={() => setIsModalVisible(true)}>
        <Text>{t('view_photo')}</Text>
      </Button>
      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View>
          <View>
            <Button onPress={() => setIsModalVisible(false)}>
              <X size={24} color="#FFFFFF" />
            </Button>
            <Image source={{ uri: imageUri }} resizeMode="contain" />
            <Button onPress={() => setIsModalVisible(false)}>
              <Text>{t('cancel')}</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};
