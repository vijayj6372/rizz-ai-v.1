import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeInRight,
  WithSpringConfig,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Text } from "react-native";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { getRandomPickupLines } from "@/data/pickupLines";

type Props = NativeStackScreenProps<RootStackParamList, "PickupLine">;

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

interface MessageBubbleProps {
  text: string;
  index: number;
  onCopy: (text: string) => void;
}

function MessageBubble({ text, index, onCopy }: MessageBubbleProps) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(AppColors.messageBubble);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCopy = useCallback(() => {
    onCopy(text);
  }, [text, onCopy]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      scale.value = withSequence(
        withSpring(0.95, springConfig),
        withSpring(1.05, springConfig),
        withSpring(1, springConfig)
      );
      runOnJS(handleCopy)();
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      scale.value = withSequence(
        withSpring(0.98, springConfig),
        withSpring(1, springConfig)
      );
      runOnJS(handleCopy)();
    });

  const gesture = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={FadeInRight.delay(index * 200).springify()}
        style={[styles.messageBubble, animatedStyle]}
      >
        <Text style={styles.messageText}>{text}</Text>
        <View style={styles.messageTail} />
      </Animated.View>
    </GestureDetector>
  );
}

interface ChiliSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

function ChiliSlider({ value, onValueChange }: ChiliSliderProps) {
  const sliderWidth = 280;
  const thumbSize = 50;

  return (
    <View style={styles.sliderContainer}>
      <LinearGradient
        colors={[AppColors.slider.left, AppColors.slider.right]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sliderTrack}
      />
      <View
        style={[
          styles.sliderThumb,
          { left: value * (sliderWidth - thumbSize) },
        ]}
      >
        <Image
          source={require("../assets/images/chili-pepper.png")}
          style={styles.chiliIcon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

export default function PickupLineScreen({ navigation, route }: Props) {
  const { fromScreenshot } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [pickupLines, setPickupLines] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0.5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasLoadedLines, setHasLoadedLines] = useState(false);

  const generateNewLines = useCallback(() => {
    const newLines = getRandomPickupLines();
    setPickupLines(newLines);
  }, []);

  const handleImagePickerFlow = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        if (Platform.OS !== "web") {
          Alert.alert(
            "Permission Required",
            "Please allow access to your photo library to upload screenshots.",
            [{ text: "OK" }]
          );
        }
        generateNewLines();
        setHasLoadedLines(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          generateNewLines();
          setHasLoadedLines(true);
        }, 1500);
      } else {
        generateNewLines();
        setHasLoadedLines(true);
      }
    } catch (error) {
      generateNewLines();
      setHasLoadedLines(true);
    }
  }, [generateNewLines]);

  useEffect(() => {
    if (fromScreenshot) {
      handleImagePickerFlow();
    } else {
      generateNewLines();
      setHasLoadedLines(true);
    }
  }, [fromScreenshot, handleImagePickerFlow, generateNewLines]);

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (Platform.OS === "web") {
        alert("Copied to clipboard!");
      }
    } catch (error) {
      console.log("Failed to copy:", error);
    }
  }, []);

  const handleGimmeAnother = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    generateNewLines();
  };

  return (
    <LinearGradient
      colors={[AppColors.background.gradientTop, AppColors.background.gradientBottom]}
      style={styles.container}
    >
      <Modal
        visible={isAnalyzing}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.analysisModal}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.analysisText}>Analyzing screenshot...</Text>
          </View>
        </View>
      </Modal>

      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.messagesContainer}>
          {hasLoadedLines && pickupLines.map((line, index) => (
            <MessageBubble
              key={`${line}-${index}`}
              text={line}
              index={index}
              onCopy={handleCopyText}
            />
          ))}
        </View>

        <Animated.View 
          entering={FadeIn.delay(600)}
          style={styles.hintContainer}
        >
          <Text style={styles.hintText}>Tap to copy pickup line</Text>
        </Animated.View>

        <View style={styles.bottomSection}>
          <ChiliSlider value={sliderValue} onValueChange={setSliderValue} />

          <Pressable
            onPress={handleGimmeAnother}
            style={({ pressed }) => [
              styles.gimmeButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <Text style={styles.gimmeButtonText}>gimme another</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  messageBubble: {
    backgroundColor: AppColors.messageBubble,
    borderRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.xs,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    maxWidth: "85%",
    position: "relative",
  },
  messageText: {
    color: AppColors.white,
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 24,
  },
  messageTail: {
    position: "absolute",
    bottom: 0,
    right: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: AppColors.messageBubble,
    borderTopWidth: 12,
    borderTopColor: "transparent",
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  hintContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  bottomSection: {
    alignItems: "center",
    gap: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  sliderContainer: {
    width: 280,
    height: 50,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    width: "100%",
  },
  sliderThumb: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    top: -21,
  },
  chiliIcon: {
    width: 32,
    height: 32,
  },
  gimmeButton: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["4xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  gimmeButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  analysisModal: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing["3xl"],
    alignItems: "center",
    gap: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  analysisText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textDark,
  },
});
