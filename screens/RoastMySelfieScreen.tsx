import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "RoastMySelfie"> };

type Mode = "savage" | "mild" | "brutal";

const ROASTS: Record<Mode, string[]> = {
  savage: [
    "Bro, you look like you just woke up in a dumpster. Ever heard of a comb? 😂",
    "Your face called – it wants its personality back. Try smiling next time! 💀",
    "Is that a resting judged face or are you always this unimpressed with yourself? 🔥",
    "You've got a face made for radio... and a voice probably made for texting. 😅",
    "I've seen better-looking faces on a passport photo taken on a Monday morning. 💀",
    "Your vibe said 'I gave up' but your eyes say 'I gave up weeks ago.' 😂",
    "Bro your hairline is playing hide and seek – and losing. 🔥",
    "You look like the 'before' picture in every glow-up tutorial. 💀",
    "Did you get dressed in the dark or is this just your vibe? Either way, no. 😭",
    "Your face has a great personality... I'm sure. 😬",
    "The AI tried to compliment you but couldn't find a starting point. 💀",
    "You're not ugly, you're just... aggressively average. That's somehow worse. 😂",
    "Bro looks like he tells people he's 'working on himself' but means Netflix. 😭",
    "Even your shadow is trying to distance itself. 💀",
    "If confidence was a face, you'd have the opposite of that. 🔥",
  ],
  mild: [
    "You're not bad looking, just... choose a better photo angle next time. 😅",
    "Solid 6/10 with potential. You've got the bones for a glow-up! 💪",
    "You're cute but clearly haven't discovered what works for you yet. Keep going!",
    "Not the worst face I've seen today. That's... a compliment, kind of. 😂",
    "You've got raw material to work with. The glow-up is within reach! ✨",
    "Bro is giving 'almost there' energy. You need 20% more effort on the fit.",
    "You have good features hidden under that 'I don't care' aesthetic. Care a little! 😄",
    "The jawline has promise. The style does not. Let's work on one thing at a time. 😅",
    "You're giving 'secretly attractive but doesn't know it yet.' That's fixable! 🔥",
    "Honest opinion? You're like a 6.5 but you dress like a 4. Upgrade the fit.",
  ],
  brutal: [
    "I asked the AI to rate you and it crashed. Make of that what you will. 💀",
    "Your face triggered my phone's low-battery warning. Coincidence? I think not. 😂",
    "Bro looks like he lost the genetics lottery AND the fashion lottery. In the same week. 💀",
    "My grandmother has better bone structure and she's been gone 10 years. 😭",
    "The AI rated your symmetry a 2.1. It wanted to go lower but that's the minimum. 🔥",
    "You're proof that confidence and attractiveness are completely unrelated. 😂",
    "Your jawline has gone into witness protection. Nobody has seen it in years. 💀",
    "Even your pores are ugly bro. I've never seen ugly pores before today. 😭",
    "Your attractiveness score broke the algorithm. In the wrong direction. 🔥",
    "The Roast AI had to take a break after seeing your photo. It needed therapy. 💀",
  ],
};

const GLOW_UP_TIPS = [
  "Try a new hairstyle. Maybe one from this decade!",
  "Skincare is not just for girls – moisturize, king!",
  "Hit the gym. Even 3 days a week transforms you in 3 months.",
  "Sleep 8 hours. Beauty sleep is real, don't skip it.",
  "Fix your posture – stand tall and instantly look more attractive.",
  "Drink water. Hydration literally makes your skin glow.",
  "Upgrade your fit. Clothes that fit = automatic glow-up.",
  "Smile more. Confidence is the most attractive thing you can wear.",
  "Get a beard trim or clean shave – unkempt facial hair drops you 2 points.",
  "Whiten your teeth. A bright smile is the cheapest glow-up there is.",
  "Eyebrow grooming. Seriously. 5 minutes changes everything.",
  "Use SPF every morning. Future you will be way better looking.",
  "Iron your clothes. Wrinkled outfits scream 'I gave up.'",
  "Clean your shoes. People notice, even if they don't say it.",
  "Get a cologne you actually like. Scent is 30% of attraction.",
  "Eat less junk food. Your skin tells on you immediately.",
  "Start reading books. Intelligence is visible. Dumb is visible too.",
  "Learn to make eye contact. Avoiding it reads as low confidence.",
  "Find a signature style and stick to it. Consistency = identity.",
  "Cut out alcohol. It bloats your face within 48 hours.",
];

const LOADING_STAGES = [
  "Scanning facial structure...",
  "Analyzing symmetry...",
  "Calculating attractiveness score...",
  "Generating savage roast...",
  "Preparing your verdict...",
];

const FEATURE_LABELS = ["Jawline", "Eyes", "Skin", "Hair", "Style", "Vibe"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomScore(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(1);
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

const MODE_CONFIG: Record<Mode, { label: string; emoji: string; color: string; scoreRange: [number, number] }> = {
  mild:   { label: "Mild",   emoji: "😊", color: "#4CAF50", scoreRange: [5, 8.5] },
  savage: { label: "Savage", emoji: "🔥", color: "#FF6B35", scoreRange: [3, 7]   },
  brutal: { label: "Brutal", emoji: "💀", color: "#9C27B0", scoreRange: [1, 5]   },
};

export default function RoastMySelfieScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [mode, setMode] = useState<Mode>("savage");
  const [result, setResult] = useState<{
    score: string;
    roast: string;
    tip: string;
    features: { label: string; score: number }[];
    shareCount: number;
  } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
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
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      setLoadingStage(i);
      await new Promise((r) => setTimeout(r, 420));
    }
    triggerHaptic();
    const cfg = MODE_CONFIG[mode];
    const features = FEATURE_LABELS.map((label) => ({
      label,
      score: randomInt(
        Math.ceil(cfg.scoreRange[0] * 10),
        Math.floor(cfg.scoreRange[1] * 10)
      ) / 10,
    }));
    setResult({
      score: randomScore(cfg.scoreRange[0], cfg.scoreRange[1]),
      roast: randomItem(ROASTS[mode]),
      tip: randomItem(GLOW_UP_TIPS),
      features,
      shareCount: randomInt(12, 9847),
    });
    setLoading(false);
  };

  const cfg = MODE_CONFIG[mode];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Roast My Selfie {cfg.emoji}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selector */}
        <View style={styles.modeRow}>
          {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => {
            const c = MODE_CONFIG[m];
            const active = mode === m;
            return (
              <Pressable
                key={m}
                style={[styles.modeChip, active && { backgroundColor: c.color, borderColor: c.color }]}
                onPress={() => { setMode(m); setResult(null); }}
              >
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                  {c.emoji} {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!result ? (
          <>
            <Animated.View style={[styles.imagePickerWrap, { transform: [{ scale: pulseAnim }] }]}>
              <Pressable
                style={[styles.imagePicker, { borderColor: cfg.color + "66" }]}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.selfieImage} />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: cfg.color + "14" }]}>
                    <Ionicons name="camera" size={56} color={cfg.color} />
                    <Text style={styles.placeholderTitle}>Upload Your Selfie</Text>
                    <Text style={styles.placeholderSub}>Tap anywhere to pick a photo</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            {imageUri && (
              <Pressable style={styles.changeBtn} onPress={pickImage}>
                <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.changeBtnText}>Change Photo</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.analyzeBtn, { backgroundColor: cfg.color }, !imageUri && styles.analyzeBtnDisabled]}
              onPress={analyzeImage}
              disabled={!imageUri || loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.analyzeBtnText}>{LOADING_STAGES[loadingStage]}</Text>
                </View>
              ) : (
                <Text style={styles.analyzeBtnText}>{cfg.emoji} Roast Me!</Text>
              )}
            </Pressable>

            {!imageUri && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  {mode === "brutal" ? "💀 No mercy mode. You asked for it." :
                   mode === "savage" ? "🔥 We will not hold back." :
                   "😊 We'll be kind... kind of."}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Result Header */}
            <View style={[styles.resultHeader, { borderColor: cfg.color + "44" }]}>
              <View style={[styles.modeBadge, { backgroundColor: cfg.color }]}>
                <Text style={styles.modeBadgeText}>{cfg.emoji} {cfg.label} Mode</Text>
              </View>
              <Text style={styles.shareCountText}>🔥 {result.shareCount.toLocaleString()} roasted today</Text>
            </View>

            {/* Image + Score Overlay */}
            {imageUri && (
              <View style={styles.resultImageWrap}>
                <Image source={{ uri: imageUri }} style={styles.resultImage} />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.resultImageOverlay}
                />
                <View style={styles.scoreOverlayBox}>
                  <Text style={styles.scoreOverlayLabel}>Attractiveness</Text>
                  <Text style={[styles.scoreNumber, { color: cfg.color }]}>{result.score}<Text style={styles.scoreDenom}>/10</Text></Text>
                </View>
              </View>
            )}

            {/* Feature Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Face Breakdown</Text>
              <View style={styles.featureGrid}>
                {result.features.map((f) => (
                  <View key={f.label} style={styles.featureItem}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <View style={styles.featureBarBg}>
                      <View style={[styles.featureBarFill, {
                        width: `${(f.score / 10) * 100}%` as any,
                        backgroundColor: cfg.color,
                      }]} />
                    </View>
                    <Text style={[styles.featureScore, { color: cfg.color }]}>{f.score}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Roast Bubble */}
            <View style={[styles.roastBubble, { borderLeftColor: cfg.color }]}>
              <Text style={styles.roastEmoji}>💬</Text>
              <Text style={styles.roastText}>{result.roast}</Text>
            </View>

            {/* Tip Box */}
            <View style={[styles.tipBox, { borderLeftColor: cfg.color }]}>
              <Text style={[styles.tipLabel, { color: cfg.color }]}>🔥 Glow-Up Tip:</Text>
              <Text style={styles.tipText}>"{result.tip}"</Text>
            </View>

            {/* Actions */}
            <View style={styles.resultActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => { setImageUri(null); setResult(null); }}>
                <Text style={styles.secondaryBtnText}>New Selfie</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, { backgroundColor: cfg.color }]} onPress={analyzeImage}>
                <Text style={styles.primaryBtnText}>Roast Again</Text>
              </Pressable>
            </View>
          </>
        )}
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
  headerTitle: { fontSize: 19, fontWeight: "800", color: "#fff" },
  content: { paddingHorizontal: 20, alignItems: "center", gap: 14 },

  modeRow: { flexDirection: "row", gap: 8, width: "100%" },
  modeChip: {
    flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
  },
  modeChipText: { color: "rgba(255,255,255,0.5)", fontWeight: "700", fontSize: 13 },
  modeChipTextActive: { color: "#fff" },

  imagePickerWrap: { width: "100%" },
  imagePicker: {
    width: "100%", aspectRatio: 1, borderRadius: 24,
    overflow: "hidden", borderWidth: 2, borderStyle: "dashed",
  },
  selfieImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1, justifyContent: "center", alignItems: "center", gap: 10,
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
    width: "100%", paddingVertical: 18, borderRadius: 20, alignItems: "center",
  },
  analyzeBtnDisabled: { opacity: 0.35 },
  analyzeBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  hintBox: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14, padding: 14, alignItems: "center",
  },
  hintText: { color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center" },

  resultHeader: {
    width: "100%", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14, padding: 12, borderWidth: 1,
  },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  modeBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  shareCountText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600" },

  resultImageWrap: {
    width: "100%", aspectRatio: 1, borderRadius: 22, overflow: "hidden", position: "relative",
  },
  resultImage: { width: "100%", height: "100%" },
  resultImageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  scoreOverlayBox: { position: "absolute", bottom: 16, left: 16 },
  scoreOverlayLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  scoreNumber: { fontSize: 42, fontWeight: "900", lineHeight: 48 },
  scoreDenom: { fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: "600" },

  breakdownCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, gap: 12,
  },
  breakdownTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  featureGrid: { gap: 8 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureLabel: { width: 60, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  featureBarBg: {
    flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden",
  },
  featureBarFill: { height: "100%", borderRadius: 3 },
  featureScore: { width: 28, fontSize: 12, fontWeight: "800", textAlign: "right" },

  roastBubble: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 16, borderLeftWidth: 3, flexDirection: "row", gap: 10,
  },
  roastEmoji: { fontSize: 20 },
  roastText: { color: "#fff", fontSize: 15, lineHeight: 24, flex: 1 },

  tipBox: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16, padding: 16, borderLeftWidth: 3, gap: 6,
  },
  tipLabel: { fontWeight: "800", fontSize: 14 },
  tipText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontStyle: "italic", lineHeight: 20 },

  resultActions: { flexDirection: "row", gap: 10, width: "100%" },
  primaryBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondaryBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
