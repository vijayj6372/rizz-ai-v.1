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
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

interface FeatureCardProps {
  title: string;
  subtitle: string;
  badge: string;
  glowColor: string;
  iconBg: string;
  iconBg2: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function FeatureCard({ title, subtitle, badge, glowColor, iconBg, iconBg2, icon, onPress }: FeatureCardProps) {
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
      style={[styles.card, { borderColor: glowColor + "55" }, animatedStyle]}
    >
      <View style={[styles.cardIconBox, { backgroundColor: iconBg }]}>
        <View style={[styles.cardIconInner, { backgroundColor: iconBg2 }]}>
          {icon}
        </View>
      </View>

      <View style={styles.cardTextCol}>
        <Text style={[styles.cardTitle, { color: glowColor }]}>{title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.cardBadge}>{badge}</Text>
        <Ionicons name="chevron-forward" size={18} color={glowColor} />
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
      iconBg: "#3A1A00",
      iconBg2: "#FF6B35",
      icon: <Ionicons name="camera" size={30} color="#fff" />,
      onPress: () => navigation.navigate("RoastMySelfie"),
    },
    {
      title: "Rate My Crush",
      subtitle: "GET AN HONEST RATING · 1–10",
      badge: "💕💕💕",
      glowColor: "#E040A0",
      iconBg: "#2A0020",
      iconBg2: "#E040A0",
      icon: <Ionicons name="heart" size={30} color="#fff" />,
      onPress: () => navigation.navigate("RateMyCrush"),
    },
    {
      title: "Hot or Not",
      subtitle: "COMPARE 2 PICS · WHO WINS?",
      badge: "⭐⭐⭐",
      glowColor: "#C8A800",
      iconBg: "#221A00",
      iconBg2: "#C8A800",
      icon: <Text style={styles.vsText}>VS</Text>,
      onPress: () => navigation.navigate("HotOrNot"),
    },
    {
      title: "Lookmaxing Tips",
      subtitle: "GLOW-UP GUIDE · LEVEL UP FAST",
      badge: "✨✨",
      glowColor: "#00CFA8",
      iconBg: "#00201A",
      iconBg2: "#00CFA8",
      icon: <MaterialCommunityIcons name="mirror" size={30} color="#fff" />,
      onPress: () => navigation.navigate("LookmaxingTips"),
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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
          <Text style={styles.introRobot}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTop}>Your AI judge is ready.</Text>
            <Text style={styles.introSub}>
              Choose your roast mode <Text style={styles.introDevil}>😈</Text>
            </Text>
          </View>
        </View>

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
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: 16,
    gap: 14,
    paddingTop: 4,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1A0A2E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 16,
  },
  introRobot: { fontSize: 36 },
  introTop: { color: "#fff", fontWeight: "700", fontSize: 15 },
  introSub: { color: "#E040A0", fontWeight: "700", fontSize: 13, marginTop: 2 },
  introDevil: { fontSize: 14 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#150B28",
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    gap: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  cardIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconInner: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  vsText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    fontStyle: "italic",
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.9,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  cardBadge: {
    fontSize: 14,
  },
});
