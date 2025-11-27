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
  Text,
} from "react-native";
import Slider from "@react-native-community/slider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { MediaType } from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
  FadeInRight,
  WithSpringConfig,
} from "react-native-reanimated";
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

function triggerCopyHaptic() {
  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

function triggerLightHaptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

function MessageBubble({ text, index, onCopy }: MessageBubbleProps) {
  const scale = useSharedValue(1);

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

  return (
    <GestureDetector gesture={doubleTap}>
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
  min?: number;
  max?: number;
}

function ChiliSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
}: ChiliSliderProps) {
  return (
    <View style={styles.sliderContainer}>
      {/* Gradient Track Background */}
      <LinearGradient
        colors={["#FB923C", "#F97316", "#EF4444"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.trackBackground}
      />

      {/* Slider */}
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onValueChange}
        minimumValue={min}
        maximumValue={max}
        step={1}
        minimumTrackTintColor="transparent"
        maximumTrackTintColor="transparent"
        thumbTintColor="transparent"
      />

      {/* Custom Chili Thumb */}
      <View
        style={[
          styles.thumbContainer,
          { left: `${(value / max) * 100}%` },
        ]}
        pointerEvents="none"
      >
        <View style={styles.thumb}>
          <Text style={styles.chiliEmoji}>🌶️</Text>
        </View>
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
        mediaTypes: ["images"] as MediaType[],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          generateNewLines();
          setHasLoadedLines(true);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
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
      triggerCopyHaptic();
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
          <View style={styles.hintRow}>
            <Text style={styles.lightbulbEmoji}>💡</Text>
            <Text style={styles.hintText}>Double tap any line to copy</Text>
          </View>
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
    marginBottom: Spacing.xl,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  lightbulbEmoji: {
    fontSize: 24,
  },
  hintText: {
    fontSize: 16,
    color: "#5A7A8A",
    fontWeight: "500",
  },
  bottomSection: {
    alignItems: "center",
    gap: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  sliderContainer: {
    height: 60,
    justifyContent: "center",
    position: "relative",
  },
  trackBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    borderRadius: 6,
    top: "50%",
    marginTop: -6,
  },
  slider: {
    width: "100%",
    height: 60,
    zIndex: 2,
  },
  thumbContainer: {
    position: "absolute",
    top: "50%",
    marginTop: -32,
    marginLeft: -32,
    zIndex: 1,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chiliEmoji: {
    fontSize: 32,
  },
  gimmeButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 32,
    paddingVertical: Spacing.lg + 4,
    paddingHorizontal: Spacing["4xl"] + 24,
    width: "100%",
    alignItems: "center",
  },
  gimmeButtonText: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: "600",
    fontStyle: "italic",
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
  },
  analysisText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textDark,
  },
});
