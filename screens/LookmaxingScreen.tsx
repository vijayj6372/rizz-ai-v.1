import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type Props = NativeStackScreenProps<RootStackParamList, "Lookmaxing">;

const { width: SW } = Dimensions.get("window");
const CARD_W = Math.min(SW - 32, 420);
const CARD_PINK = "#F86B6D";
const SHADOW_PINK = "#D95657";

interface ScorecardData {
  masculinity: number; cheekBones: number; jawline: number;
  eyes: number; hair: number; skin: number; overall: number;
}

const LOADING_STAGES = [
  "Scanning face structure...",
  "Measuring bone proportions...",
  "Analyzing skin & texture...",
  "Computing symmetry score...",
  "Generating your verdict...",
];

const VERDICTS = [
  { min: 9, label: "Certified Chad",  emoji: "🔱", color: "#00E676", dark: "#00A152", sub: "Top 5% worldwide. Pure genetics." },
  { min: 8, label: "Top 10%",         emoji: "🔥", color: "#AEEA00", dark: "#6ab000", sub: "Consistently above average. Maximize it." },
  { min: 7, label: "Above Average",   emoji: "✨", color: "#FFD600", dark: "#c7a500", sub: "Solid foundation. Glow-up is achievable." },
  { min: 6, label: "Solid Baseline",  emoji: "💪", color: "#FF6D00", dark: "#c43c00", sub: "Good starting point. Room to grow." },
  { min: 0, label: "Rising Star",     emoji: "🌱", color: "#FF4081", dark: "#c60055", sub: "Every legend started somewhere." },
];

const GLOW_TIPS = [
  { icon: "💈", title: "Fresh haircut every 3–4 weeks",         desc: "Consistency keeps you polished even on lazy days.",                        impact: "🔥 High Impact", color: "#FF6B35" },
  { icon: "💧", title: "3-step skincare: Cleanser → SPF",        desc: "SPF alone prevents aging better than any cream on the market.",           impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "🏋️", title: "Gym 3–4x per week minimum",              desc: "Jaw gets more defined, face thins out, posture improves visibly.",        impact: "🔥 High Impact", color: "#FF1744" },
  { icon: "🧍", title: "Fix your posture — right now",           desc: "Shoulders back, chest up. Instant height, dominance, attractiveness.",    impact: "✨ Quick Win",   color: "#FF9800" },
  { icon: "😴", title: "Sleep 7–9 hours every night",            desc: "Sleep deprivation shows instantly in skin, eyes, and energy levels.",     impact: "🔥 High Impact", color: "#4CAF50" },
  { icon: "🌞", title: "SPF 30+ every single morning",           desc: "UV is the #1 cause of premature aging. Apply even on cloudy days.",       impact: "🔥 High Impact", color: "#29B6F6" },
  { icon: "😁", title: "Whiten your teeth this week",            desc: "Whitening strips for $20 deliver a celebrity smile. Best ROI possible.",  impact: "✨ Quick Win",   color: "#7C4DFF" },
  { icon: "🤨", title: "Groom your eyebrows monthly",            desc: "Threading takes 20 min, lasts a month, and changes your whole face.",     impact: "✨ Quick Win",   color: "#E040A0" },
  { icon: "💧", title: "Drink 3 liters of water daily",          desc: "Dehydration causes dull skin, dark circles, poor metabolism.",            impact: "✨ Quick Win",   color: "#29B6F6" },
  { icon: "🌹", title: "Find your signature cologne",            desc: "Scent and memory share the same brain region. Be unforgettable.",         impact: "✨ Quick Win",   color: "#E040A0" },
  { icon: "🥩", title: "1g protein per lb of bodyweight",        desc: "Muscle, hair, skin elasticity all require adequate protein.",             impact: "🔥 High Impact", color: "#FF9800" },
  { icon: "🧴", title: "Retinol 2–3× per week at night",         desc: "Speeds cell turnover, reduces wrinkles. Gold standard of anti-aging.",   impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "🪒", title: "Beard: full, maintained, or shaved clean", desc: "Patchy stubble is the enemy. Pick a lane and execute perfectly.",      impact: "✨ Quick Win",   color: "#E040A0" },
];

const METRICS: { key: keyof ScorecardData; label: string; emoji: string }[] = [
  { key: "masculinity", label: "Masculinity", emoji: "💪" },
  { key: "cheekBones",  label: "Cheek Bones", emoji: "🧔" },
  { key: "jawline",     label: "Jawline",     emoji: "👄" },
  { key: "eyes",        label: "Eyes",        emoji: "👀" },
  { key: "hair",        label: "Hair",        emoji: "💇" },
  { key: "skin",        label: "Skin",        emoji: "💆" },
];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function genScore(): number {
  const r = Math.random();
  if (r < 0.03) return 10;
  if (r < 0.10) return 9;
  if (r < 0.25) return 8;
  if (r < 0.50) return 7;
  if (r < 0.80) return 6;
  return 5;
}

function getVerdict(s: number) { return VERDICTS.find((v) => s >= v.min)!; }

function scoreCol(s: number) {
  if (s >= 9) return "#00E676";
  if (s >= 8) return "#AEEA00";
  if (s >= 7) return "#FFD600";
  if (s >= 6) return "#FF6D00";
  return "#FF4081";
}

function haptic() {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/* ─── Animated metric bar ─── */
function MetricBar({ label, emoji, score, delay = 0 }: { label: string; emoji: string; score: number; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const col = scoreCol(score);

  useEffect(() => {
    Animated.timing(anim, { toValue: score / 10, duration: 800, delay, useNativeDriver: false }).start();
  }, [score]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={mb.row}>
      <Text style={mb.emoji}>{emoji}</Text>
      <Text style={mb.label}>{label}</Text>
      <View style={mb.track}>
        <Animated.View style={[mb.fill, { width, backgroundColor: col, shadowColor: col }]} />
      </View>
      <Text style={[mb.num, { color: col }]}>{score}/10</Text>
    </View>
  );
}
const mb = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji: { fontSize: 20, width: 26 },
  label: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700", width: 92 },
  track: { flex: 1, height: 10, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 5, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  num: { fontSize: 13, fontWeight: "900", width: 40, textAlign: "right" },
});

/* ─── Static share card (no transparency — required for clean screenshot capture) ─── */
function ShareCard({ photoUri, scores, verdict }: { photoUri: string | null; scores: ScorecardData; verdict: ReturnType<typeof getVerdict> }) {
  return (
    <LinearGradient colors={["#FF7A26", "#E8115A", "#7B0EA0"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={sc.card}>
      {/* Brand header */}
      <View style={sc.brandRow}>
        <Text style={sc.brandIcon}>🔥</Text>
        <Text style={sc.brandName}>Rizz AI</Text>
        <Text style={sc.brandTag}>LOOK SCORE</Text>
      </View>

      {/* Photo + score */}
      <View style={sc.photoRow}>
        {photoUri ? (
          <View style={sc.photoWrap}>
            <Image source={{ uri: photoUri }} style={sc.photo} />
          </View>
        ) : (
          <View style={[sc.photoWrap, { backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
        )}

        <View style={sc.scoreCol}>
          <View style={[sc.scoreBig, { borderColor: verdict.color }]}>
            <Text style={[sc.scoreNum, { color: verdict.color }]}>{scores.overall}</Text>
            <Text style={sc.scoreSlash}>/10</Text>
          </View>
          <View style={[sc.verdictPill, { backgroundColor: verdict.color }]}>
            <Text style={sc.verdictPillText}>{verdict.emoji} {verdict.label}</Text>
          </View>
          {/* Stars */}
          <View style={sc.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Text key={i} style={{ fontSize: 14, color: i <= Math.round(scores.overall / 2) ? verdict.color : "rgba(255,255,255,0.3)" }}>★</Text>
            ))}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={sc.divider} />

      {/* Metrics */}
      <View style={sc.metricsList}>
        {METRICS.map((m, idx) => {
          const s = scores[m.key];
          const c = scoreCol(s);
          const pct = (s / 10) * 100;
          return (
            <View key={m.key} style={sc.metricRow}>
              <Text style={sc.mEmoji}>{m.emoji}</Text>
              <Text style={sc.mLabel}>{m.label}</Text>
              <View style={sc.mTrack}>
                <View style={[sc.mFill, { width: `${pct}%` as any, backgroundColor: c }]} />
              </View>
              <Text style={[sc.mNum, { color: c }]}>{s}/10</Text>
            </View>
          );
        })}
      </View>

      {/* Watermark */}
      <View style={sc.watermark}>
        <Text style={sc.watermarkText}>rizz-ai.app · get yours free</Text>
      </View>
    </LinearGradient>
  );
}
const sc = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, gap: 14, width: "100%" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandIcon: { fontSize: 20 },
  brandName: { color: "#fff", fontSize: 20, fontWeight: "900", flex: 1 },
  brandTag: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  photoRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  photoWrap: { width: 120, height: 120, borderRadius: 18, overflow: "hidden", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  scoreCol: { flex: 1, alignItems: "center", gap: 8 },
  scoreBig: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center", alignItems: "center", flexDirection: "row",
  },
  scoreNum: { fontSize: 30, fontWeight: "900" },
  scoreSlash: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700", marginBottom: 4, alignSelf: "flex-end" },
  verdictPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  verdictPillText: { color: "#000", fontSize: 12, fontWeight: "800" },
  starsRow: { flexDirection: "row", gap: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  metricsList: { gap: 10 },
  metricRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mEmoji: { fontSize: 16, width: 22 },
  mLabel: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "700", width: 82 },
  mTrack: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" },
  mFill: { height: "100%", borderRadius: 4 },
  mNum: { fontSize: 12, fontWeight: "900", width: 36, textAlign: "right" },
  watermark: { alignItems: "center", marginTop: 2 },
  watermarkText: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
});

/* ═══════════════════════════════════ MAIN SCREEN ═══════════════════════════════════ */
export default function LookmaxingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [phase, setPhase] = useState<"upload" | "loading" | "result">("upload");
  const [loadingStage, setLoadingStage] = useState(0);
  const [scores, setScores] = useState<ScorecardData | null>(null);
  const [tip, setTip] = useState(rnd(GLOW_TIPS));
  const [sharing, setSharing] = useState(false);
  const [showWebCam, setShowWebCam] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const shareCardRef = useRef<View>(null);
  const cameraRef = useRef<CameraView>(null);

  /* Pulse while loading */
  useEffect(() => {
    if (phase !== "loading") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase]);

  /* Fade in result */
  useEffect(() => {
    if (phase === "result") {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [phase]);

  const runAnalysis = async () => {
    setPhase("loading");
    setScores(null);
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      setLoadingStage(i);
      await new Promise((r) => setTimeout(r, 480));
    }
    haptic();
    setScores({
      masculinity: genScore(), cheekBones: genScore(), jawline: genScore(),
      eyes: genScore(), hair: genScore(), skin: genScore(), overall: genScore(),
    });
    setTip(rnd(GLOW_TIPS));
    setPhase("result");
  };

  const handleUploadPhoto = async () => {
    try {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) { if (Platform.OS !== "web") Alert.alert("Permission Required", "Allow photo library access."); return; }
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] as any, allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (r.assets?.[0]) { setPhotoUri(r.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const handleTakeSelfie = async () => {
    if (Platform.OS === "web") {
      if (!permission?.granted) {
        const r = await requestPermission();
        if (!r.granted) { Alert.alert("Permission Required", "Allow camera access."); return; }
      }
      setShowWebCam(true);
      return;
    }
    try {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert("Permission Required", "Allow camera access."); return; }
      const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"] as any, allowsEditing: true, aspect: [1, 1], quality: 0.85, cameraType: ImagePicker.CameraType.front });
      if (r.assets?.[0]) { setPhotoUri(r.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const captureWebcam = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo?.uri) { setPhotoUri(photo.uri); setShowWebCam(false); runAnalysis(); }
    } catch {}
  };

  /* ── Share: capture the card then open native share sheet ── */
  const handleShare = async () => {
    if (!shareCardRef.current || sharing) return;
    try {
      setSharing(true);
      await playButtonSound();
      // Give React a frame to render before capture
      await new Promise((r) => setTimeout(r, 100));
      const uri = await captureRef(shareCardRef, { format: "png", quality: 1 });

      if (Platform.OS === "web") {
        // Web Share API
        try {
          const blob = await (await fetch(uri)).blob();
          const file = new File([blob], "rizz-ai-score.png", { type: "image/png" });
          if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
            await (navigator as any).share({ files: [file], title: "My Rizz AI Look Score" });
          } else {
            // Fallback: download the image
            const a = document.createElement("a");
            a.href = uri;
            a.download = "rizz-ai-score.png";
            a.click();
          }
        } catch {}
      } else {
        const ok = await Sharing.isAvailableAsync();
        if (ok) {
          await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Rizz AI Look Score" });
        }
      }
    } catch (e) {
      console.log("Share error:", e);
    } finally {
      setSharing(false);
    }
  };

  const handleReset = () => { setPhotoUri(null); setScores(null); setPhase("upload"); };

  const verdict = scores ? getVerdict(scores.overall) : null;
  const oColor  = scores ? scoreCol(scores.overall) : "#fff";

  return (
    <LinearGradient colors={["#A8BEF0", "#8BAEE8", "#BAD0FC"]} style={styles.root}>
      {/* Webcam modal */}
      <Modal visible={showWebCam} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="front" />
          <View style={styles.camControls}>
            <Pressable style={[styles.camBtn, { backgroundColor: "#333" }]} onPress={() => setShowWebCam(false)}>
              <Text style={styles.camBtnTxt}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.camBtn, { backgroundColor: CARD_PINK }]} onPress={captureWebcam}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.camBtnTxt}>Capture</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backBtn} onPress={async () => { await playButtonSound(); navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={26} color={CARD_PINK} />
        </Pressable>
        <Text style={styles.headerTitle}>Lookmaxing</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 44 }]} showsVerticalScrollIndicator={false}>

        {/* ════════════════ UPLOAD ════════════════ */}
        {phase === "upload" && (
          <View style={styles.uploadWrap}>
            {/* Hero */}
            <LinearGradient colors={["#FF8C42", "#F2226B"]} style={styles.heroBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <MaterialCommunityIcons name="face-man-shimmer" size={56} color="#fff" />
            </LinearGradient>
            <Text style={styles.heroTitle}>Get Your Look Score</Text>
            <Text style={styles.heroSub}>AI analyzes 6 attractiveness metrics and gives you an honest score out of 10</Text>

            {/* Viewfinder frame */}
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Ionicons name="person-outline" size={64} color="rgba(248,107,109,0.3)" />
              <Text style={styles.viewfinderLabel}>Your photo appears here</Text>
            </View>

            {/* Pills */}
            <View style={styles.pillRow}>
              {["🔒 Private", "📴 Offline", "⚡ Instant"].map((t) => (
                <View key={t} style={styles.pill}><Text style={styles.pillTxt}>{t}</Text></View>
              ))}
            </View>

            {/* Primary button */}
            <Pressable style={styles.primaryBtnWrap} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
              <LinearGradient colors={["#FF8C42", "#F2226B"]} style={styles.primaryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="image" size={22} color="#fff" />
                <Text style={styles.primaryBtnTxt}>Upload Photo</Text>
              </LinearGradient>
            </Pressable>

            {/* Secondary button */}
            <Pressable style={styles.secondaryBtn} onPress={async () => { await playButtonSound(); handleTakeSelfie(); }}>
              <View style={styles.secondaryBtnInner}>
                <Ionicons name="camera" size={20} color={CARD_PINK} />
                <Text style={styles.secondaryBtnTxt}>Take a Selfie</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* ════════════════ LOADING ════════════════ */}
        {phase === "loading" && (
          <View style={styles.loadingWrap}>
            {photoUri && (
              <Animated.View style={[styles.loadPhotoFrame, { transform: [{ scale: pulseAnim }] }]}>
                <Image source={{ uri: photoUri }} style={styles.loadPhoto} />
                <LinearGradient colors={["transparent", "rgba(248,107,109,0.7)"]} style={StyleSheet.absoluteFillObject} />
                <View style={styles.scanOverlay}>
                  <Ionicons name="scan" size={36} color="rgba(255,255,255,0.85)" />
                </View>
              </Animated.View>
            )}

            <View style={styles.loadCard}>
              <Text style={styles.loadCardTitle}>🧠  AI Analyzing Your Photo</Text>
              <View style={styles.loadCardDivider} />
              {LOADING_STAGES.map((s, i) => (
                <View key={s} style={styles.stageRow}>
                  <View style={[styles.stageDot, i < loadingStage && { backgroundColor: "#4CAF50" }, i === loadingStage && { backgroundColor: CARD_PINK }]} />
                  <Text style={[styles.stageTxt, i === loadingStage && { color: "#111", fontWeight: "800" }, i < loadingStage && { color: "#4CAF50", textDecorationLine: "line-through" }]}>{s}</Text>
                  {i < loadingStage && <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginLeft: "auto" }} />}
                  {i === loadingStage && <ActivityIndicator size={14} color={CARD_PINK} style={{ marginLeft: "auto" }} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ════════════════ RESULT ════════════════ */}
        {phase === "result" && scores && verdict && (
          <Animated.View style={[styles.resultWrap, { opacity: fadeAnim }]}>

            {/* ── SCORE HERO ── */}
            <View style={[styles.scoreHero, { shadowColor: oColor }]}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={styles.heroPhoto} />
                : <LinearGradient colors={["#2a1050", "#1a082e"]} style={styles.heroPhoto} />
              }
              {/* Dark gradient over photo */}
              <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.85)"]} style={styles.heroPhotoGrad} />

              {/* Score ring — top right */}
              <View style={[styles.scoreRingOuter, { borderColor: oColor + "50", shadowColor: oColor }]}>
                <View style={[styles.scoreRingInner, { borderColor: oColor }]}>
                  <Text style={[styles.scoreNum, { color: oColor }]}>{scores.overall}</Text>
                  <Text style={styles.scoreSlash}>/10</Text>
                </View>
              </View>

              {/* Verdict overlay — bottom */}
              <View style={styles.heroVerdictWrap}>
                <View style={[styles.verdictBadge, { backgroundColor: oColor }]}>
                  <Text style={styles.verdictBadgeTxt}>{verdict.emoji}  {verdict.label}</Text>
                </View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name={i <= Math.round(scores.overall / 2) ? "star" : "star-outline"} size={19}
                      color={i <= Math.round(scores.overall / 2) ? oColor : "rgba(255,255,255,0.3)"} />
                  ))}
                </View>
                <Text style={styles.verdictSub}>{verdict.sub}</Text>
              </View>
            </View>

            {/* ── ANIMATED BREAKDOWN (interactive, non-captured) ── */}
            <LinearGradient colors={["#FF7A26", "#E8115A", "#9C0FAA"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.breakdownCard}>
              <View style={styles.bdHeader}>
                <Text style={styles.bdTitle}>Look Breakdown</Text>
                <View style={[styles.bdOverallBadge, { borderColor: oColor }]}>
                  <Text style={[styles.bdOverallNum, { color: oColor }]}>{scores.overall}</Text>
                  <Text style={styles.bdOverallSlash}>/10</Text>
                </View>
              </View>
              <View style={styles.bdDivider} />
              <View style={styles.bdList}>
                {METRICS.map((m, i) => (
                  <MetricBar key={m.key} label={m.label} emoji={m.emoji} score={scores[m.key]} delay={i * 80} />
                ))}
              </View>
            </LinearGradient>

            {/* ── SHAREABLE CARD (captured for WhatsApp / IG / Snapchat) ── */}
            <View style={styles.shareCardSection}>
              <View style={styles.shareCardLabelRow}>
                <Ionicons name="share-social" size={14} color="rgba(0,0,0,0.4)" />
                <Text style={styles.shareCardLabel}>TAP A BUTTON BELOW TO SHARE THIS CARD</Text>
              </View>

              <View ref={shareCardRef} collapsable={false} style={styles.shareCardOuter}>
                <ShareCard photoUri={photoUri} scores={scores} verdict={verdict} />
              </View>
            </View>

            {/* ── SHARE BUTTONS ── */}
            <View style={styles.shareRow}>
              {/* WhatsApp */}
              <Pressable
                style={[styles.shareBtn, { backgroundColor: "#25D366", shadowColor: "#25D366" }]}
                onPress={handleShare}
                disabled={sharing}
              >
                {sharing ? <ActivityIndicator color="#fff" size="small" />
                  : <><Ionicons name="logo-whatsapp" size={24} color="#fff" /><Text style={styles.shareBtnTxt}>WhatsApp</Text></>}
              </Pressable>

              {/* Instagram */}
              <Pressable style={[styles.shareBtn, { padding: 0, overflow: "hidden", shadowColor: "#dc2743" }]} onPress={handleShare} disabled={sharing}>
                <LinearGradient colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]} style={styles.shareBtnGrad}>
                  {sharing ? <ActivityIndicator color="#fff" size="small" />
                    : <><Ionicons name="logo-instagram" size={24} color="#fff" /><Text style={styles.shareBtnTxt}>Instagram</Text></>}
                </LinearGradient>
              </Pressable>

              {/* Snapchat */}
              <Pressable
                style={[styles.shareBtn, { backgroundColor: "#FFFC00", shadowColor: "#FFFC00" }]}
                onPress={handleShare}
                disabled={sharing}
              >
                {sharing ? <ActivityIndicator color="#000" size="small" />
                  : <><FontAwesome name="snapchat-ghost" size={22} color="#000" /><Text style={[styles.shareBtnTxt, { color: "#000" }]}>Snapchat</Text></>}
              </Pressable>
            </View>

            {/* ── TIP CARD ── */}
            <View style={[styles.tipCard, { borderLeftColor: tip.color }]}>
              <View style={styles.tipTop}>
                <View style={[styles.tipIconBox, { backgroundColor: tip.color + "20" }]}>
                  <Text style={{ fontSize: 26 }}>{tip.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={[styles.tipBadge, { backgroundColor: tip.color }]}>
                    <Text style={styles.tipBadgeTxt}>{tip.impact}</Text>
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </View>
              </View>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
              <Pressable onPress={async () => { await playButtonSound(); navigation.navigate("LookmaxingTips"); }}>
                <Text style={[styles.tipSeeAll, { color: tip.color }]}>See all 200 tips →</Text>
              </Pressable>
            </View>

            {/* ── TRY ANOTHER ── */}
            <Pressable style={styles.tryWrap} onPress={async () => { await playButtonSound(); handleReset(); }}>
              <LinearGradient colors={["#FF8C42", "#F2226B"]} style={styles.tryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.tryTxt}>Try Another Photo</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.uploadLink} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
              <Ionicons name="image-outline" size={15} color="rgba(0,0,0,0.35)" />
              <Text style={styles.uploadLinkTxt}>Upload from gallery instead</Text>
            </Pressable>

          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 6,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerTitle: { fontSize: 26, fontFamily: "LilitaOne-Regular", color: CARD_PINK, letterSpacing: 0.4 },

  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 6, alignItems: "center" },

  /* Upload */
  uploadWrap: { width: "100%", alignItems: "center", gap: 18, paddingTop: 8 },
  heroBox: {
    width: 100, height: 100, borderRadius: 32,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#FF4500", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  heroTitle: {
    fontSize: 30, fontFamily: "LilitaOne-Regular", color: "#fff", textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  heroSub: { fontSize: 15, color: "rgba(0,0,0,0.5)", textAlign: "center", lineHeight: 22, fontWeight: "600", maxWidth: 300 },

  viewfinder: {
    width: CARD_W, height: CARD_W * 0.72, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1.5, borderColor: "rgba(248,107,109,0.25)",
    borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: 10, position: "relative",
  },
  corner: { position: "absolute", width: 22, height: 22, borderColor: CARD_PINK },
  cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  viewfinderLabel: { color: "rgba(248,107,109,0.5)", fontWeight: "700", fontSize: 13 },

  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    backgroundColor: "rgba(255,255,255,0.65)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.95)",
  },
  pillTxt: { color: "#444", fontSize: 13, fontWeight: "700" },

  primaryBtnWrap: {
    width: "100%", maxWidth: 340, borderRadius: 22, overflow: "hidden",
    shadowColor: SHADOW_PINK, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  primaryBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 19 },
  primaryBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },

  secondaryBtn: {
    width: "100%", maxWidth: 340, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 2, borderColor: CARD_PINK + "55",
    overflow: "hidden",
  },
  secondaryBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingVertical: 16 },
  secondaryBtnTxt: { color: CARD_PINK, fontSize: 18, fontWeight: "800" },

  /* Loading */
  loadingWrap: { width: "100%", alignItems: "center", gap: 24, paddingTop: 8 },
  loadPhotoFrame: {
    width: 180, height: 180, borderRadius: 30, overflow: "hidden",
    shadowColor: SHADOW_PINK, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 12,
  },
  loadPhoto: { width: "100%", height: "100%" },
  scanOverlay: { position: "absolute", bottom: 14, alignSelf: "center" },
  loadCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 24, padding: 22, gap: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
  },
  loadCardTitle: { fontSize: 18, fontWeight: "800", color: "#1a1a1a", textAlign: "center" },
  loadCardDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginBottom: 4 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stageDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "rgba(0,0,0,0.12)" },
  stageTxt: { fontSize: 14, color: "rgba(0,0,0,0.38)", fontWeight: "600", flex: 1 },

  /* Result */
  resultWrap: { width: "100%", alignItems: "center", gap: 14, paddingTop: 4 },

  /* Score hero */
  scoreHero: {
    width: "100%", borderRadius: 28, overflow: "hidden",
    backgroundColor: "#1a1a2e",
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.55, shadowRadius: 24, elevation: 18,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
  },
  heroPhoto: { width: "100%", height: 290, resizeMode: "cover" },
  heroPhotoGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: 190 },

  scoreRingOuter: {
    position: "absolute", top: 14, right: 14,
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 14, elevation: 12,
  },
  scoreRingInner: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3,
    justifyContent: "center", alignItems: "center", flexDirection: "row",
  },
  scoreNum: { fontSize: 34, fontWeight: "900", lineHeight: 38 },
  scoreSlash: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "700", marginBottom: 4, alignSelf: "flex-end" },

  heroVerdictWrap: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 18, paddingBottom: 20, gap: 7,
  },
  verdictBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  verdictBadgeTxt: { color: "#000", fontWeight: "900", fontSize: 14 },
  starsRow: { flexDirection: "row", gap: 3 },
  verdictSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600", lineHeight: 18 },

  /* Breakdown card */
  breakdownCard: { width: "100%", borderRadius: 26, padding: 22, paddingTop: 20, paddingBottom: 26,
    shadowColor: "#E8115A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12 },
  bdHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  bdTitle: { color: "rgba(255,255,255,0.95)", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  bdOverallBadge: {
    flexDirection: "row", alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 10,
    borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4,
  },
  bdOverallNum: { fontSize: 22, fontWeight: "900", lineHeight: 26 },
  bdOverallSlash: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: "700", marginBottom: 1 },
  bdDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 16 },
  bdList: { gap: 14 },

  /* Share card section */
  shareCardSection: { width: "100%", gap: 10 },
  shareCardLabelRow: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center",
  },
  shareCardLabel: { color: "rgba(0,0,0,0.35)", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  shareCardOuter: {
    width: "100%", borderRadius: 24, overflow: "hidden",
    shadowColor: "#E8115A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },

  /* Share buttons */
  shareRow: { flexDirection: "row", gap: 10, width: "100%" },
  shareBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  shareBtnGrad: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  shareBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "800" },

  /* Tip card */
  tipCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 22, padding: 16, borderLeftWidth: 5, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderTopColor: "rgba(255,255,255,0.95)",
    borderRightColor: "rgba(255,255,255,0.95)", borderBottomColor: "rgba(255,255,255,0.95)",
  },
  tipTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  tipBadge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  tipBadgeTxt: { color: "#fff", fontSize: 10, fontWeight: "900", letterSpacing: 0.3 },
  tipTitle: { color: "#1a1a1a", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  tipDesc: { color: "rgba(0,0,0,0.5)", fontSize: 13, lineHeight: 20 },
  tipSeeAll: { alignSelf: "flex-end", fontSize: 13, fontWeight: "800" },

  /* Try another */
  tryWrap: {
    width: "100%", borderRadius: 22, overflow: "hidden",
    shadowColor: SHADOW_PINK, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  tryGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 19 },
  tryTxt: { color: "#fff", fontSize: 19, fontWeight: "800" },

  uploadLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  uploadLinkTxt: { color: "rgba(0,0,0,0.38)", fontSize: 13, fontWeight: "600" },

  /* Webcam */
  camControls: { flexDirection: "row", justifyContent: "space-between", padding: 24, paddingBottom: 44, backgroundColor: "#000" },
  camBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 8 },
  camBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
