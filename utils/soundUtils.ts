import { Audio } from 'expo-audio';
import { Platform } from 'react-native';

let sound: Audio.Sound | null = null;
let isInitialized = false;

const initSound = async () => {
  if (isInitialized || Platform.OS === 'web') return;

  try {
    isInitialized = true;
    sound = new Audio.Sound();
    const source = require('@/assets/bubble.mp3');
    await sound.loadAsync(source);
  } catch (error) {
    console.log('Sound init error:', error);
    isInitialized = false;
  }
};

// Initialize immediately
initSound();

export const playButtonSound = async () => {
  if (Platform.OS === 'web') return;

  // Initialize if not done yet
  if (!sound) {
    await initSound();
  }

  try {
    if (!sound) return;

    const status = await sound.getStatusAsync();

    if (!status.isLoaded) {
      await sound.loadAsync(require('@/assets/bubble.mp3'));
    }

    if (status.isPlaying) {
      await sound.stopAsync();
      await sound.playAsync();
    } else {
      await sound.playAsync();
    }
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};
