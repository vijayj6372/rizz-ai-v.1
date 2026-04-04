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
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "RateMyCrush"> };

const VERDICTS = [
  { min: 9, label: "Out of Your League 😍", color: "#FF69B4" },
  { min: 7, label: "Major Catch! Go for it! 💕", color: "#E040A0" },
  { min: 5, label: "Solid Choice! 💜", color: "#9C27B0" },
  { min: 3, label: "You can do better 👀", color: "#FF9800" },
  { min: 0, label: "Tough love... keep looking 💀", color: "#FF5722" },
];

const COMMENTS = [
  "Your crush is giving main character energy. Slide into those DMs!",
  "They've got a vibe that screams 'hard to get but worth it.'",
  "Honestly? Your crush is rating a solid 8 in personality vibes too.",
  "Warning: High risk of falling deeper. Proceed with caution. 💕",
  "They look like trouble in the best possible way. 🔥",
  "Your taste in crushes? Certified excellent. 10/10.",
  "This person is a certified heartthrob. Your feelings make sense.",
  "Okay but their smile alone adds +2 to the final score.",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomScore(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export default function RateMyCrushScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; verdict: typeof VERDICTS[0]; comment: string } | null>(null);

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
    await new Promise((r) => setTimeout(r, 2000));
    triggerHaptic();
    const score = randomScore(4, 10);
    const verdict = VERDICTS.find((v) => score >= v.min)!;
    setResult({ score, verdict, comment: randomItem(COMMENTS) });
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
            <Text style={styles.subtitle}>HONEST RATING · 1–10</Text>

            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.crushImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="heart" size={56} color="rgba(224,64,160,0.6)" />
                  <Text style={styles.placeholderText}>Tap to upload their photo</Text>
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
                <Text style={styles.analyzeBtnText}>💕 Rate Them!</Text>
              )}
            </Pressable>

            {loading && (
              <Text style={styles.loadingText}>Running the love algorithm... 💕</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultLabel}>Crush Rating 💕</Text>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.resultImage} />
            )}

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Attractiveness Score</Text>
              <Text style={[styles.scoreValue, { color: result.verdict.color }]}>
                {result.score.toFixed(1)}
                <Text style={styles.scoreDenom}>/10</Text>
              </Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < filledStars ? "star" : "star-outline"}
                    size={28}
                    color={i < filledStars ? result.verdict.color : "rgba(255,255,255,0.2)"}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.verdictTag, { backgroundColor: result.verdict.color }]}>
              <Text style={styles.verdictText}>{result.verdict.label}</Text>
            </View>

            <View style={styles.commentBubble}>
              <Text style={styles.commentText}>💬 {result.comment}</Text>
            </View>

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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#100820" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  content: { paddingHorizontal: 20, alignItems: "center", gap: 16 },
  subtitle: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 1.2 },
  imagePicker: {
    width: "100%", aspectRatio: 3 / 4, borderRadius: 24, overflow: "hidden",
    borderWidth: 2, borderColor: "rgba(224,64,160,0.4)", borderStyle: "dashed",
  },
  crushImage: { width: "100%", height: "100%", borderRadius: 22 },
  imagePlaceholder: {
    flex: 1, backgroundColor: "rgba(224,64,160,0.08)",
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
    backgroundColor: "#E040A0", alignItems: "center",
  },
  analyzeBtnDisabled: { opacity: 0.4 },
  analyzeBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center" },
  resultLabel: { fontSize: 22, fontWeight: "800", color: "#fff" },
  resultImage: {
    width: "100%", aspectRatio: 3 / 4, borderRadius: 20, resizeMode: "cover",
  },
  scoreCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20,
    padding: 20, alignItems: "center", gap: 8,
  },
  scoreLabel: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
  scoreValue: { fontSize: 52, fontWeight: "900" },
  scoreDenom: { fontSize: 24, color: "rgba(255,255,255,0.4)" },
  starsRow: { flexDirection: "row", gap: 4 },
  verdictTag: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24,
  },
  verdictText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  commentBubble: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16,
  },
  commentText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  resultActions: { flexDirection: "row", gap: 12, width: "100%" },
  primaryBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
