import React from "react";
import { View, StyleSheet, Pressable, Image, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  runOnJS,
} from "react-native-reanimated";
import { Text } from "react-native";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ActionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function triggerHaptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

function ActionCard({ icon, title, subtitle, onPress }: ActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    triggerHaptic();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionCard, animatedStyle]}
    >
      <Feather name={icon} size={48} color={AppColors.white} />
      <Text style={styles.actionCardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.actionCardSubtitle}>{subtitle}</Text> : null}
    </AnimatedPressable>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const handleUploadScreenshot = async () => {
    navigation.navigate("PickupLine", { fromScreenshot: true });
  };

  const handleGetPickupLine = () => {
    navigation.navigate("PickupLine", { fromScreenshot: false });
  };

  return (
    <LinearGradient
      colors={[AppColors.background.gradientTop, AppColors.background.gradientBottom]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Rizz AI</Text>
        </View>

        <View style={styles.cardsContainer}>
          <ActionCard
            icon="maximize"
            title="Upload Screenshot"
            subtitle="of a Convo"
            onPress={handleUploadScreenshot}
          />
          
          <ActionCard
            icon="message-circle"
            title="Give me a pickup"
            subtitle="line"
            onPress={handleGetPickupLine}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
    borderRadius: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: AppColors.primary,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing["2xl"],
    paddingBottom: Spacing["5xl"],
  },
  actionCard: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.white,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  actionCardSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.white,
    textAlign: "center",
    opacity: 0.9,
  },
});
