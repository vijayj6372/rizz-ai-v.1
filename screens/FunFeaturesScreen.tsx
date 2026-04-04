import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type FunFeaturesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "FunFeatures">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springCfg = { damping: 15, mass: 0.3, stiffness: 150, overshootClamping: true as const };

function triggerHaptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

interface FeatureCardProps {
  title: string;
  subtitle: string;
  badge: string;
  borderColor: string;
  iconBg: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function FeatureCard({ title, subtitle, badge, borderColor, iconBg, icon, onPress }: FeatureCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96, springCfg); };
  const handlePressOut = () => { scale.value = withSpring(1, springCfg); };
  const handlePress = async () => {
    triggerHaptic();
    await playButtonSound();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, { borderColor }, animatedStyle]}
    >
      <View style={[styles.cardIconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>

      <View style={styles.cardTextCol}>
        <Text style={[styles.cardTitle, { color: borderColor }]}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.cardBadge}>{badge}</Text>
        <Ionicons name="chevron-forward" size={20} color={borderColor} />
      </View>
    </AnimatedPressable>
  );
}

export default function FunFeaturesScreen({ navigation }: FunFeaturesScreenProps) {
  const insets = useSafeAreaInsets();

  const features: FeatureCardProps[] = [
    {
      title: "Roast My Selfie",
      subtitle: "SAVAGE MODE · NO MERCY",
      badge: "🔥🔥🔥",
      borderColor: "#FF6B35",
      iconBg: "#FF6B35",
      icon: <Ionicons name="camera" size={36} color="#fff" />,
      onPress: () => navigation.navigate("RoastMySelfie"),
    },
    {
      title: "Rate My Crush",
      subtitle: "HONEST RATING · 1–10",
      badge: "💕💕",
      borderColor: "#E040A0",
      iconBg: "#E040A0",
      icon: <Ionicons name="heart" size={36} color="#fff" />,
      onPress: () => navigation.navigate("RateMyCrush"),
    },
    {
      title: "Hot or Not",
      subtitle: "COMPARE 2 PICS · WHO WINS?",
      badge: "⭐⭐",
      borderColor: "#C8A800",
      iconBg: "#C8A800",
      icon: <Text style={styles.vsText}>VS</Text>,
      onPress: () => navigation.navigate("HotOrNot"),
    },
    {
      title: "Lookmaxing Tips",
      subtitle: "GLOW-UP GUIDE · LEVEL UP FAST",
      badge: "✨",
      borderColor: "#00CFA8",
      iconBg: "#00CFA8",
      icon: <MaterialCommunityIcons name="mirror" size={36} color="#fff" />,
      onPress: () => navigation.navigate("LookmaxingTips"),
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>AI Features</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#100820",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E0F38",
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    gap: 14,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  vsText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cardBadge: {
    fontSize: 16,
  },
});
