import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-audio';
import { Platform } from 'react-native';

let soundObject: Audio.Sound | null = null;

async function initializeSound() {
  if (Platform.OS === 'web' || soundObject) return;
  
  try {
    soundObject = new Audio.Sound();
    const source = require('@/assets/bubble.mp3');
    await soundObject.loadAsync(source);
  } catch (error) {
    console.log('Sound init error:', error);
    soundObject = null;
  }
}

export async function playButtonSound() {
  // Initialize sound if not already done
  if (!soundObject && Platform.OS !== 'web') {
    await initializeSound();
  }

  // Always trigger haptic feedback
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      console.log('Haptic error:', e);
    }
  }

  // Try to play sound if available
  if (soundObject && Platform.OS !== 'web') {
    try {
      const status = await soundObject.getStatusAsync();
      if (status.isLoaded) {
        // Stop if already playing and restart
        if (status.isPlaying) {
          await soundObject.stopAsync();
          await soundObject.playFromPositionAsync(0);
        } else {
          await soundObject.playAsync();
        }
      }
    } catch (error) {
      console.log('Play sound error:', error);
    }
  }
}
