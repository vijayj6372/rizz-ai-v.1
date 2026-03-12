import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import mobileAds from 'react-native-google-mobile-ads';

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SplashScreenView from "@/components/SplashScreenView";

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function App() {
  const [fontsLoaded] = useFonts({
    "LilitaOne-Regular": require("./assets/fonts/LilitaOne-Regular.ttf"),
  });

  // Controls whether our custom animated splash is still showing
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Hide native OS splash as soon as fonts are ready;
      // our custom in-app splash takes over from here
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (Platform.OS !== "web") {
          await setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
          });
        }
      } catch {
        // Audio initialization failed silently – app still works
      }
    };
    initializeAudio();
    // Initialize Mobile Ads
    mobileAds().initialize().then((adapterStatuses) => {
      console.log('AdMob Initialized');
    });
  }, []);

  if (!fontsLoaded) {
    return null; // Native splash screen stays visible
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
          <KeyboardProvider>
            <NavigationContainer>
              <RootStackNavigator />
            </NavigationContainer>
            <StatusBar style="dark" />

            {/* Custom animated logo splash — overlays everything until done */}
            {showCustomSplash && (
              <SplashScreenView onFinish={() => setShowCustomSplash(false)} />
            )}
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
