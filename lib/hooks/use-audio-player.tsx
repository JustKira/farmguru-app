import { Audio } from 'expo-av';
import { useState, useEffect, useCallback } from 'react';

export function useAudioPlayer(uri?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup function to release the sound when the component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  }, []);

  const playSound = useCallback(async () => {
    if (!uri) return;
    console.log('Loading Sound', uri);
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    setSound(newSound);
    console.log('Loaded Sound', await newSound.getStatusAsync());
    console.log('Playing Sound');
    await newSound.playAsync();
    setIsPlaying(true);
  }, [uri, onPlaybackStatusUpdate]);

  const stopSound = useCallback(async () => {
    if (sound) {
      console.log('Stopping Sound');
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }, [sound]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound();
    }
  }, [isPlaying, playSound, stopSound]);

  return {
    isPlaying,
    playSound,
    stopSound,
    togglePlay,
  };
}
