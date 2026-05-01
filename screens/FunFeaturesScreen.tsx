import React, { useRef } from "react";
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
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type FunFeaturesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "FunFeatures">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const springCfg = { damping: 14, mass: 0.25, stiffness: 180, overshootClamping: false as const };

function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

interface FeatureCardProps {
  title: string;
  subtitle: string;
  badge: string;
  glowColor: string;
  iconBg: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function FeatureCard({ title, subtitle, badge, glowColor, iconBg, icon, onPress }: FeatureCardProps) {
  const scale = useSharedValue(1);
  const brightness = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: brightness.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.955, springCfg);
    brightness.value = withTiming(0.88, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springCfg);
    brightness.value = withTiming(1, { duration: 150 });
  };
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
      style={[
        styles.card,
        {
          borderColor: glowColor + "70",
          shadowColor: glowColor,
        },
        animatedStyle,
      ]}
    >
      {/* Left glow accent bar */}
      <View style={[styles.cardAccentBar, { backgroundColor: glowColor }]} />

      {/* Icon */}
      <View style={[styles.cardIconBox, { backgroundColor: iconBg + "30" }]}>
        <View style={[styles.cardIconInner, { backgroundColor: iconBg }]}>
          {icon}
        </View>
      </View>

      {/* Text */}
      <View style={styles.cardTextCol}>
        <Text style={[styles.cardTitle, { color: glowColor }]}>{title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>

      {/* Right side */}
      <View style={styles.cardRight}>
        <Text style={styles.cardBadge}>{badge}</Text>
        <View style={[styles.chevronBox, { backgroundColor: glowColor + "20" }]}>
          <Ionicons name="chevron-forward" size={15} color={glowColor} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function FunFeaturesScreen({ navigation }: FunFeaturesScreenProps) {
  const insets = useSafeAreaInsets();

  const features: FeatureCardProps[] = [
    {
      title: "Roast My Selfie",
      subtitle: "SAVAGE AI · NO MERCY MODE",
      badge: "🔥🔥🔥",
      glowColor: "#FF6B35",
      iconBg: "#FF6B35",
      icon: <Ionicons name="camera" size={28} color="#fff" />,
      onPress: () => navigation.navigate("RoastMySelfie"),
    },
    {
      title: "Rate My Crush",
      subtitle: "GET AN HONEST RATING · 1–10",
      badge: "💕💕💕",
      glowColor: "#E040A0",
      iconBg: "#E040A0",
      icon: <Ionicons name="heart" size={28} color="#fff" />,
      onPress: () => navigation.navigate("RateMyCrush"),
    },
    {
      title: "Hot or Not",
      subtitle: "COMPARE 2 PICS · WHO WINS?",
      badge: "⭐⭐⭐",
      glowColor: "#D4A800",
      iconBg: "#D4A800",
      icon: <Text style={styles.vsText}>VS</Text>,
      onPress: () => navigation.navigate("HotOrNot"),
    },
    {
      title: "Lookmaxing Tips",
      subtitle: "GLOW-UP GUIDE · LEVEL UP FAST",
      badge: "✨✨",
      glowColor: "#00CFA8",
      iconBg: "#00CFA8",
      icon: <MaterialCommunityIcons name="mirror" size={28} color="#fff" />,
      onPress: () => navigation.navigate("LookmaxingTips"),
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>🔥 Roast AI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Robot intro card */}
        <View style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <Text style={styles.introRobot}>🤖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTop}>Your AI judge is ready.</Text>
            <Text style={styles.introSub}>
              Choose your roast mode <Text style={styles.introDevil}>😈</Text>
            </Text>
          </View>
          <View style={styles.introPulse}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseLabel}>LIVE</Text>
          </View>
        </View>

        {/* Feature cards */}
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}

        {/* Bottom tag */}
        <View style={styles.offlineTag}>
          <Ionicons name="wifi-outline" size={12} color="rgba(255,255,255,0.2)" />
          <Text style={styles.offlineText}>100% offline · no data sent · instant results</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0E0720",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  list: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4,
  },

  /* Intro card */
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1A0B30",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  introIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  introRobot: { fontSize: 28 },
  introTop: { color: "#fff", fontWeight: "700", fontSize: 15, marginBottom: 3 },
  introSub: { color: "#E040A0", fontWeight: "700", fontSize: 13 },
  introDevil: { fontSize: 14 },
  introPulse: {
    alignItems: "center",
    gap: 3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00FF88",
  },
  pulseLabel: {
    color: "#00FF88",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  /* Feature card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#160C2C",
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 0,
    gap: 12,
    overflow: "hidden",
    elevation: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  cardAccentBar: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginLeft: 0,
    alignSelf: "stretch",
  },
  cardIconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  cardIconInner: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  vsText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  cardTextCol: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 0.8,
  },
  cardRight: {
    alignItems: "center",
    gap: 8,
  },
  cardBadge: {
    fontSize: 14,
    lineHeight: 18,
  },
  chevronBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  offlineTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
    paddingVertical: 8,
  },
  offlineText: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 11,
    fontWeight: "500",
  },
});
