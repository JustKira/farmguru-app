import { Audio } from 'expo-av';
import { Microphone, SpeakerHigh, SpeakerNone } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { formSchema } from '.';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAudioPlayer } from '~/lib/hooks/use-audio-player';

export const AddVoiceNote = ({
  setValue,
  value,
}: {
  value?: string;
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
}) => {
  const [recording, setRecording] = useState<Audio.Recording>();

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
          <Text>{recording ? 'Stop Recording' : 'Record Voice Note'}</Text>
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
            <Text> {voiceReplyPlayer.isPlaying ? 'Stop' : 'Play'}</Text>
          </View>
        </Button>
      ) : null}
    </View>
  );
};
