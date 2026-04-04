import React, { useState, useMemo } from "react";
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

type Impact = "🔥 High" | "⚡ Medium" | "✨ Quick Win";
type Category = "HAIR" | "SKIN" | "FITNESS" | "DENTAL" | "STYLE" | "GROOMING" | "HEALTH" | "POSTURE" | "EYES" | "DIET" | "MINDSET" | "SOCIAL";

interface Tip {
  icon: string;
  category: Category;
  title: string;
  desc: string;
  impact: Impact;
  timeframe: string;
  color: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  HAIR: "#FF6B35",
  SKIN: "#00CFA8",
  FITNESS: "#FF1744",
  DENTAL: "#29B6F6",
  STYLE: "#9C27B0",
  GROOMING: "#E040A0",
  HEALTH: "#4CAF50",
  POSTURE: "#FF9800",
  EYES: "#00BCD4",
  DIET: "#8BC34A",
  MINDSET: "#7C4DFF",
  SOCIAL: "#F06292",
};

const TIPS: Tip[] = [
  { icon: "💈", category: "HAIR",     title: "Get a fresh haircut every 3-4 weeks",   desc: "A maintained cut signals you have your life together. Grow out your sides or try a modern fade.",   impact: "🔥 High",    timeframe: "1 day",   color: CATEGORY_COLORS.HAIR },
  { icon: "🧴", category: "HAIR",     title: "Use a hair serum or styling cream",       desc: "Frizz and dryness age you. A small amount of product transforms your texture and shine instantly.",  impact: "✨ Quick Win", timeframe: "5 mins",  color: CATEGORY_COLORS.HAIR },
  { icon: "💧", category: "SKIN",     title: "Start a 3-step skincare routine",         desc: "Cleanser → Moisturizer → SPF. Non-negotiable. SPF alone prevents aging better than any cream.",     impact: "🔥 High",    timeframe: "30 days", color: CATEGORY_COLORS.SKIN },
  { icon: "🫧", category: "SKIN",     title: "Double cleanse at night",                 desc: "Oil cleanser first to remove sunscreen and sebum, then foam cleanser. Waking up with clear skin is elite.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "✨", category: "SKIN",     title: "Add a Vitamin C serum in the morning",   desc: "Brightens dark spots, evens out skin tone, and protects against pollution. The cheat code for glowing skin.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🏋️", category: "FITNESS", title: "Hit the gym 3-4x per week",              desc: "Compound lifts only: squat, bench, deadlift, rows. Muscle transforms your face AND body. No excuses.", impact: "🔥 High",    timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏃", category: "FITNESS", title: "Add 20 mins of cardio daily",              desc: "Better blood flow = skin glow + reduced puffiness. Your face literally changes within 2 weeks of consistent cardio.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "😁", category: "DENTAL",  title: "Whiten your teeth",                        desc: "Whitening strips used consistently give you a celebrity smile for $20. The ROI on this is insane.",   impact: "✨ Quick Win", timeframe: "1 week",  color: CATEGORY_COLORS.DENTAL },
  { icon: "🦷", category: "DENTAL",  title: "Floss and use mouthwash daily",            desc: "Fresh breath is invisible but immediately sensed. It changes how close people stand to you.",          impact: "✨ Quick Win", timeframe: "1 day",   color: CATEGORY_COLORS.DENTAL },
  { icon: "👔", category: "STYLE",   title: "Wear clothes that actually fit",           desc: "Oversized is a trend. Poorly fitted is different. Tailor one outfit and see how differently people treat you.", impact: "⚡ Medium", timeframe: "1 day",  color: CATEGORY_COLORS.STYLE },
  { icon: "👟", category: "STYLE",   title: "Clean your shoes before every outing",     desc: "People look at shoes more than you think. Dirty shoes read as 'doesn't care about details.' Clean them.", impact: "✨ Quick Win", timeframe: "3 mins", color: CATEGORY_COLORS.STYLE },
  { icon: "🎨", category: "STYLE",   title: "Pick a consistent style identity",         desc: "Streetwear, smart casual, or minimal – commit to one. Random outfits scream no identity. Pick yours.",  impact: "🔥 High",    timeframe: "1 week",  color: CATEGORY_COLORS.STYLE },
  { icon: "🌹", category: "GROOMING", title: "Find a signature cologne",               desc: "Scent is processed in the same brain region as memory and emotion. A good cologne makes you unforgettable.", impact: "✨ Quick Win", timeframe: "1 day", color: CATEGORY_COLORS.GROOMING },
  { icon: "🪒", category: "GROOMING", title: "Maintain your beard or shave clean",     desc: "Patchy stubble is the enemy. Either grow it fully, maintain it precisely, or shave clean. No in-between.", impact: "✨ Quick Win", timeframe: "10 mins", color: CATEGORY_COLORS.GROOMING },
  { icon: "🤨", category: "GROOMING", title: "Groom your eyebrows",                    desc: "Unibrows and wild brows drop your score by 1.5 points minimum. Get them threaded or waxed monthly.", impact: "✨ Quick Win", timeframe: "30 mins", color: CATEGORY_COLORS.GROOMING },
  { icon: "😴", category: "HEALTH",  title: "Sleep 7-9 hours every night",             desc: "Sleep deprivation shows instantly in your skin, eyes, and energy. 8 hours is a better investment than any supplement.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.HEALTH },
  { icon: "💊", category: "HEALTH",  title: "Take Vitamin D + Omega-3 daily",          desc: "Most people are deficient. Vitamin D improves mood and skin. Omega-3 reduces inflammation and gives you that glow.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🧘", category: "HEALTH",  title: "Reduce cortisol (stress management)",     desc: "High stress = hair loss, acne, and weight gain. Meditation, cold showers, or even just a walk outside daily.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🧍", category: "POSTURE", title: "Fix your posture immediately",            desc: "Shoulders back, chest up, chin parallel to floor. Do this now. Instant height, dominance, and attractiveness boost.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.POSTURE },
  { icon: "💻", category: "POSTURE", title: "Fix your tech neck",                      desc: "Phone neck creates a double chin and forward head posture. Raise your screen to eye level. Do neck stretches daily.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "👁️", category: "EYES",   title: "Cold compress to reduce eye bags",        desc: "Refrigerated spoons or jade rollers under-eye for 5 mins every morning. Eliminates puffiness instantly.",  impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.EYES },
  { icon: "😤", category: "EYES",   title: "Practice intense, relaxed eye contact",   desc: "Darting eyes signal insecurity. Steady, soft eye contact signals dominance. Practice holding it 3-5 seconds.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.EYES },
  { icon: "🥗", category: "DIET",   title: "Cut sugar and processed food",            desc: "Sugar glycates collagen and causes systemic inflammation – both visible in your skin. Cut it for 2 weeks and be amazed.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🥩", category: "DIET",   title: "Eat more protein (1g per lb bodyweight)", desc: "Muscle requires protein. So does hair, nails, and skin elasticity. Most people eat half what they need.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.DIET },
  { icon: "💧", category: "DIET",   title: "Drink 3 liters of water daily",           desc: "Dehydration causes dull skin, dark circles, and poor metabolism. Water is the cheapest glow-up there is.", impact: "✨ Quick Win", timeframe: "3 days", color: CATEGORY_COLORS.DIET },
  { icon: "🧠", category: "MINDSET", title: "Develop a genuine passion or skill",     desc: "People are attracted to people who are interested in life. Read, create, build, explore. Purpose is attractive.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "💬", category: "SOCIAL",  title: "Improve your conversational skills",     desc: "Ask great questions. Listen actively. Forget about yourself. People leave conversations feeling seen = they like you.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.SOCIAL },
  { icon: "😄", category: "SOCIAL",  title: "Smile more (with your eyes)",            desc: "A genuine smile engages your orbicularis oculi (eye crinkle muscles). Fake smiles don't. Practice it.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },
];

const IMPACT_FILTERS: Impact[] = ["🔥 High", "⚡ Medium", "✨ Quick Win"];
const ALL_CATEGORIES = ["All", ...Array.from(new Set(TIPS.map((t) => t.category)))];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const FEATURED_TIP = randomItem(TIPS);

export default function LookmaxingTipsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [impactFilter, setImpactFilter] = useState<Impact | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return TIPS.filter((t) => {
      const impactOk = impactFilter === "All" || t.impact === impactFilter;
      const catOk = categoryFilter === "All" || t.category === categoryFilter;
      return impactOk && catOk;
    });
  }, [impactFilter, categoryFilter]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Lookmaxing Tips ✨</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Stats Row */}
      <View style={styles.statsRow}>
        <StatBox value={`${TIPS.length}`} label="Total Tips" color="#00CFA8" />
        <StatBox value={`${TIPS.filter(t => t.impact === "🔥 High").length}`} label="High Impact" color="#FF6B35" />
        <StatBox value={`${ALL_CATEGORIES.length - 1}`} label="Categories" color="#9C27B0" />
      </View>

      {/* Featured Tip of the Day */}
      <View style={[styles.featuredCard, { borderColor: FEATURED_TIP.color + "55" }]}>
        <View style={styles.featuredHeader}>
          <View style={[styles.featuredBadge, { backgroundColor: FEATURED_TIP.color }]}>
            <Text style={styles.featuredBadgeText}>⚡ TIP OF THE DAY</Text>
          </View>
          <Text style={styles.featuredTimeframe}>{FEATURED_TIP.timeframe}</Text>
        </View>
        <View style={styles.featuredBody}>
          <Text style={styles.featuredEmoji}>{FEATURED_TIP.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredTitle}>{FEATURED_TIP.title}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{FEATURED_TIP.desc}</Text>
          </View>
        </View>
      </View>

      {/* Impact Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScrollWrap}
        contentContainerStyle={styles.filterRow}
      >
        {(["All", ...IMPACT_FILTERS] as const).map((f) => {
          const active = impactFilter === f;
          const color = f === "🔥 High" ? "#FF6B35" : f === "⚡ Medium" ? "#9C27B0" : f === "✨ Quick Win" ? "#E040A0" : "#00CFA8";
          return (
            <Pressable
              key={f}
              style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => { triggerHaptic(); setImpactFilter(f as Impact | "All"); }}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Category Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScrollWrap}
        contentContainerStyle={styles.filterRow}
      >
        {ALL_CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          const color = cat === "All" ? "#00CFA8" : CATEGORY_COLORS[cat as Category];
          return (
            <Pressable
              key={cat}
              style={[styles.catChip, active && { backgroundColor: color + "33", borderColor: color }]}
              onPress={() => { triggerHaptic(); setCategoryFilter(cat); }}
            >
              <Text style={[styles.catChipText, active && { color: color }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.resultCount}>{filtered.length} tip{filtered.length !== 1 ? "s" : ""} found</Text>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((tip, i) => {
          const isExpanded = expanded === i;
          return (
            <Pressable
              key={`${tip.title}-${i}`}
              style={[styles.tipCard, { borderLeftColor: tip.color }]}
              onPress={() => { triggerHaptic(); setExpanded(isExpanded ? null : i); }}
            >
              <View style={styles.tipTop}>
                <View style={[styles.tipIconBox, { backgroundColor: tip.color + "20" }]}>
                  <Text style={styles.tipEmoji}>{tip.icon}</Text>
                </View>
                <View style={styles.tipMeta}>
                  <View style={styles.tipMetaTop}>
                    <Text style={[styles.tipCategory, { color: tip.color }]}>{tip.category}</Text>
                    <View style={[styles.impactTag, { backgroundColor: tip.color + "22" }]}>
                      <Text style={[styles.impactText, { color: tip.color }]}>{tip.impact}</Text>
                    </View>
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  {!isExpanded && (
                    <Text style={styles.tipDescPreview} numberOfLines={1}>{tip.desc}</Text>
                  )}
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="rgba(255,255,255,0.3)"
                />
              </View>

              {isExpanded && (
                <View style={styles.tipExpanded}>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                  <View style={[styles.timeframeBadge, { backgroundColor: tip.color + "22" }]}>
                    <Ionicons name="time-outline" size={12} color={tip.color} />
                    <Text style={[styles.timeframeText, { color: tip.color }]}>Results in: {tip.timeframe}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="mirror" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No tips match your filters</Text>
            <Pressable onPress={() => { setImpactFilter("All"); setCategoryFilter("All"); }}>
              <Text style={styles.emptyReset}>Reset filters</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[statStyles.box, { borderColor: color + "33" }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  box: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1,
    padding: 10, alignItems: "center", gap: 2,
  },
  value: { fontSize: 22, fontWeight: "900" },
  label: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "700", letterSpacing: 0.5 },
});

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
  headerTitle: { fontSize: 19, fontWeight: "800", color: "#fff" },

  statsRow: { flexDirection: "row", gap: 8, marginHorizontal: 20, marginBottom: 12 },

  featuredCard: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 14, gap: 10,
    borderWidth: 1,
  },
  featuredHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  featuredBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  featuredBadgeText: { color: "#000", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  featuredTimeframe: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "600" },
  featuredBody: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featuredEmoji: { fontSize: 28, marginTop: 2 },
  featuredTitle: { color: "#fff", fontWeight: "800", fontSize: 14, marginBottom: 4 },
  featuredDesc: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18 },

  filterScrollWrap: { marginBottom: 6 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 2 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
  },
  filterChipText: { color: "rgba(255,255,255,0.45)", fontWeight: "700", fontSize: 12 },
  filterChipTextActive: { color: "#fff" },

  catChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  catChipText: { color: "rgba(255,255,255,0.35)", fontWeight: "700", fontSize: 11 },

  resultCount: { marginHorizontal: 20, color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: "600", marginBottom: 4 },

  list: { paddingHorizontal: 20, gap: 10 },
  tipCard: {
    backgroundColor: "#1A0D30", borderRadius: 16, padding: 14, gap: 10,
    borderLeftWidth: 3,
    elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  tipTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  tipEmoji: { fontSize: 22 },
  tipMeta: { flex: 1, gap: 3 },
  tipMetaTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipCategory: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  impactTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  impactText: { fontSize: 10, fontWeight: "700" },
  tipTitle: { fontSize: 14, fontWeight: "800", color: "#fff" },
  tipDescPreview: { fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 18 },
  tipExpanded: { gap: 10, paddingTop: 4, paddingLeft: 56 },
  tipDesc: { color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 21 },
  timeframeBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: "flex-start",
  },
  timeframeText: { fontSize: 11, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: "600" },
  emptyReset: { color: "#00CFA8", fontSize: 14, fontWeight: "700" },
});
