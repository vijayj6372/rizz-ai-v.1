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

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W - 32, 420);

const CARD_PINK = "#F86B6D";
const SHADOW_PINK = "#D95657";

interface ScorecardData {
  masculinity: number;
  cheekBones: number;
  jawline: number;
  eyes: number;
  hair: number;
  skin: number;
  overall: number;
}

const LOADING_STAGES = [
  "Scanning face structure...",
  "Measuring bone proportions...",
  "Analyzing skin & texture...",
  "Computing symmetry score...",
  "Generating your verdict...",
];

const VERDICTS = [
  { min: 9,  label: "Certified Chad",  emoji: "🔱", color: "#00C853", sub: "You're in the top 5%. Genetics blessed you." },
  { min: 8,  label: "Top 10%",         emoji: "🔥", color: "#64DD17", sub: "Consistently above average. Keep optimizing." },
  { min: 7,  label: "Above Average",   emoji: "✨", color: "#FFD600", sub: "Solid foundation. Glow-up is very achievable." },
  { min: 6,  label: "Solid Baseline",  emoji: "💪", color: "#FF6D00", sub: "Good starting point. Lots of room to grow." },
  { min: 0,  label: "Rising Star",     emoji: "🌱", color: "#E040A0", sub: "Every top 1% person started somewhere." },
];

const GLOW_TIPS = [
  { icon: "💈", title: "Get a fresh haircut every 3–4 weeks", desc: "A maintained cut signals you have your life together. Consistency keeps you polished even on lazy days.", impact: "🔥 High Impact", color: "#FF6B35" },
  { icon: "💧", title: "Start a 3-step skincare routine", desc: "Cleanser → Moisturizer → SPF. Non-negotiable. SPF alone prevents aging better than any cream on the market.", impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "🏋️", title: "Hit the gym 3–4x per week", desc: "Muscle transforms your face AND body. Jaw gets more defined, face thins out, posture improves visibly.", impact: "🔥 High Impact", color: "#FF1744" },
  { icon: "🧍", title: "Fix your posture immediately", desc: "Shoulders back, chest up, chin parallel to floor. Instant height, dominance, and attractiveness boost.", impact: "✨ Quick Win", color: "#FF9800" },
  { icon: "😴", title: "Sleep 7–9 hours every night", desc: "Sleep deprivation shows instantly in your skin, eyes, and energy. 8 hours beats any supplement.", impact: "🔥 High Impact", color: "#4CAF50" },
  { icon: "🌞", title: "Wear SPF 30+ every morning", desc: "UV damage is the #1 cause of premature aging. Apply even on cloudy days.", impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "😁", title: "Whiten your teeth consistently", desc: "Whitening strips give you a celebrity smile for $20. The ROI on this single purchase is insane.", impact: "✨ Quick Win", color: "#29B6F6" },
  { icon: "🤨", title: "Groom your eyebrows monthly", desc: "Unibrows and wild brows drop your score significantly. Threading takes 20 min and lasts a month.", impact: "✨ Quick Win", color: "#E040A0" },
  { icon: "💧", title: "Drink 3 liters of water daily", desc: "Dehydration causes dull skin, dark circles, poor metabolism. Water is the cheapest glow-up there is.", impact: "✨ Quick Win", color: "#29B6F6" },
  { icon: "🌹", title: "Find a signature cologne", desc: "Scent is processed in the same brain region as memory and emotion. A good cologne makes you unforgettable.", impact: "✨ Quick Win", color: "#E040A0" },
  { icon: "🥩", title: "Eat 1g protein per lb of bodyweight", desc: "Muscle requires protein. So does hair, skin elasticity, and nail strength. Most people eat half of what they need.", impact: "🔥 High Impact", color: "#FF9800" },
  { icon: "🧴", title: "Use retinol 2–3x per week at night", desc: "Retinol speeds up cell turnover, reduces wrinkles, and fades hyperpigmentation. Gold standard of anti-aging.", impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "🪒", title: "Maintain your beard or shave clean", desc: "Patchy stubble is the enemy. Either grow it fully, maintain it precisely, or shave clean. No in-between.", impact: "✨ Quick Win", color: "#E040A0" },
];

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateScore(): number {
  const r = Math.random();
  if (r < 0.03) return 10;
  if (r < 0.10) return 9;
  if (r < 0.25) return 8;
  if (r < 0.50) return 7;
  if (r < 0.80) return 6;
  return 5;
}

function getVerdict(score: number) {
  return VERDICTS.find((v) => score >= v.min) ?? VERDICTS[VERDICTS.length - 1];
}

function scoreColor(s: number) {
  if (s >= 9) return "#00C853";
  if (s >= 8) return "#64DD17";
  if (s >= 7) return "#FFD600";
  if (s >= 6) return "#FF6D00";
  return "#FF3D00";
}

function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/* ─── Animated metric bar ─── */
function MetricBar({ label, emoji, score }: { label: string; emoji: string; score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const color = scoreColor(score);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 10,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={mStyles.row}>
      <Text style={mStyles.emoji}>{emoji}</Text>
      <Text style={mStyles.label}>{label}</Text>
      <View style={mStyles.barBg}>
        <Animated.View style={[mStyles.barFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={[mStyles.score, { color }]}>{score}/10</Text>
    </View>
  );
}
const mStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji: { fontSize: 22, width: 28 },
  label: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "700", width: 95 },
  barBg: {
    flex: 1, height: 9, backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 5, overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
  score: { fontSize: 14, fontWeight: "900", width: 42, textAlign: "right" },
});

/* ─── Main screen ─── */
export default function LookmaxingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [phase, setPhase] = useState<"upload" | "loading" | "result">("upload");
  const [loadingStage, setLoadingStage] = useState(0);
  const [scores, setScores] = useState<ScorecardData | null>(null);
  const [glowTip, setGlowTip] = useState(randomItem(GLOW_TIPS));
  const [showWebCam, setShowWebCam] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shareRef = useRef<View>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (phase === "loading") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase]);

  const runAnalysis = async () => {
    setPhase("loading");
    setScores(null);
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      setLoadingStage(i);
      await new Promise((r) => setTimeout(r, 480));
    }
    triggerHaptic();
    const overall = generateScore();
    setScores({
      masculinity: generateScore(), cheekBones: generateScore(),
      jawline: generateScore(), eyes: generateScore(),
      hair: generateScore(), skin: generateScore(), overall,
    });
    setGlowTip(randomItem(GLOW_TIPS));
    setPhase("result");
  };

  const handleUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        if (Platform.OS !== "web") Alert.alert("Permission Required", "Please allow photo library access.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (res.assets?.[0]) { setPhotoUri(res.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const handleTakeSelfie = async () => {
    if (Platform.OS === "web") {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) { Alert.alert("Permission Required", "Please allow camera access."); return; }
      }
      setShowWebCam(true);
      return;
    }
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission Required", "Please allow camera access."); return; }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });
      if (res.assets?.[0]) { setPhotoUri(res.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const captureWebcamPhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        if (photo?.uri) { setPhotoUri(photo.uri); setShowWebCam(false); runAnalysis(); }
      } catch {}
    }
  };

  const handleShare = async () => {
    try {
      if (!shareRef.current) return;
      const uri = await captureRef(shareRef, { format: "png", quality: 0.9 });
      const ok = await Sharing.isAvailableAsync();
      if (ok) await Sharing.shareAsync(uri, { dialogTitle: "Share your Look Score!" });
    } catch {}
  };

  const verdict = scores ? getVerdict(scores.overall) : null;
  const overallColor = scores ? scoreColor(scores.overall) : "#fff";

  return (
    <LinearGradient colors={["#ABBFF2", "#8BAEE8", "#BCCFFA"]} style={styles.container}>
      {/* Webcam modal */}
      <Modal visible={showWebCam} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="front" />
          <View style={styles.webcamControls}>
            <Pressable style={[styles.webcamBtn, { backgroundColor: "#333" }]} onPress={() => setShowWebCam(false)}>
              <Text style={styles.webcamBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.webcamBtn, { backgroundColor: CARD_PINK }]} onPress={captureWebcamPhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.webcamBtnText}>Capture</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={async () => { await playButtonSound(); navigation.goBack(); }}
        >
          <Ionicons name="chevron-back" size={26} color={CARD_PINK} />
        </Pressable>
        <Text style={styles.headerTitle}>Lookmaxing</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 44 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════════════════════ UPLOAD PHASE ══════════════════════════════ */}
        {phase === "upload" && (
          <View style={styles.uploadPhase}>
            {/* Hero icon */}
            <LinearGradient
              colors={["#FF8C42", "#FF4500"]}
              style={styles.heroIconBox}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="face-man-shimmer" size={54} color="#fff" />
            </LinearGradient>

            <Text style={styles.heroTitle}>Get Your Look Score</Text>
            <Text style={styles.heroSub}>
              AI analyzes 6 attractiveness metrics and gives you an honest score out of 10
            </Text>

            {/* Camera frame placeholder */}
            <View style={styles.framePlaceholder}>
              <View style={styles.frameCornerTL} />
              <View style={styles.frameCornerTR} />
              <View style={styles.frameCornerBL} />
              <View style={styles.frameCornerBR} />
              <Ionicons name="camera-outline" size={52} color="rgba(248,107,109,0.35)" />
              <Text style={styles.framePlaceholderText}>Your photo goes here</Text>
            </View>

            {/* Info pills */}
            <View style={styles.pillRow}>
              {["🔒 Private", "📴 Offline", "⚡ Instant"].map((t) => (
                <View key={t} style={styles.pill}>
                  <Text style={styles.pillText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Upload button */}
            <Pressable
              style={styles.uploadBtnWrap}
              onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}
            >
              <LinearGradient
                colors={["#FF8C42", "#F2226B"]}
                style={styles.uploadBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="image" size={22} color="#fff" />
                <Text style={styles.uploadBtnText}>Upload Photo</Text>
              </LinearGradient>
            </Pressable>

            {/* Selfie button */}
            <Pressable
              style={styles.selfieBtn}
              onPress={async () => { await playButtonSound(); handleTakeSelfie(); }}
            >
              <Ionicons name="camera" size={20} color={CARD_PINK} />
              <Text style={styles.selfieBtnText}>Take a Selfie</Text>
            </Pressable>
          </View>
        )}

        {/* ══════════════════════════════ LOADING PHASE ══════════════════════════════ */}
        {phase === "loading" && (
          <View style={styles.loadingPhase}>
            {photoUri && (
              <Animated.View style={[styles.loadingPhotoWrap, { transform: [{ scale: pulseAnim }] }]}>
                <Image source={{ uri: photoUri }} style={styles.loadingPhoto} />
                <LinearGradient
                  colors={["transparent", "rgba(248,107,109,0.75)"]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.loadingSpinWrap}>
                  <Ionicons name="scan" size={32} color="rgba(255,255,255,0.8)" />
                </View>
              </Animated.View>
            )}

            <View style={styles.loadingCard}>
              <Text style={styles.loadingCardTitle}>🧠 AI Analyzing...</Text>
              {LOADING_STAGES.map((s, i) => (
                <View key={s} style={styles.stageRow}>
                  <View style={[
                    styles.stageDot,
                    i < loadingStage && { backgroundColor: "#4CAF50" },
                    i === loadingStage && { backgroundColor: CARD_PINK },
                  ]} />
                  <Text style={[
                    styles.stageText,
                    i === loadingStage && { color: "#1a1a1a", fontWeight: "800" },
                    i < loadingStage && { color: "#4CAF50", textDecorationLine: "line-through" as const },
                  ]}>{s}</Text>
                  {i < loadingStage && <Ionicons name="checkmark-circle" size={15} color="#4CAF50" style={{ marginLeft: "auto" }} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════════════════════════ RESULT PHASE ══════════════════════════════ */}
        {phase === "result" && scores && verdict && (
          <View style={styles.resultPhase}>

            {/* ── SCORE HERO CARD ── */}
            <View style={[styles.scoreHeroCard, { shadowColor: overallColor }]}>
              {/* Photo */}
              {photoUri && (
                <Image source={{ uri: photoUri }} style={styles.heroPhoto} />
              )}
              {/* Dark gradient over photo */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.82)"]}
                style={styles.heroPhotoOverlay}
              />

              {/* Score ring + number */}
              <View style={[styles.scoreRingOuter, { borderColor: overallColor + "60", shadowColor: overallColor }]}>
                <View style={[styles.scoreRingInner, { borderColor: overallColor }]}>
                  <Text style={[styles.scoreNumber, { color: overallColor }]}>{scores.overall}</Text>
                  <Text style={styles.scoreOutOf}>/10</Text>
                </View>
              </View>

              {/* Verdict info at bottom of photo */}
              <View style={styles.heroBottom}>
                <View style={[styles.verdictBadge, { backgroundColor: overallColor }]}>
                  <Text style={styles.verdictBadgeText}>{verdict.emoji} {verdict.label}</Text>
                </View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= Math.round(scores.overall / 2) ? "star" : "star-outline"}
                      size={20}
                      color={i <= Math.round(scores.overall / 2) ? overallColor : "rgba(255,255,255,0.35)"}
                    />
                  ))}
                </View>
                <Text style={styles.verdictSub}>{verdict.sub}</Text>
              </View>
            </View>

            {/* ── BREAKDOWN CARD (shareable) ── */}
            <View ref={shareRef} collapsable={false} style={styles.breakdownWrap}>
              <LinearGradient
                colors={["#FF7A26", "#E8115A", "#B5007A"]}
                start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
                style={styles.breakdownCard}
              >
                {/* Header row */}
                <View style={styles.breakdownHeaderRow}>
                  <Text style={styles.breakdownTitle}>Look Breakdown</Text>
                  <View style={styles.breakdownOverallBadge}>
                    <Text style={[styles.breakdownOverallNum, { color: overallColor }]}>{scores.overall}</Text>
                    <Text style={styles.breakdownOverallSlash}>/10</Text>
                  </View>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.metricsList}>
                  <MetricBar emoji="💪" label="Masculinity" score={scores.masculinity} />
                  <MetricBar emoji="🧔" label="Cheek Bones" score={scores.cheekBones} />
                  <MetricBar emoji="👄" label="Jawline"     score={scores.jawline} />
                  <MetricBar emoji="👀" label="Eyes"        score={scores.eyes} />
                  <MetricBar emoji="💇" label="Hair"        score={scores.hair} />
                  <MetricBar emoji="💆" label="Skin"        score={scores.skin} />
                </View>
              </LinearGradient>
            </View>

            {/* ── LOOKMAXING TIP ── */}
            <View style={[styles.tipCard, { borderLeftColor: glowTip.color }]}>
              <View style={styles.tipRow}>
                <View style={[styles.tipIconCircle, { backgroundColor: glowTip.color + "22" }]}>
                  <Text style={{ fontSize: 26 }}>{glowTip.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={[styles.tipImpactBadge, { backgroundColor: glowTip.color }]}>
                    <Text style={styles.tipImpactText}>{glowTip.impact}</Text>
                  </View>
                  <Text style={styles.tipTitle}>{glowTip.title}</Text>
                </View>
              </View>
              <Text style={styles.tipDesc}>{glowTip.desc}</Text>
              <Pressable
                onPress={async () => { await playButtonSound(); navigation.navigate("LookmaxingTips"); }}
              >
                <Text style={[styles.tipSeeAll, { color: glowTip.color }]}>See all 200 tips →</Text>
              </Pressable>
            </View>

            {/* ── SHARE ── */}
            <View style={styles.shareSection}>
              <Text style={styles.shareLabel}>SHARE YOUR SCORE</Text>
              <View style={styles.shareRow}>
                <Pressable style={[styles.shareCircle, { backgroundColor: "#25D366" }]}
                  onPress={async () => { await playButtonSound(); handleShare(); }}>
                  <Ionicons name="chatbubble" size={26} color="#fff" />
                </Pressable>
                <Pressable onPress={async () => { await playButtonSound(); handleShare(); }}>
                  <LinearGradient
                    colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]}
                    style={styles.shareCircle}
                  >
                    <Ionicons name="logo-instagram" size={28} color="#fff" />
                  </LinearGradient>
                </Pressable>
                <Pressable style={[styles.shareCircle, { backgroundColor: "#FFFC00" }]}
                  onPress={async () => { await playButtonSound(); handleShare(); }}>
                  <FontAwesome name="snapchat-ghost" size={26} color="#000" />
                </Pressable>
              </View>
            </View>

            {/* ── TRY ANOTHER ── */}
            <Pressable
              style={styles.tryAnotherWrap}
              onPress={async () => {
                await playButtonSound();
                setPhotoUri(null); setScores(null); setPhase("upload");
              }}
            >
              <LinearGradient
                colors={["#FF8C42", "#F2226B"]}
                style={styles.tryAnotherGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.tryAnotherText}>Try Another Photo</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.uploadLink}
              onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}
            >
              <Ionicons name="image-outline" size={15} color="rgba(0,0,0,0.38)" />
              <Text style={styles.uploadLinkText}>Upload from gallery instead</Text>
            </Pressable>

          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "LilitaOne-Regular",
    color: CARD_PINK,
    letterSpacing: 0.4,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    alignItems: "center",
  },

  /* ── Upload ── */
  uploadPhase: { width: "100%", alignItems: "center", gap: 20, paddingTop: 6 },

  heroIconBox: {
    width: 96, height: 96, borderRadius: 30,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#FF4500", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  heroTitle: {
    fontSize: 30, fontFamily: "LilitaOne-Regular",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 15, color: "rgba(0,0,0,0.5)",
    textAlign: "center", lineHeight: 22, fontWeight: "600",
    maxWidth: 300,
  },

  framePlaceholder: {
    width: CARD_W, height: CARD_W * 0.78,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 2,
    borderColor: "rgba(248,107,109,0.25)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  frameCornerTL: { position: "absolute", top: 12, left: 12, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: CARD_PINK, borderRadius: 4 },
  frameCornerTR: { position: "absolute", top: 12, right: 12, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: CARD_PINK, borderRadius: 4 },
  frameCornerBL: { position: "absolute", bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: CARD_PINK, borderRadius: 4 },
  frameCornerBR: { position: "absolute", bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: CARD_PINK, borderRadius: 4 },
  framePlaceholderText: { color: "rgba(248,107,109,0.45)", fontWeight: "700", fontSize: 14 },

  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.9)",
  },
  pillText: { color: "#444", fontSize: 13, fontWeight: "700" },

  uploadBtnWrap: {
    width: "100%", maxWidth: 340,
    borderRadius: 22, overflow: "hidden",
    shadowColor: SHADOW_PINK, shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 7,
  },
  uploadBtnGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 18,
  },
  uploadBtnText: { color: "#fff", fontSize: 20, fontWeight: "800" },

  selfieBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 9, paddingVertical: 15,
    width: "100%", maxWidth: 340,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 2, borderColor: CARD_PINK + "55",
  },
  selfieBtnText: { color: CARD_PINK, fontSize: 18, fontWeight: "800" },

  /* ── Loading ── */
  loadingPhase: { width: "100%", alignItems: "center", gap: 22, paddingTop: 8 },
  loadingPhotoWrap: {
    width: 170, height: 170, borderRadius: 28, overflow: "hidden",
    shadowColor: SHADOW_PINK, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  loadingPhoto: { width: "100%", height: "100%" },
  loadingSpinWrap: { position: "absolute", bottom: 14, alignSelf: "center" },
  loadingCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 24, padding: 22, gap: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
  },
  loadingCardTitle: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", textAlign: "center" },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stageDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: "rgba(0,0,0,0.12)" },
  stageText: { fontSize: 14, color: "rgba(0,0,0,0.35)", fontWeight: "600", flex: 1 },

  /* ── Result ── */
  resultPhase: { width: "100%", alignItems: "center", gap: 14, paddingTop: 4 },

  /* Score hero card */
  scoreHeroCard: {
    width: "100%", borderRadius: 28, overflow: "hidden",
    position: "relative",
    backgroundColor: "#1a1a2e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  heroPhoto: {
    width: "100%", height: 280, resizeMode: "cover",
  },
  heroPhotoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
  },

  /* Circular score ring */
  scoreRingOuter: {
    position: "absolute",
    top: 16, right: 16,
    width: 84, height: 84,
    borderRadius: 42,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 10,
  },
  scoreRingInner: {
    width: 70, height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: "center", alignItems: "center",
    flexDirection: "row",
  },
  scoreNumber: {
    fontSize: 32, fontWeight: "900", lineHeight: 36,
  },
  scoreOutOf: {
    fontSize: 14, color: "rgba(255,255,255,0.6)",
    fontWeight: "700", marginBottom: 2, alignSelf: "flex-end",
  },

  /* Verdict section inside hero card */
  heroBottom: {
    paddingHorizontal: 18, paddingBottom: 20, paddingTop: 0,
    gap: 8, position: "absolute",
    bottom: 0, left: 0, right: 0,
  },
  verdictBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 12,
  },
  verdictBadgeText: { color: "#000", fontWeight: "800", fontSize: 14 },
  starsRow: { flexDirection: "row", gap: 3 },
  verdictSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13, fontWeight: "600", lineHeight: 18,
  },

  /* Breakdown card */
  breakdownWrap: {
    width: "100%", borderRadius: 26, overflow: "hidden",
    shadowColor: "#E8115A", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  breakdownCard: { padding: 22, paddingTop: 20, paddingBottom: 24 },
  breakdownHeaderRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
  },
  breakdownTitle: {
    color: "rgba(255,255,255,0.95)", fontSize: 16,
    fontWeight: "900", letterSpacing: 0.5,
  },
  breakdownOverallBadge: {
    flexDirection: "row", alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  breakdownOverallNum: { fontSize: 22, fontWeight: "900", lineHeight: 26 },
  breakdownOverallSlash: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700", marginBottom: 1 },
  breakdownDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 16 },
  metricsList: { gap: 15 },

  /* Tip card */
  tipCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 22, padding: 16,
    borderLeftWidth: 5, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.9)",
  },
  tipRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipIconCircle: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  tipImpactBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 8,
  },
  tipImpactText: { color: "#fff", fontSize: 10, fontWeight: "900", letterSpacing: 0.3 },
  tipTitle: { color: "#1a1a1a", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  tipDesc: { color: "rgba(0,0,0,0.5)", fontSize: 13, lineHeight: 20 },
  tipSeeAll: { alignSelf: "flex-end", fontSize: 13, fontWeight: "800" },

  /* Share */
  shareSection: { width: "100%", alignItems: "center", gap: 12 },
  shareLabel: {
    color: "rgba(0,0,0,0.3)", fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
  },
  shareRow: { flexDirection: "row", gap: 18, justifyContent: "center" },
  shareCircle: {
    width: 62, height: 62, borderRadius: 31,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, shadowRadius: 7, elevation: 6,
  },

  /* Try Another */
  tryAnotherWrap: {
    width: "100%", borderRadius: 22, overflow: "hidden",
    shadowColor: SHADOW_PINK, shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 7,
  },
  tryAnotherGrad: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, paddingVertical: 18,
  },
  tryAnotherText: { color: "#fff", fontSize: 19, fontWeight: "800" },

  uploadLink: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8,
  },
  uploadLinkText: { color: "rgba(0,0,0,0.38)", fontSize: 13, fontWeight: "600" },

  /* Webcam */
  webcamControls: {
    flexDirection: "row", justifyContent: "space-between",
    padding: 24, paddingBottom: 44, backgroundColor: "#000",
  },
  webcamBtn: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 30, gap: 8,
  },
  webcamBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
