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

const COMMENTS_A_WINS = [
  "You're stealing the spotlight! No contest. 🌟",
  "Clear winner – your friend needs a serious glow-up. 😂",
  "You win this round. It wasn't even close. 🏆",
  "Your vibe is on another level entirely. 🔥",
  "The algorithm doesn't lie. You win. Own it. 💪",
  "Your friend tried their best. It just wasn't enough today. 😅",
  "You're the main character. Your friend is a supporting role. 💀",
  "Scientifically speaking, you are hotter. The data is clear. 📊",
  "Victory goes to you. Not even a little bit close. 👑",
  "The AI scanned both faces and selected yours instantly. You're welcome. 🔥",
  "Your friend gave it a solid attempt. You just outclassed them.",
  "Jaw structure, eyes, overall vibe – you sweep every category. 🏆",
];

const COMMENTS_B_WINS = [
  "Your friend is stealing the spotlight! ⭐ Tough look.",
  "Ouch. Your friend edged you out on every metric. 🔥",
  "Your friend's got that main character energy. You're the sidekick today. 💀",
  "Not your day bro. The AI was not kind to you. 😂",
  "Your friend won this one clean. Time to hit the gym? 💪",
  "The gap was wider than expected. Your friend wins comfortably. 📊",
  "Scientifically speaking, your friend is hotter. Facts don't care. 🤷",
  "Your friend has been blessed with better genes in this comparison. 😅",
  "Rematch? The AI is not sure it'll change the result. 💀",
  "Your friend wins with a dominant score. Respect the result.",
  "The AI felt bad so it triple-checked. Same answer. Your friend wins. 😂",
  "Your friend is out here operating on a different level. Respect. 🔥",
];

const COMMENTS_TIE = [
  "Too close to call! You're both equally hot. 🔥🔥",
  "A statistical tie. You're both threats in different ways. 😍",
  "The AI gave up trying to choose. You're both certified. 💪",
  "Literally indistinguishable. The algorithm called it a draw. 📊",
  "Both of you win. And both of you lose. That's a tie. 😂",
  "The AI said: 'I cannot in good conscience pick one.' So it didn't. ✨",
];

const LOADING_MSGS = [
  "Scanning both faces...",
  "Comparing facial symmetry...",
  "Running hotness algorithm...",
  "Calculating who wins...",
  "Delivering the verdict...",
];

const FACE_METRICS = ["Jawline", "Eyes", "Skin", "Symmetry", "Vibe"];

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

export default function HotOrNotScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [nameA, setNameA] = useState("You");
  const [nameB, setNameB] = useState("Friend");
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [result, setResult] = useState<{
    scoreA: number; scoreB: number;
    metricsA: { label: string; score: number }[];
    metricsB: { label: string; score: number }[];
    winner: "A" | "B" | "tie"; comment: string;
    margin: string;
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
      if (slot === "A") setImageA(res.assets[0].uri);
      else setImageB(res.assets[0].uri);
      setResult(null);
    }
  };

  const compare = async () => {
    if (!imageA || !imageB) return;
    await playButtonSound();
    setLoading(true);
    setResult(null);
    for (let i = 0; i < LOADING_MSGS.length; i++) {
      setLoadingMsg(i);
      await new Promise((r) => setTimeout(r, 420));
    }
    triggerHaptic();
    const scoreA = randomScore(4, 9.5);
    const scoreB = randomScore(4, 9.5);
    const diff = Math.abs(scoreA - scoreB);
    let winner: "A" | "B" | "tie";
    let comment: string;
    let margin: string;
    if (diff < 0.4) {
      winner = "tie";
      comment = randomItem(COMMENTS_TIE);
      margin = "0.0";
    } else if (scoreA > scoreB) {
      winner = "A";
      comment = randomItem(COMMENTS_A_WINS);
      margin = diff.toFixed(1);
    } else {
      winner = "B";
      comment = randomItem(COMMENTS_B_WINS);
      margin = diff.toFixed(1);
    }
    const metricsA = FACE_METRICS.map((label) => ({
      label, score: randomScore(Math.max(3, scoreA - 1.5), Math.min(10, scoreA + 1.5)),
    }));
    const metricsB = FACE_METRICS.map((label) => ({
      label, score: randomScore(Math.max(3, scoreB - 1.5), Math.min(10, scoreB + 1.5)),
    }));
    setMatchCount((c) => c + 1);
    setResult({ scoreA, scoreB, metricsA, metricsB, winner, comment, margin });
    setLoading(false);
  };

  const reset = () => { setImageA(null); setImageB(null); setResult(null); };

  const winnerColor = result?.winner === "A" ? "#FFD700" : result?.winner === "B" ? "#E040A0" : "#00CFA8";

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Hot or Not ⭐</Text>
        {matchCount > 0 && (
          <View style={styles.matchBadge}><Text style={styles.matchBadgeText}>{matchCount}</Text></View>
        )}
        {matchCount === 0 && <View style={{ width: 40 }} />}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>COMPARE 2 PICS · WHO'S HOTTER?</Text>

        {/* Photo Upload Row – always visible */}
        <View style={styles.picsRow}>
          <View style={styles.picCol}>
            <Pressable
              style={[styles.picSlot, result?.winner === "A" && styles.picSlotWinner, result?.winner === "B" && styles.picSlotLoser]}
              onPress={() => pickImage("A")}
            >
              {imageA ? (
                <Image source={{ uri: imageA }} style={styles.picImage} />
              ) : (
                <View style={styles.picPlaceholder}>
                  <Ionicons name="person-add" size={32} color="rgba(200,168,0,0.6)" />
                  <Text style={styles.picLabel}>Tap to add</Text>
                </View>
              )}
              {result?.winner === "A" && (
                <View style={styles.crownBadge}><Text style={styles.crownText}>👑</Text></View>
              )}
            </Pressable>
            <Text style={styles.picName}>{nameA}</Text>
            {result && (
              <View style={[styles.scorePill, { backgroundColor: result.winner === "A" ? "#FFD700" : "rgba(255,255,255,0.12)" }]}>
                <Text style={[styles.scorePillText, { color: result.winner === "A" ? "#000" : "#fff" }]}>
                  {result.scoreA.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.vsCol}>
            <View style={[styles.vsCircle, result && { backgroundColor: winnerColor }]}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            {result && result.winner !== "tie" && (
              <Text style={[styles.marginText, { color: winnerColor }]}>+{result.margin}</Text>
            )}
            {result && result.winner === "tie" && (
              <Text style={[styles.marginText, { color: winnerColor }]}>TIE</Text>
            )}
          </View>

          <View style={styles.picCol}>
            <Pressable
              style={[styles.picSlot, result?.winner === "B" && styles.picSlotWinner, result?.winner === "A" && styles.picSlotLoser]}
              onPress={() => pickImage("B")}
            >
              {imageB ? (
                <Image source={{ uri: imageB }} style={styles.picImage} />
              ) : (
                <View style={styles.picPlaceholder}>
                  <Ionicons name="people" size={32} color="rgba(200,168,0,0.6)" />
                  <Text style={styles.picLabel}>Tap to add</Text>
                </View>
              )}
              {result?.winner === "B" && (
                <View style={styles.crownBadge}><Text style={styles.crownText}>👑</Text></View>
              )}
            </Pressable>
            <Text style={styles.picName}>{nameB}</Text>
            {result && (
              <View style={[styles.scorePill, { backgroundColor: result.winner === "B" ? "#E040A0" : "rgba(255,255,255,0.12)" }]}>
                <Text style={[styles.scorePillText, { color: "#fff" }]}>
                  {result.scoreB.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Main CTA */}
        <Pressable
          style={[styles.compareBtn, (!imageA || !imageB) && styles.compareBtnDisabled]}
          onPress={compare}
          disabled={!imageA || !imageB || loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={styles.compareBtnText}>{LOADING_MSGS[loadingMsg]}</Text>
            </View>
          ) : (
            <Text style={styles.compareBtnText}>
              {result ? "🔁 Rematch!" : "⭐ Who's Hotter?"}
            </Text>
          )}
        </Pressable>

        {!imageA && !imageB && (
          <Text style={styles.hintText}>Upload 2 photos above to start comparing!</Text>
        )}

        {/* Result Details */}
        {result && (
          <>
            {/* AI Verdict */}
            <View style={[styles.verdictCard, { borderColor: winnerColor + "55" }]}>
              <Text style={[styles.verdictWinnerLabel, { color: winnerColor }]}>
                {result.winner === "tie" ? "IT'S A TIE! 🔥🔥" : `${result.winner === "A" ? nameA : nameB} WINS! 👑`}
              </Text>
              <Text style={styles.verdictComment}>{result.comment}</Text>
            </View>

            {/* Metric Comparison */}
            <View style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Head-to-Head Breakdown</Text>
              {result.metricsA.map((mA, i) => {
                const mB = result.metricsB[i];
                const aWins = mA.score > mB.score;
                const bWins = mB.score > mA.score;
                return (
                  <View key={mA.label} style={styles.metricCompRow}>
                    <Text style={[styles.metricScore, aWins && { color: "#FFD700" }]}>{mA.score.toFixed(1)}</Text>
                    <View style={styles.metricCenter}>
                      <View style={styles.metricBarRow}>
                        <View style={[styles.metricBarLeft, {
                          width: `${(mA.score / 10) * 100}%` as any,
                          backgroundColor: aWins ? "#FFD700" : "rgba(255,255,255,0.15)",
                        }]} />
                      </View>
                      <Text style={styles.metricLabelCenter}>{mA.label}</Text>
                      <View style={styles.metricBarRow}>
                        <View style={[styles.metricBarRight, {
                          width: `${(mB.score / 10) * 100}%` as any,
                          backgroundColor: bWins ? "#E040A0" : "rgba(255,255,255,0.15)",
                        }]} />
                      </View>
                    </View>
                    <Text style={[styles.metricScore, bWins && { color: "#E040A0" }]}>{mB.score.toFixed(1)}</Text>
                  </View>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable style={styles.newMatchBtn} onPress={reset}>
                <Text style={styles.newMatchBtnText}>New Match</Text>
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
  matchBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#C8A800",
    justifyContent: "center", alignItems: "center",
  },
  matchBadgeText: { color: "#000", fontWeight: "900", fontSize: 15 },
  content: { paddingHorizontal: 20, alignItems: "center", gap: 16 },
  subtitle: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.35)", letterSpacing: 1 },

  picsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, width: "100%" },
  picCol: { flex: 1, alignItems: "center", gap: 8 },
  picSlot: {
    width: "100%", aspectRatio: 1, borderRadius: 18, overflow: "hidden",
    borderWidth: 2, borderColor: "rgba(200,168,0,0.3)", borderStyle: "dashed", position: "relative",
  },
  picSlotWinner: { borderColor: "#FFD700", borderStyle: "solid", borderWidth: 3 },
  picSlotLoser: { borderColor: "rgba(255,255,255,0.1)", borderStyle: "solid", opacity: 0.7 },
  picImage: { width: "100%", height: "100%" },
  picPlaceholder: {
    flex: 1, backgroundColor: "rgba(200,168,0,0.06)",
    justifyContent: "center", alignItems: "center", gap: 6,
  },
  picLabel: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: "600" },
  picName: { color: "rgba(255,255,255,0.6)", fontWeight: "700", fontSize: 13 },
  crownBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, padding: 3,
  },
  crownText: { fontSize: 16 },
  scorePill: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, minWidth: 60, alignItems: "center",
  },
  scorePillText: { fontWeight: "900", fontSize: 16 },

  vsCol: { alignItems: "center", justifyContent: "center", paddingTop: 28, gap: 6 },
  vsCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#C8A800", justifyContent: "center", alignItems: "center",
  },
  vsText: { color: "#000", fontWeight: "900", fontSize: 13 },
  marginText: { fontSize: 13, fontWeight: "900" },

  compareBtn: {
    width: "100%", paddingVertical: 18, borderRadius: 20,
    backgroundColor: "#C8A800", alignItems: "center",
  },
  compareBtnDisabled: { opacity: 0.35 },
  compareBtnText: { color: "#000", fontSize: 17, fontWeight: "900" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  hintText: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" },

  verdictCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18,
    padding: 18, gap: 8, borderWidth: 1, alignItems: "center",
  },
  verdictWinnerLabel: { fontSize: 22, fontWeight: "900" },
  verdictComment: { color: "#fff", fontSize: 15, lineHeight: 22, textAlign: "center" },

  metricsCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, gap: 12,
  },
  metricsTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  metricCompRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metricScore: { width: 32, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "800", textAlign: "center" },
  metricCenter: { flex: 1, gap: 2 },
  metricLabelCenter: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "700", textAlign: "center", letterSpacing: 0.5 },
  metricBarRow: { height: 5, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" },
  metricBarLeft: { height: "100%", borderRadius: 3, alignSelf: "flex-end" },
  metricBarRight: { height: "100%", borderRadius: 3 },

  actionsRow: { flexDirection: "row", gap: 10, width: "100%" },
  newMatchBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center",
  },
  newMatchBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
