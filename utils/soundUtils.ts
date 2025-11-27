import { Audio } from 'expo-audio';
import { Platform } from 'react-native';

let sound: Audio.Sound | null = null;
let isLoading = false;

const bubblePopSound = require('@/assets/bubble-pop.mp3');

export async function playButtonSound() {
  if (Platform.OS === 'web') return;
  if (isLoading) return;

  try {
    if (!sound) {
      isLoading = true;
      sound = new Audio.Sound();
      await sound.loadAsync(bubblePopSound);
      isLoading = false;
    }

    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.stopAsync();
        await sound.playFromPositionAsync(0);
      } else {
        await sound.playAsync();
      }
    }
  } catch (error) {
    console.log('Error playing sound:', error);
    isLoading = false;
  }
}

export async function unloadSound() {
  if (sound) {
    try {
      await sound.unloadAsync();
      sound = null;
    } catch (error) {
      console.log('Error unloading sound:', error);
    }
  }
}
