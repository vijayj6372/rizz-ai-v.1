import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "LookmaxingTips"> };

interface Tip {
  icon: string;
  category: string;
  title: string;
  desc: string;
  impact: "🔥 High" | "⚡ Medium" | "✨ Quick Win";
  color: string;
}

const TIPS: Tip[] = [
  {
    icon: "💈",
    category: "HAIR",
    title: "Get a fresh haircut",
    desc: "A well-maintained haircut instantly elevates your look. Find a style that suits your face shape.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
  {
    icon: "💧",
    category: "SKIN",
    title: "Start a skincare routine",
    desc: "Cleanser → Moisturizer → SPF. Three steps, done daily, transforms your skin in 30 days.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
  {
    icon: "🏋️",
    category: "FITNESS",
    title: "Hit the gym 3x per week",
    desc: "Even basic compound lifts (squat, bench, deadlift) reshape your body and boost confidence.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
  {
    icon: "😁",
    category: "DENTAL",
    title: "Fix your smile",
    desc: "Whitening strips, regular brushing and flossing. A bright smile is the #1 attractiveness multiplier.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
  {
    icon: "👔",
    category: "STYLE",
    title: "Wear clothes that fit",
    desc: "Clothes that fit your body = instant +2 points. Avoid baggy or oversized unless it's intentional.",
    impact: "⚡ Medium",
    color: "#9C27B0",
  },
  {
    icon: "🧴",
    category: "GROOMING",
    title: "Use a good cologne",
    desc: "A signature scent leaves a lasting impression. Spray on pulse points – neck and wrists.",
    impact: "✨ Quick Win",
    color: "#E040A0",
  },
  {
    icon: "😴",
    category: "HEALTH",
    title: "Sleep 8 hours",
    desc: "Sleep reduces under-eye bags, improves skin clarity, and boosts testosterone. Non-negotiable.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
  {
    icon: "🧴",
    category: "SKIN",
    title: "Stay hydrated",
    desc: "Drink 2-3L of water daily. Hydrated skin = natural glow. No moisturizer beats water intake.",
    impact: "✨ Quick Win",
    color: "#E040A0",
  },
  {
    icon: "🧍",
    category: "POSTURE",
    title: "Fix your posture",
    desc: "Stand tall, shoulders back, chin up. Good posture makes you look taller and more dominant instantly.",
    impact: "✨ Quick Win",
    color: "#E040A0",
  },
  {
    icon: "👀",
    category: "EYES",
    title: "Reduce eye bags",
    desc: "Cold spoon in the morning, eye cream at night. Less screen time before bed also dramatically helps.",
    impact: "⚡ Medium",
    color: "#9C27B0",
  },
  {
    icon: "🥗",
    category: "DIET",
    title: "Cut sugar & processed food",
    desc: "Sugar causes inflammation and acne. Replace with whole foods and watch your skin clear up in weeks.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
  {
    icon: "💪",
    category: "FITNESS",
    title: "Lose body fat",
    desc: "Every 5% body fat reduction reveals more jaw definition and facial features. Diet is 80% of fat loss.",
    impact: "🔥 High",
    color: "#00CFA8",
  },
];

const FILTERS = ["All", "🔥 High", "⚡ Medium", "✨ Quick Win"];

function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function LookmaxingTipsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? TIPS
    : TIPS.filter((t) => t.impact === activeFilter);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Lookmaxing Tips ✨</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.heroBox}>
        <MaterialCommunityIcons name="mirror" size={40} color="#00CFA8" />
        <View>
          <Text style={styles.heroTitle}>Glow-Up Guide</Text>
          <Text style={styles.heroSub}>LEVEL UP FAST · {TIPS.length} TIPS</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => { triggerHaptic(); setActiveFilter(f); }}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((tip, i) => (
          <View key={i} style={[styles.tipCard, { borderLeftColor: tip.color }]}>
            <View style={styles.tipTop}>
              <Text style={styles.tipEmoji}>{tip.icon}</Text>
              <View style={styles.tipMeta}>
                <Text style={styles.tipCategory}>{tip.category}</Text>
                <View style={[styles.impactTag, { backgroundColor: tip.color + "22" }]}>
                  <Text style={[styles.impactText, { color: tip.color }]}>{tip.impact}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#100820" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroBox: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "rgba(0,207,168,0.08)", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(0,207,168,0.2)",
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 1 },
  filterScroll: { marginBottom: 12 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  filterChipActive: { backgroundColor: "#00CFA8", borderColor: "#00CFA8" },
  filterChipText: { color: "rgba(255,255,255,0.5)", fontWeight: "700", fontSize: 13 },
  filterChipTextActive: { color: "#000" },
  list: { paddingHorizontal: 20, gap: 12 },
  tipCard: {
    backgroundColor: "#1E0F38", borderRadius: 16, padding: 16, gap: 8,
    borderLeftWidth: 4,
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  tipTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipEmoji: { fontSize: 28 },
  tipMeta: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tipCategory: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  impactTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  impactText: { fontSize: 11, fontWeight: "700" },
  tipTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },
  tipDesc: { fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 22 },
});
