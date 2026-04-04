import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "RoastMySelfie"> };

const ROASTS = [
  "Bro, you look like you just woke up in a dumpster. Ever heard of a comb? 😂",
  "Your face called – it wants its personality back. Try smiling next time! 💀",
  "Is that a resting judged face or are you always this unimpressed with yourself? 🔥",
  "You've got a face made for radio... and a voice probably made for texting. 😅",
  "I've seen better-looking faces on a passport photo taken on a Monday morning. 💀",
  "Your vibe said 'I gave up' but your eyes say 'I gave up weeks ago.' 😂",
  "Bro your hairline is playing hide and seek – and losing. 🔥",
  "You look like the 'before' picture in every glow-up tutorial. 💀",
];

const GLOW_UP_TIPS = [
  "Try a new hairstyle. Maybe one from this decade!",
  "Skincare is not just for girls – moisturize, king!",
  "Hit the gym. Even 3 days a week transforms you in 3 months.",
  "Sleep 8 hours. Beauty sleep is real, don't skip it.",
  "Fix your posture – stand tall and instantly look more attractive.",
  "Drink water. Hydration literally makes your skin glow.",
  "Upgrade your fit. Clothes that fit = automatic glow-up.",
  "Smile more. Confidence is the most attractive thing you can wear.",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomScore(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export default function RoastMySelfieScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: string; roast: string; tip: string } | null>(null);

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
    await new Promise((r) => setTimeout(r, 2000));
    triggerHaptic();
    setResult({
      score: randomScore(2, 7),
      roast: randomItem(ROASTS),
      tip: randomItem(GLOW_UP_TIPS),
    });
    setLoading(false);
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Roast My Selfie 🔥</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <>
            <Text style={styles.subtitle}>SAVAGE MODE · NO MERCY</Text>

            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.selfieImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={56} color="rgba(255,107,53,0.6)" />
                  <Text style={styles.placeholderText}>Tap to upload your selfie</Text>
                </View>
              )}
            </Pressable>

            {imageUri && (
              <Pressable style={styles.changeBtn} onPress={pickImage}>
                <Text style={styles.changeBtnText}>Change Photo</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.analyzeBtn, !imageUri && styles.analyzeBtnDisabled]}
              onPress={analyzeImage}
              disabled={!imageUri || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.analyzeBtnText}>🔥 Roast Me!</Text>
              )}
            </Pressable>

            {loading && (
              <Text style={styles.loadingText}>Analyzing your face... brace yourself 💀</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultLabel}>Your Roast Result 🔥</Text>
            <View style={styles.resultModeTag}>
              <Text style={styles.resultModeText}>Savage Mode</Text>
            </View>

            {imageUri && (
              <View style={styles.resultImageWrap}>
                <Image source={{ uri: imageUri }} style={styles.resultImage} />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  style={styles.resultImageOverlay}
                />
                <Text style={styles.scoreOverlay}>
                  Attractiveness: <Text style={styles.scoreNumber}>{result.score}</Text>/10
                </Text>
              </View>
            )}

            <View style={styles.roastBubble}>
              <Text style={styles.roastText}>{result.roast}</Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>🔥 Glow-Up Tip:</Text>
              <Text style={styles.tipText}>"{result.tip}"</Text>
            </View>

            <View style={styles.resultActions}>
              <Pressable style={styles.secondaryBtn} onPress={reset}>
                <Text style={styles.secondaryBtnText}>Next Roast</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={analyzeImage}>
                <Text style={styles.primaryBtnText}>Retry</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  content: { paddingHorizontal: 20, alignItems: "center", gap: 16 },
  subtitle: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 1.2 },
  imagePicker: {
    width: "100%", aspectRatio: 1, borderRadius: 24,
    overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,107,53,0.4)",
    borderStyle: "dashed",
  },
  selfieImage: { width: "100%", height: "100%", borderRadius: 22 },
  imagePlaceholder: {
    flex: 1, backgroundColor: "rgba(255,107,53,0.08)",
    justifyContent: "center", alignItems: "center", gap: 12,
  },
  placeholderText: { color: "rgba(255,255,255,0.4)", fontSize: 16, fontWeight: "600" },
  changeBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  changeBtnText: { color: "#fff", fontWeight: "600" },
  analyzeBtn: {
    width: "100%", paddingVertical: 18, borderRadius: 20,
    backgroundColor: "#FF6B35", alignItems: "center",
  },
  analyzeBtnDisabled: { opacity: 0.4 },
  analyzeBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center" },
  resultLabel: { fontSize: 22, fontWeight: "800", color: "#fff", alignSelf: "center" },
  resultModeTag: {
    backgroundColor: "#FF6B35", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  resultModeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  resultImageWrap: {
    width: "100%", aspectRatio: 1, borderRadius: 20, overflow: "hidden", position: "relative",
  },
  resultImage: { width: "100%", height: "100%" },
  resultImageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  scoreOverlay: {
    position: "absolute", bottom: 14, left: 14, color: "#FFD700",
    fontSize: 15, fontWeight: "700",
  },
  scoreNumber: { fontSize: 26, fontWeight: "900" },
  roastBubble: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 16,
  },
  roastText: { color: "#fff", fontSize: 16, lineHeight: 24 },
  tipBox: {
    width: "100%", backgroundColor: "#2A1A08",
    borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: "#FF6B35",
  },
  tipLabel: { color: "#FF6B35", fontWeight: "800", marginBottom: 6, fontSize: 15 },
  tipText: { color: "#fff", fontSize: 14, fontStyle: "italic", lineHeight: 22 },
  resultActions: { flexDirection: "row", gap: 12, width: "100%" },
  primaryBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "#FF6B35", alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
