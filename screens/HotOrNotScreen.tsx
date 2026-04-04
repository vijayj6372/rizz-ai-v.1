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

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "HotOrNot"> };

const AI_COMMENTS_A_WINS = [
  "You're stealing the spotlight! 🌟",
  "No contest – you win this round! 🏆",
  "Your vibe is on another level! 🔥",
  "Clear winner. Your friend needs a glow-up ASAP. 😂",
];

const AI_COMMENTS_B_WINS = [
  "Your friend is stealing the spotlight! ⭐",
  "Tough one but your friend edges you out! 🔥",
  "Your friend's got that main character energy. 💀",
  "You got outshined this time – hit the gym bro! 😂",
];

const AI_COMMENTS_TIE = [
  "Too close to call! You're both equally hot. 🔥🔥",
  "A draw – you're both threats! 😍",
  "The AI couldn't decide. You're both elite. 💪",
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

export default function HotOrNotScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    scoreA: number; scoreB: number; winner: "A" | "B" | "tie"; comment: string;
  } | null>(null);

  const pickImage = async (slot: "A" | "B") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      if (slot === "A") { setImageA(res.assets[0].uri); }
      else { setImageB(res.assets[0].uri); }
      setResult(null);
    }
  };

  const compare = async () => {
    if (!imageA || !imageB) return;
    await playButtonSound();
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    triggerHaptic();
    const scoreA = randomScore(3, 9.5);
    const scoreB = randomScore(3, 9.5);
    const diff = Math.abs(scoreA - scoreB);
    let winner: "A" | "B" | "tie";
    let comment: string;
    if (diff < 0.5) {
      winner = "tie";
      comment = randomItem(AI_COMMENTS_TIE);
    } else if (scoreA > scoreB) {
      winner = "A";
      comment = randomItem(AI_COMMENTS_A_WINS);
    } else {
      winner = "B";
      comment = randomItem(AI_COMMENTS_B_WINS);
    }
    setResult({ scoreA, scoreB, winner, comment });
    setLoading(false);
  };

  const reset = () => { setImageA(null); setImageB(null); setResult(null); };

  const canCompare = imageA && imageB;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Hot or Not ⭐</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>COMPARE 2 PICS · WHO WINS?</Text>

        {!result ? (
          <>
            <View style={styles.picsRow}>
              <Pressable style={styles.picSlot} onPress={() => pickImage("A")}>
                {imageA ? (
                  <Image source={{ uri: imageA }} style={styles.picImage} />
                ) : (
                  <View style={styles.picPlaceholder}>
                    <Ionicons name="person-add" size={36} color="rgba(200,168,0,0.6)" />
                    <Text style={styles.picLabel}>You</Text>
                  </View>
                )}
                <View style={styles.picBadge}><Text style={styles.picBadgeText}>YOU</Text></View>
              </Pressable>

              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              <Pressable style={styles.picSlot} onPress={() => pickImage("B")}>
                {imageB ? (
                  <Image source={{ uri: imageB }} style={styles.picImage} />
                ) : (
                  <View style={styles.picPlaceholder}>
                    <Ionicons name="people" size={36} color="rgba(200,168,0,0.6)" />
                    <Text style={styles.picLabel}>Friend</Text>
                  </View>
                )}
                <View style={[styles.picBadge, { backgroundColor: "#9C27B0" }]}>
                  <Text style={styles.picBadgeText}>FRIEND</Text>
                </View>
              </Pressable>
            </View>

            <Pressable
              style={[styles.compareBtn, !canCompare && styles.compareBtnDisabled]}
              onPress={compare}
              disabled={!canCompare || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.compareBtnText}>⭐ Who's Hotter?</Text>
              )}
            </Pressable>

            {loading && (
              <Text style={styles.loadingText}>AI is judging both of you... 👀</Text>
            )}

            {!imageA && !imageB && (
              <Text style={styles.hintText}>Upload 2 photos to see who's hotter!</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.whosTitleText}>Who's Hotter?</Text>

            <View style={styles.resultRow}>
              <View style={styles.resultSlot}>
                <View style={[
                  styles.resultImgWrap,
                  result.winner === "A" && styles.winnerBorder,
                ]}>
                  {imageA && <Image source={{ uri: imageA }} style={styles.resultImg} />}
                  {result.winner === "A" && (
                    <View style={styles.crownBadge}><Text style={styles.crownText}>👑</Text></View>
                  )}
                </View>
                <View style={[styles.scorePill, result.winner === "A" ? styles.winnerPill : styles.loserPill]}>
                  <Text style={styles.scorePillText}>{result.scoreA.toFixed(1)}</Text>
                </View>
                <Text style={styles.slotLabel}>You</Text>
              </View>

              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              <View style={styles.resultSlot}>
                <View style={[
                  styles.resultImgWrap,
                  result.winner === "B" && styles.winnerBorder,
                ]}>
                  {imageB && <Image source={{ uri: imageB }} style={styles.resultImg} />}
                  {result.winner === "B" && (
                    <View style={styles.crownBadge}><Text style={styles.crownText}>👑</Text></View>
                  )}
                </View>
                <View style={[styles.scorePill, result.winner === "B" ? styles.winnerPill : styles.loserPill]}>
                  <Text style={styles.scorePillText}>{result.scoreB.toFixed(1)}</Text>
                </View>
                <Text style={styles.slotLabel}>Friend</Text>
              </View>
            </View>

            <View style={styles.aiSaysBox}>
              <Text style={styles.aiSaysLabel}>AI Says:</Text>
              <Text style={styles.aiSaysText}>"{result.comment}"</Text>
            </View>

            <View style={styles.resultActions}>
              <Pressable style={styles.rematchBtn} onPress={compare}>
                <Text style={styles.rematchBtnText}>Rematch</Text>
              </Pressable>
              <Pressable style={styles.newBtn} onPress={reset}>
                <Text style={styles.newBtnText}>New Match</Text>
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
  content: { paddingHorizontal: 20, alignItems: "center", gap: 20 },
  subtitle: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 1.2 },
  picsRow: { flexDirection: "row", alignItems: "center", gap: 16, width: "100%" },
  picSlot: {
    flex: 1, aspectRatio: 1, borderRadius: 20, overflow: "hidden",
    borderWidth: 2, borderColor: "rgba(200,168,0,0.4)", borderStyle: "dashed", position: "relative",
  },
  picImage: { width: "100%", height: "100%" },
  picPlaceholder: {
    flex: 1, backgroundColor: "rgba(200,168,0,0.06)",
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  picLabel: { color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  picBadge: {
    position: "absolute", bottom: 8, left: 8,
    backgroundColor: "#C8A800", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  picBadgeText: { color: "#000", fontSize: 10, fontWeight: "900" },
  vsCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#C8A800", justifyContent: "center", alignItems: "center",
  },
  vsText: { color: "#000", fontWeight: "900", fontSize: 14 },
  compareBtn: {
    width: "100%", paddingVertical: 18, borderRadius: 20,
    backgroundColor: "#C8A800", alignItems: "center",
  },
  compareBtnDisabled: { opacity: 0.4 },
  compareBtnText: { color: "#000", fontSize: 18, fontWeight: "900" },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  hintText: { color: "rgba(255,255,255,0.35)", fontSize: 14, textAlign: "center" },
  whosTitleText: { fontSize: 26, fontWeight: "900", color: "#fff" },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 16, width: "100%" },
  resultSlot: { flex: 1, alignItems: "center", gap: 8 },
  resultImgWrap: {
    width: "100%", aspectRatio: 1, borderRadius: 16, overflow: "hidden",
    borderWidth: 3, borderColor: "transparent", position: "relative",
  },
  winnerBorder: { borderColor: "#FFD700" },
  resultImg: { width: "100%", height: "100%" },
  crownBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, padding: 4,
  },
  crownText: { fontSize: 18 },
  scorePill: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
  },
  winnerPill: { backgroundColor: "#FFD700" },
  loserPill: { backgroundColor: "#9C27B0" },
  scorePillText: { color: "#000", fontWeight: "900", fontSize: 18 },
  slotLabel: { color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: 13 },
  aiSaysBox: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 16, gap: 6,
  },
  aiSaysLabel: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  aiSaysText: { color: "#fff", fontSize: 16, fontStyle: "italic", lineHeight: 24 },
  resultActions: { flexDirection: "row", gap: 12, width: "100%" },
  rematchBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "#3B82F6", alignItems: "center",
  },
  rematchBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  newBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "#E040A0", alignItems: "center",
  },
  newBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
