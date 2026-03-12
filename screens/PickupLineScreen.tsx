import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Text,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { getRandomPickupLines } from "@/data/pickupLines";
import CopiedToast from "@/components/CopiedToast";
import { playButtonSound } from "@/utils/soundUtils";
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

type Props = NativeStackScreenProps<RootStackParamList, "PickupLine">;

const CARD_PINK = "#F86B6D";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

function triggerCopyHaptic() {
  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

interface MessageBubbleProps {
  text: string;
  index: number;
  onCopy: (text: string) => void;
}

function MessageBubble({ text, index, onCopy }: MessageBubbleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCopy = useCallback(() => {
    onCopy(text);
  }, [text, onCopy]);

  const handleGestureStart = () => {
    scale.value = withSequence(
      withSpring(0.95, springConfig),
      withSpring(1.05, springConfig),
      withSpring(1, springConfig)
    );
    runOnJS(handleCopy)();
  };

  const tap = Gesture.Tap().onStart(handleGestureStart);
  const longPress = Gesture.LongPress().onStart(handleGestureStart);
  const gestures = Gesture.Race(tap, longPress);

  return (
    <Animated.View entering={FadeInRight.delay(index * 200).springify()}>
      <GestureDetector gesture={gestures}>
        <Animated.View style={[styles.messageBubble, animatedStyle]}>
          <Text style={styles.messageText}>{text}</Text>
          <View style={styles.messageTail} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

interface ChiliSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

function ChiliSlider({ value, onValueChange }: ChiliSliderProps) {
  const sliderWidth = 280;
  const thumbSize = 52;
  const sliderTrackWidth = sliderWidth - thumbSize;

  const translateX = useSharedValue(value * sliderTrackWidth);

  useAnimatedReaction(
    () => value,
    (newValue) => {
      translateX.value = withSpring(newValue * sliderTrackWidth, {
        damping: 10,
        mass: 1,
        stiffness: 100,
      });
    },
    [value]
  );

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const newX = Math.max(0, Math.min(event.x - thumbSize / 2, sliderTrackWidth));
      translateX.value = newX;
      const newValue = newX / sliderTrackWidth;
      runOnJS(onValueChange)(newValue);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.sliderContainer}>
        <LinearGradient
          colors={["#FB923C", "#F97316", "#EF4444"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sliderTrack}
        />
        <Animated.View
          style={[
            styles.sliderThumb,
            animatedThumbStyle,
          ]}
        >
          <Text style={styles.chiliEmoji}>🌶️</Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default function PickupLineScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [pickupLines, setPickupLines] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0.5);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const generateNewLines = useCallback(() => {
    const newLines = getRandomPickupLines();
    setPickupLines(newLines);
  }, []);

  // Generate lines on first load
  React.useEffect(() => {
    generateNewLines();
  }, []);

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      await playButtonSound();
      triggerCopyHaptic();
      setShowCopiedToast(true);
    } catch (error) {
      console.log("Failed to copy:", error);
    }
  }, []);

  const handleGimmeAnother = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await playButtonSound();
    generateNewLines();
  };

  return (
    <LinearGradient
      colors={["#ABBFF2", "#BCCFFA"]}
      style={styles.container}
    >
      <CopiedToast visible={showCopiedToast} onHide={() => setShowCopiedToast(false)} />

      {/* ── Custom Header (back arrow + Rizz AI title, no + button) ── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        {/* Back Arrow */}
        <Pressable
          style={styles.headerButton}
          onPress={async () => {
            await playButtonSound();
            navigation.goBack();
          }}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={34} color={CARD_PINK} />
        </Pressable>

        {/* Rizz AI Title */}
        <View style={styles.headerTitleWrapper}>
          {/* White outline layers */}
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: -3 }, { translateY: 0 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 3 }, { translateY: 0 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 0 }, { translateY: -3 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 0 }, { translateY: 3 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: -2 }, { translateY: -2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 2 }, { translateY: -2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: -2 }, { translateY: 2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 2 }, { translateY: 2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          {/* Main title */}
          <Text style={styles.headerTitle}>Rizz AI</Text>
        </View>

        {/* Empty spacer to balance the back arrow */}
        <View style={styles.headerButton} />
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        <View style={styles.messagesContainer}>
          {pickupLines.map((line, index) => (
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
            <Text style={styles.hintText}>Tap or press any line to copy</Text>
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

        {/* ── Banner Ad ── */}
        <View style={styles.adContainer}>
          <BannerAd
            unitId="ca-app-pub-3940256099942544/9214589741"
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ── Custom Header ── */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleOutline: {
    position: "absolute",
    fontSize: 30,
    fontFamily: "LilitaOne-Regular",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "LilitaOne-Regular",
    color: CARD_PINK,
    letterSpacing: 1,
  },

  /* ── Content ── */
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
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
    width: "100%",
    maxWidth: 320,
    height: 60,
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 20,
  },
  sliderTrack: {
    height: 16,
    borderRadius: 8,
    width: "100%",
  },
  sliderThumb: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    top: 4, // 30 (center of 60px container) - 26 (half of 52px thumb height)
    left: 20, // offset by padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  chiliEmoji: {
    fontSize: 28,
  },
  gimmeButton: {
    backgroundColor: CARD_PINK,
    borderRadius: 36,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing["4xl"],
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#D95657",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  gimmeButtonText: {
    color: AppColors.white,
    fontSize: 24,
    fontWeight: "800",
  },
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
});
