import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  desc: string;
  badge: string;
  glowColor: string;
  gradColors: readonly [string, string];
  icon: React.ReactNode;
  onPress: () => void;
}

function FeatureCard({ title, subtitle, desc, badge, glowColor, gradColors, icon, onPress }: FeatureCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springCfg);
    opacity.value = withTiming(0.9, { duration: 80 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springCfg);
    opacity.value = withTiming(1, { duration: 120 });
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
      style={animatedStyle}
    >
      {/* Card outer glow ring */}
      <View style={[styles.cardGlowRing, { borderColor: glowColor + "55", shadowColor: glowColor }]}>
        {/* Card bg gradient */}
        <LinearGradient
          colors={["#1E0D38", "#120828"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBg}
        >
          {/* Subtle tinted overlay from left */}
          <View style={[styles.cardColorOverlay, { backgroundColor: glowColor + "09" }]} />

          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: glowColor }]} />

          {/* Icon */}
          <View style={[styles.iconOuter, { backgroundColor: glowColor + "18" }]}>
            <LinearGradient
              colors={gradColors}
              style={styles.iconInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {icon}
            </LinearGradient>
          </View>

          {/* Text */}
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: glowColor }]}>{title}</Text>
            <Text style={styles.cardSub}>{subtitle}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
          </View>

          {/* Right */}
          <View style={styles.cardRight}>
            <Text style={styles.cardBadge}>{badge}</Text>
            <LinearGradient
              colors={gradColors}
              style={styles.chevronBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </LinearGradient>
          </View>
        </LinearGradient>
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
      desc: "Upload a photo and get brutally honest feedback",
      badge: "🔥🔥🔥",
      glowColor: "#FF6B35",
      gradColors: ["#FF8C42", "#FF4500"],
      icon: <Ionicons name="camera" size={30} color="#fff" />,
      onPress: () => navigation.navigate("RoastMySelfie"),
    },
    {
      title: "Rate My Crush",
      subtitle: "GET AN HONEST RATING · 1–10",
      desc: "Find out exactly how attractive they really are",
      badge: "💕💕💕",
      glowColor: "#E040A0",
      gradColors: ["#F06292", "#C2185B"],
      icon: <Ionicons name="heart" size={30} color="#fff" />,
      onPress: () => navigation.navigate("RateMyCrush"),
    },
    {
      title: "Hot or Not",
      subtitle: "COMPARE 2 PICS · WHO WINS?",
      desc: "Head-to-head battle — only one can win",
      badge: "⭐⭐⭐",
      glowColor: "#D4A800",
      gradColors: ["#FFD740", "#F9A825"],
      icon: <Text style={styles.vsText}>VS</Text>,
      onPress: () => navigation.navigate("HotOrNot"),
    },
    {
      title: "Lookmaxing Tips",
      subtitle: "GLOW-UP GUIDE · LEVEL UP FAST",
      desc: "200+ science-backed tips to maximize your looks",
      badge: "✨✨",
      glowColor: "#00CFA8",
      gradColors: ["#26D0CE", "#1A2980"],
      icon: <MaterialCommunityIcons name="mirror" size={30} color="#fff" />,
      onPress: () => navigation.navigate("LookmaxingTips"),
    },
  ];

  return (
    <LinearGradient
      colors={["#0A041A", "#0E0720", "#130929"]}
      style={styles.screen}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={async () => { await playButtonSound(); navigation.goBack(); }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>🔥</Text>
          <Text style={styles.headerTitle}>Roast AI</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <LinearGradient
          colors={["#22103C", "#180C30"]}
          style={styles.introCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Tinted border glow */}
          <View style={styles.introGlowBorder} />

          <View style={styles.introIconWrap}>
            <Text style={styles.introRobot}>🤖</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.introHeading}>Your AI judge is ready.</Text>
            <Text style={styles.introSub}>
              Choose your roast mode <Text style={styles.introDevil}>😈</Text>
            </Text>
          </View>

          {/* Live badge */}
          <View style={styles.liveBadge}>
            <View style={styles.liveDotOuter}>
              <View style={styles.liveDotInner} />
            </View>
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>
        </LinearGradient>

        {/* Feature cards */}
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={13} color="rgba(255,255,255,0.18)" />
          <Text style={styles.footerText}>100% offline · no data sent · instant results</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerEmoji: { fontSize: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  /* Scroll list */
  list: {
    paddingHorizontal: 16,
    gap: 13,
    paddingTop: 6,
  },

  /* Intro card */
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    paddingVertical: 15,
    paddingHorizontal: 16,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#7B2FBE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  introGlowBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(224,64,160,0.35)",
  },
  introIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  introRobot: { fontSize: 28 },
  introHeading: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 3,
  },
  introSub: {
    color: "#E040A0",
    fontWeight: "700",
    fontSize: 13,
  },
  introDevil: { fontSize: 14 },
  liveBadge: {
    alignItems: "center",
    gap: 4,
    paddingLeft: 4,
  },
  liveDotOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,255,136,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.35)",
  },
  liveDotInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#00FF88",
  },
  liveLabel: {
    color: "#00FF88",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  /* Feature card */
  cardGlowRing: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,
  },
  cardBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingRight: 14,
    paddingLeft: 0,
    gap: 13,
    overflow: "hidden",
    position: "relative",
  },
  cardColorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentBar: {
    width: 5,
    alignSelf: "stretch",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  iconOuter: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconInner: {
    width: 52,
    height: 52,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  vsText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.1,
    lineHeight: 23,
  },
  cardSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.8,
  },
  cardDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    lineHeight: 16,
    marginTop: 2,
  },
  cardRight: {
    alignItems: "center",
    gap: 8,
    minWidth: 36,
  },
  cardBadge: {
    fontSize: 15,
    lineHeight: 20,
  },
  chevronBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 2,
  },
  footerText: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 11,
    fontWeight: "500",
  },
});
