import { Audio } from 'expo-av';
import { Microphone, SpeakerHigh, SpeakerNone } from 'phosphor-react-native';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAudioPlayer } from '~/lib/hooks/use-audio-player';

export const AddVoiceNote = forwardRef(
  (
    {
      setValue,
      value,
    }: {
      value?: string;
      setValue: UseFormSetValue<z.infer<typeof formSchema>>;
    },
    ref
  ) => {
    const [recording, setRecording] = useState<Audio.Recording>();

    const { t } = useTranslation();
    const voiceReplyPlayer = useAudioPlayer(value && value !== '' ? value : undefined);

    useEffect(() => {
      console.log(value);
    }, [value]);

    async function startRecording() {
      try {
        const permissionResponse = await Audio.requestPermissionsAsync();
        if (permissionResponse.status !== 'granted') {
          console.log('Audio recording permission not granted');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }

    async function stopRecording() {
      console.log('Stopping recording..');
      setRecording(undefined);
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording?.getURI();
      console.log('Recording stopped', uri);
      if (uri) setValue('voiceNote', uri);
    }

    // Expose start and stop recording methods via ref
    useImperativeHandle(ref, () => ({
      startRecording,
      stopRecording,
    }));

    return (
      <View className="flex w-full flex-col justify-between gap-2 pr-2">
        <Button
          variant="secondary"
          className="w-full"
          onPress={async () => {
            if (recording) {
              stopRecording();
            } else {
              await startRecording();
            }
          }}>
          <View className="flex flex-row gap-2">
            {recording ? (
              <Microphone size={24} weight="bold" color="red" />
            ) : (
              <Microphone size={24} weight="bold" />
            )}
            <Text>{recording ? t('stop_recording') : t('start_recording')}</Text>
          </View>
        </Button>
        {value ? (
          <Button
            variant="secondary"
            onPress={() => {
              voiceReplyPlayer.togglePlay();
            }}>
            <View className="flex flex-row gap-2">
              {voiceReplyPlayer.isPlaying ? (
                <SpeakerHigh size={24} weight="bold" color="red" />
              ) : (
                <SpeakerNone size={24} weight="bold" />
              )}
            </View>
          </Button>
        ) : null}
      </View>
    );
  }
);
