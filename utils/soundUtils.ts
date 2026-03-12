import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let sound: any = null;
let isInitialized = false;

const initSound = async () => {
  if (isInitialized || Platform.OS === 'web') return;

  try {
    isInitialized = true;
    if (Audio?.Sound) {
      sound = new Audio.Sound();
      const source = require('@/assets/button-press.wav');
      await sound.loadAsync(source);
    }
  } catch (error) {
    // Sound initialization not available
    isInitialized = false;
    sound = null;
  }
};

// Initialize immediately
initSound().catch(() => {});

export const playButtonSound = async () => {
  if (Platform.OS === 'web' || !sound) return;

  try {
    if (!sound?.getStatusAsync) return;

    const status = await sound.getStatusAsync();

    if (!status?.isLoaded) {
      await sound.loadAsync(require('@/assets/button-press.wav'));
    }

    if (status?.isPlaying) {
      await sound.stopAsync();
      await sound.playAsync();
    } else {
      await sound.playAsync();
    }
  } catch (error) {
    // Audio playback error - silently fail
  }
};
