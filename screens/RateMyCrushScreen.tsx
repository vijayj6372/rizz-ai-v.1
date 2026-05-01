import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "RateMyCrush"> };

const VERDICTS = [
  { min: 9.2, label: "God-Tier Crush 🔱",       sub: "You are absolutely punching up.",      color: "#FF1744", shouldShoot: "SHOOT YOUR SHOT" },
  { min: 8.0, label: "Out of Your League 😍",   sub: "Still possible. Rizz hard.",            color: "#FF69B4", shouldShoot: "GO FOR IT" },
  { min: 6.5, label: "Major Catch! 💕",          sub: "Great choice. Don't hesitate.",         color: "#E040A0", shouldShoot: "DEFINITELY SHOOT" },
  { min: 5.0, label: "Solid 5 Energy ✨",        sub: "Decent but you could aim higher.",      color: "#9C27B0", shouldShoot: "WHY NOT" },
  { min: 3.5, label: "Room to Grow 🌱",          sub: "They have a great personality... maybe.", color: "#FF9800", shouldShoot: "UP TO YOU" },
  { min: 0,   label: "Tough Love 💀",            sub: "The AI says keep looking. Sorry bro.",  color: "#FF5722", shouldShoot: "MAYBE NOT" },
];

const COMMENTS = [
  "Your crush is giving main character energy. Slide into those DMs ASAP!",
  "They've got a vibe that screams 'hard to get but 100% worth it.'",
  "Honestly? Your crush has certified heartthrob status. Your feelings are valid.",
  "Warning: High risk of falling even deeper. Proceed with extreme caution. 💕",
  "They look like trouble in the best possible way. Buckle up. 🔥",
  "Your taste in crushes? Certified excellent. The AI approves.",
  "Okay but their smile alone adds +2 to the final score. No cap.",
  "The AI detected 'main character energy' in this person. Dangerous. 💀",
  "Vibe check: PASSED. Your crush has the energy of a rom-com lead.",
  "This person radiates 'I'll make you feel things you've never felt' energy.",
  "Your crush scores high on the rizz-magnet scale. Approach carefully.",
  "The AI's neural networks literally glitched over your crush. Make of that what you will.",
  "Your crush gives 'knows exactly what they're doing' energy. Terrifying. Attractive.",
  "The AI has rated 10,000 faces and your crush is in the top 15%. No joke.",
  "Red flag radar: none detected. Green flag radar: overflowing. Go for it.",
  "Your crush has the facial symmetry of someone who never worries about things.",
  "According to the algorithm, people like your crush are usually taken. Check!",
  "Your taste in humans is genuinely elite. The AI is impressed. That's rare.",
  "Not a single bad angle detected. This crush is operating on another level.",
  "The AI says: 'Whoever this is, they win.' And that's final.",
];

const LOADING_MSGS = [
  "Scanning for rizz potential...",
  "Running symmetry analysis...",
  "Calculating dating power...",
  "Checking vibe frequency...",
  "Generating honest verdict...",
];

const METRICS = ["Attractiveness", "Rizz Potential", "Partner Energy", "Face Symmetry", "Vibe Score"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomScore(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export default function RateMyCrushScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    verdict: typeof VERDICTS[0];
    comment: string;
    metrics: { label: string; score: number }[];
    datingPotential: number;
    ratedCount: number;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<"comment" | "verdict" | null>(null);

  const copyText = async (text: string, key: "comment" | "verdict") => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    await playButtonSound();
    setLoading(true);
    setResult(null);
    for (let i = 0; i < LOADING_MSGS.length; i++) {
      setLoadingMsg(i);
      await new Promise((r) => setTimeout(r, 400));
    }
    triggerHaptic();
    const score = randomScore(4.5, 9.8);
    const verdict = VERDICTS.find((v) => score >= v.min)!;
    const metrics = METRICS.map((label) => ({
      label,
      score: randomScore(Math.max(3, score - 1.5), Math.min(10, score + 1.5)),
    }));
    setResult({
      score,
      verdict,
      comment: randomItem(COMMENTS),
      metrics,
      datingPotential: randomInt(60, 99),
      ratedCount: randomInt(200, 5000),
    });
    setLoading(false);
  };

  const reset = () => { setImageUri(null); setResult(null); };
  const filledStars = result ? Math.round(result.score / 2) : 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Rate My Crush 💕</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <>
            <Text style={styles.subtitle}>HONEST RATING · 1–10 · NO SUGARCOATING</Text>

            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.crushImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="heart" size={52} color="rgba(224,64,160,0.6)" />
                  <Text style={styles.placeholderTitle}>Upload Their Photo</Text>
                  <Text style={styles.placeholderSub}>We'll give you the honest truth</Text>
                </View>
              )}
            </Pressable>

            {imageUri && (
              <Pressable style={styles.changeBtn} onPress={pickImage}>
                <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.changeBtnText}>Change Photo</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.analyzeBtn, !imageUri && styles.analyzeBtnDisabled]}
              onPress={analyzeImage}
              disabled={!imageUri || loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.analyzeBtnText}>{LOADING_MSGS[loadingMsg]}</Text>
                </View>
              ) : (
                <Text style={styles.analyzeBtnText}>💕 Rate Them Now!</Text>
              )}
            </Pressable>

            {!imageUri && (
              <View style={styles.infoRow}>
                <InfoPill icon="🔒" text="100% Private" />
                <InfoPill icon="📴" text="Works Offline" />
                <InfoPill icon="⚡" text="Instant Results" />
              </View>
            )}
          </>
        ) : (
          <>
            {/* Score Banner */}
            <View style={[styles.scoreBanner, { borderColor: result.verdict.color + "44" }]}>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.thumbImage} />
              )}
              <View style={styles.scoreBannerText}>
                <Text style={styles.scoreBannerLabel}>Overall Rating</Text>
                <Text style={[styles.bigScore, { color: result.verdict.color }]}>
                  {result.score.toFixed(1)}<Text style={styles.bigScoreDenom}>/10</Text>
                </Text>
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < filledStars ? "star" : "star-outline"}
                      size={20}
                      color={i < filledStars ? result.verdict.color : "rgba(255,255,255,0.2)"}
                    />
                  ))}
                </View>
              </View>
              <View style={[styles.verdictBadge, { backgroundColor: result.verdict.color }]}>
                <Text style={styles.verdictBadgeText}>{result.verdict.label}</Text>
              </View>
            </View>

            {/* Dating Potential */}
            <View style={styles.potentialRow}>
              <Text style={styles.potentialLabel}>Dating Potential</Text>
              <View style={styles.potentialBarBg}>
                <View style={[styles.potentialBarFill, {
                  width: `${result.datingPotential}%` as any,
                  backgroundColor: result.verdict.color,
                }]} />
              </View>
              <Text style={[styles.potentialPct, { color: result.verdict.color }]}>
                {result.datingPotential}%
              </Text>
            </View>

            {/* Should You Shoot? */}
            <View style={[styles.shootCard, { backgroundColor: result.verdict.color + "22", borderColor: result.verdict.color + "55" }]}>
              <Text style={styles.shootLabel}>AI RECOMMENDATION</Text>
              <Text style={[styles.shootText, { color: result.verdict.color }]}>
                {result.verdict.shouldShoot}
              </Text>
              <Text style={styles.shootSub}>{result.verdict.sub}</Text>
            </View>

            {/* Metric Breakdown */}
            <View style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Detailed Breakdown</Text>
              {result.metrics.map((m) => (
                <View key={m.label} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <View style={styles.metricBarBg}>
                    <View style={[styles.metricBarFill, {
                      width: `${(m.score / 10) * 100}%` as any,
                      backgroundColor: result.verdict.color,
                    }]} />
                  </View>
                  <Text style={[styles.metricScore, { color: result.verdict.color }]}>{m.score.toFixed(1)}</Text>
                </View>
              ))}
            </View>

            {/* AI Comment — tap / long-press to copy */}
            <Pressable
              style={[
                styles.commentBubble,
                { borderLeftColor: result.verdict.color },
                copiedKey === "comment" && { backgroundColor: "rgba(255,255,255,0.09)" },
              ]}
              onPress={() => copyText(result.comment, "comment")}
              onLongPress={() => copyText(result.comment, "comment")}
              delayLongPress={400}
            >
              <View style={styles.commentBubbleTop}>
                <Text style={styles.commentLabel}>💬 AI Analysis</Text>
                <View style={[styles.copyHint, copiedKey === "comment" && { backgroundColor: result.verdict.color + "CC" }]}>
                  <Ionicons
                    name={copiedKey === "comment" ? "checkmark-circle" : "copy-outline"}
                    size={12}
                    color={copiedKey === "comment" ? "#fff" : "rgba(255,255,255,0.35)"}
                  />
                  <Text style={[styles.copyHintText, copiedKey === "comment" && { color: "#fff" }]}>
                    {copiedKey === "comment" ? "Copied!" : "Tap to copy"}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentText}>{result.comment}</Text>
            </Pressable>

            {/* Verdict — tap / long-press to copy */}
            <Pressable
              style={[
                styles.verdictCopyRow,
                copiedKey === "verdict" && { borderColor: result.verdict.color + "55", backgroundColor: result.verdict.color + "11" },
              ]}
              onPress={() => copyText(`${result.verdict.label} — ${result.score.toFixed(1)}/10 — ${result.verdict.sub}`, "verdict")}
              onLongPress={() => copyText(`${result.verdict.label} — ${result.score.toFixed(1)}/10 — ${result.verdict.sub}`, "verdict")}
              delayLongPress={400}
            >
              <Ionicons name={copiedKey === "verdict" ? "checkmark-circle" : "share-outline"} size={14} color={result.verdict.color} />
              <Text style={[styles.verdictCopyText, { color: result.verdict.color }]}>
                {copiedKey === "verdict" ? "Verdict copied to clipboard!" : "Tap to copy full verdict"}
              </Text>
            </Pressable>

            <Text style={styles.ratedCount}>📊 {result.ratedCount.toLocaleString()} people rated crushes today</Text>

            <View style={styles.resultActions}>
              <Pressable style={styles.secondaryBtn} onPress={reset}>
                <Text style={styles.secondaryBtnText}>Try Another</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, { backgroundColor: result.verdict.color }]} onPress={analyzeImage}>
                <Text style={styles.primaryBtnText}>Re-Rate</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={infoPillStyles.pill}>
      <Text style={infoPillStyles.icon}>{icon}</Text>
      <Text style={infoPillStyles.text}>{text}</Text>
    </View>
  );
}
const infoPillStyles = StyleSheet.create({
  pill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  icon: { fontSize: 12 },
  text: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "600" },
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
  content: { paddingHorizontal: 20, alignItems: "center", gap: 14 },
  subtitle: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.35)", letterSpacing: 1 },

  imagePicker: {
    width: "100%", aspectRatio: 3 / 4, borderRadius: 24, overflow: "hidden",
    borderWidth: 2, borderColor: "rgba(224,64,160,0.4)", borderStyle: "dashed",
  },
  crushImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1, backgroundColor: "rgba(224,64,160,0.06)",
    justifyContent: "center", alignItems: "center", gap: 10,
  },
  placeholderTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  placeholderSub: { color: "rgba(255,255,255,0.35)", fontSize: 13 },

  changeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  changeBtnText: { color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: 13 },

  analyzeBtn: {
    width: "100%", paddingVertical: 18, borderRadius: 20,
    backgroundColor: "#E040A0", alignItems: "center",
  },
  analyzeBtnDisabled: { opacity: 0.35 },
  analyzeBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  infoRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },

  scoreBanner: {
    width: "100%", flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 14, borderWidth: 1,
    flexWrap: "wrap",
  },
  thumbImage: { width: 72, height: 96, borderRadius: 12 },
  scoreBannerText: { flex: 1, gap: 4 },
  scoreBannerLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  bigScore: { fontSize: 44, fontWeight: "900", lineHeight: 50 },
  bigScoreDenom: { fontSize: 20, color: "rgba(255,255,255,0.35)", fontWeight: "600" },
  starsRow: { flexDirection: "row", gap: 2 },
  verdictBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start" },
  verdictBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  potentialRow: {
    width: "100%", flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14,
  },
  potentialLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", width: 110 },
  potentialBarBg: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" },
  potentialBarFill: { height: "100%", borderRadius: 4 },
  potentialPct: { fontWeight: "900", fontSize: 14, width: 38, textAlign: "right" },

  shootCard: {
    width: "100%", borderRadius: 18, padding: 16, alignItems: "center", gap: 6, borderWidth: 1,
  },
  shootLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  shootText: { fontSize: 26, fontWeight: "900" },
  shootSub: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" },

  metricsCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, gap: 10,
  },
  metricsTitle: { color: "#fff", fontWeight: "800", fontSize: 15, marginBottom: 2 },
  metricRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metricLabel: { width: 120, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600" },
  metricBarBg: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  metricBarFill: { height: "100%", borderRadius: 3 },
  metricScore: { width: 30, fontSize: 12, fontWeight: "800", textAlign: "right" },

  commentBubble: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, gap: 8, borderLeftWidth: 3,
  },
  commentBubbleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  commentLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700" },
  commentText: { color: "#fff", fontSize: 14, lineHeight: 22 },

  verdictCopyRow: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  verdictCopyText: { fontSize: 13, fontWeight: "700" },

  copyHint: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  copyHintText: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "600" },

  ratedCount: { color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center" },

  resultActions: { flexDirection: "row", gap: 10, width: "100%" },
  primaryBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondaryBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
