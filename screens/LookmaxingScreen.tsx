import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, Pressable, Image, Modal, Platform,
  Alert, ScrollView, Animated, Dimensions, ActivityIndicator,
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
const CW = Math.min(SW - 32, 420);
const CARD_PINK  = "#F86B6D";

/* ── Palette ── */
const BG   = "#08090F";
const CARD = "#13141F";
const CARD2= "#181926";
const BORD = "rgba(255,255,255,0.07)";
const GREEN= "#00FF88";
const LIME = "#A4FF00";
const GOLD = "#FFD600";
const ORNG = "#FF6D00";
const PINK2= "#FF4081";
const PUR  = "#7B2FBE";

/* ── Interfaces ── */
interface Scores {
  overall: number; potential: number; jawline: number;
  cheekBones: number; eyes: number; masculinity: number;
}

interface FaceData {
  canthalTilt: string; eyeShape: string; eyeType: string;
  faceShape: string; jawWidth: string; noseShape: string;
}

/* ── Static data ── */
const LOADING_STAGES = [
  "Scanning face geometry...", "Measuring bone proportions...",
  "Analyzing skin quality...", "Computing symmetry index...",
  "Generating your verdict...",
];

const CANTHAL  = ["Positive", "Neutral", "Slightly Positive", "Negative"];
const EYE_SHP  = ["Almond Eyes", "Round Eyes", "Hooded Eyes", "Deep-Set", "Upturned"];
const EYE_TYP  = ["Hunter Eyes", "Prey Eyes", "Neutral"];
const FACE_SHP = ["Oval", "Heart", "Diamond", "Square", "Oblong", "Triangle"];
const JAW_WID  = ["Wide & Angular", "Medium", "Narrow", "Strong"];
const NOSE_SHP = ["Roman Nose", "Aquiline Nose", "Snub Nose", "Hawk Nose", "Greek Nose"];

const RECOS = [
  { icon: "💈", title: "Optimize your haircut", desc: "A properly styled cut adds 0.5–1 point to your facial harmony score.", color: "#FF6B35" },
  { icon: "💧", title: "Start a skincare routine", desc: "Cleanser + SPF daily. Skin quality is the highest-weighted metric.", color: "#00CFA8" },
  { icon: "🏋️", title: "Build facial muscle mass", desc: "Bulking phases define your jaw and cheekbones from the inside.", color: "#FF1744" },
  { icon: "🧍", title: "Fix your posture now", desc: "Mewing + forward posture reshapes your lower third over time.", color: "#FF9800" },
  { icon: "😁", title: "Whiten your teeth", desc: "Tooth color and alignment are major subconscious attraction triggers.", color: "#7C4DFF" },
  { icon: "🌞", title: "SPF every morning", desc: "Prevents UV-induced aging — the single most impactful anti-aging move.", color: "#29B6F6" },
];

/* ── Helpers ── */
const rnd = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function gen100(): number {
  const r = Math.random();
  if (r < 0.02) return 90 + Math.floor(Math.random() * 10);
  if (r < 0.12) return 80 + Math.floor(Math.random() * 10);
  if (r < 0.35) return 70 + Math.floor(Math.random() * 10);
  if (r < 0.65) return 60 + Math.floor(Math.random() * 10);
  if (r < 0.88) return 50 + Math.floor(Math.random() * 10);
  return 40 + Math.floor(Math.random() * 10);
}

function getTier(s: number): { label: string; color: string } {
  if (s >= 90) return { label: "Chad",              color: GREEN };
  if (s >= 80) return { label: "Chadlite",          color: LIME  };
  if (s >= 70) return { label: "High-Tier Normie",  color: GOLD  };
  if (s >= 60) return { label: "Normie",            color: ORNG  };
  return            { label: "Below Average",       color: PINK2 };
}

function barColor(s: number): string {
  if (s >= 80) return GREEN;
  if (s >= 70) return LIME;
  if (s >= 60) return GOLD;
  if (s >= 50) return ORNG;
  return PINK2;
}

function haptic() {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/* ═══════════════ ANIMATED METRIC CARD ═══════════════ */
function MetricCard({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const tier = getTier(score);
  const bc   = barColor(score);

  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 900, delay, useNativeDriver: false }).start();
  }, [score]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={mc.card}>
      <Text style={[mc.label, { color: bc }]}>{label.toUpperCase()}</Text>
      <Text style={mc.score}>{score}</Text>
      <View style={mc.tierRow}>
        <View style={[mc.dot, { backgroundColor: bc }]} />
        <Text style={[mc.tierTxt, { color: "rgba(255,255,255,0.5)" }]}>{tier.label}</Text>
      </View>
      <View style={mc.barTrack}>
        <Animated.View style={[mc.barFill, { width, backgroundColor: bc, shadowColor: bc }]} />
      </View>
    </View>
  );
}
const mc = StyleSheet.create({
  card: {
    width: (CW - 12) / 2, backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORD,
    padding: 16, gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 2 },
  score: { fontSize: 48, fontWeight: "900", color: "#fff", lineHeight: 52 },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tierTxt: { fontSize: 11, fontWeight: "600" },
  barTrack: { height: 5, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginTop: 4 },
  barFill: { height: "100%", borderRadius: 3, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6, elevation: 2 },
});

/* ═══════════════ ANALYSIS ROW ═══════════════ */
function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={ar.row}>
      <Text style={ar.label}>{label}</Text>
      <Text style={ar.value}>{value}</Text>
    </View>
  );
}
const ar = StyleSheet.create({
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: CARD, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18,
    borderWidth: 1, borderColor: BORD,
  },
  label: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
  value: { color: "#fff", fontSize: 14, fontWeight: "800" },
});

/* ═══════════════ RECOMMENDATION CARD ═══════════════ */
function RecoCard({ num, icon, title, desc, color }: { num: number; icon: string; title: string; desc: string; color: string }) {
  return (
    <View style={rc.card}>
      <View style={[rc.numBadge, { backgroundColor: color }]}>
        <Text style={rc.numTxt}>{num}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={rc.title}>{icon}  {title}</Text>
        <Text style={rc.desc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.25)" />
    </View>
  );
}
const rc = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1, borderColor: BORD,
    paddingVertical: 16, paddingHorizontal: 16,
  },
  numBadge: {
    width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  numTxt: { color: "#fff", fontSize: 15, fontWeight: "900" },
  title: { color: "#fff", fontSize: 14, fontWeight: "800" },
  desc: { color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 17, fontWeight: "500" },
});

/* ═══════════════ SHAREABLE CARD (no transparency) ═══════════════ */
function ShareCard({ photoUri, scores }: { photoUri: string | null; scores: Scores }) {
  const overall = getTier(scores.overall);
  const metrics = [
    { label: "OVERALL",     score: scores.overall     },
    { label: "POTENTIAL",   score: scores.potential   },
    { label: "JAWLINE",     score: scores.jawline     },
    { label: "CHEEKBONES",  score: scores.cheekBones  },
    { label: "EYES",        score: scores.eyes        },
    { label: "MASCULINITY", score: scores.masculinity },
  ];
  return (
    <LinearGradient colors={["#0A0A14", "#0F0F22", "#0A0A14"]} style={scard.wrap}>
      {/* Brand */}
      <View style={scard.brandRow}>
        <Text style={scard.brandFire}>🔥</Text>
        <Text style={scard.brandName}>Rizz AI · Look Score</Text>
      </View>
      {/* Photo + score */}
      <View style={scard.photoRow}>
        <View style={[scard.photoRing, { borderColor: overall.color }]}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={scard.photo} />
            : <View style={[scard.photo, { backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" }]}><Text style={{ fontSize: 36 }}>👤</Text></View>}
        </View>
        <View style={scard.overallCol}>
          <Text style={scard.overallNum}>{scores.overall}</Text>
          <Text style={scard.outOf}>/100</Text>
          <View style={[scard.tierBadge, { backgroundColor: overall.color + "25", borderColor: overall.color }]}>
            <Text style={[scard.tierBadgeTxt, { color: overall.color }]}>{overall.label}</Text>
          </View>
        </View>
      </View>
      {/* Grid */}
      <View style={scard.grid}>
        {metrics.map((m) => {
          const bc2 = barColor(m.score);
          return (
            <View key={m.label} style={scard.gridCard}>
              <Text style={[scard.gridLabel, { color: bc2 }]}>{m.label}</Text>
              <Text style={scard.gridScore}>{m.score}</Text>
              <View style={scard.gridTrack}>
                <View style={[scard.gridFill, { width: `${m.score}%` as any, backgroundColor: bc2 }]} />
              </View>
            </View>
          );
        })}
      </View>
      {/* Watermark */}
      <Text style={scard.wm}>get yours free · rizz-ai.app</Text>
    </LinearGradient>
  );
}
const scard = StyleSheet.create({
  wrap: { borderRadius: 20, padding: 18, gap: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandFire: { fontSize: 18 },
  brandName: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  photoRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, overflow: "hidden", flexShrink: 0 },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  overallCol: { flex: 1, alignItems: "flex-start", gap: 6 },
  overallNum: { fontSize: 52, fontWeight: "900", color: "#fff", lineHeight: 54 },
  outOf: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "700", marginTop: -8 },
  tierBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  tierBadgeTxt: { fontSize: 12, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridCard: { width: "47%", backgroundColor: "#1C1D2E", borderRadius: 12, padding: 12, gap: 4 },
  gridLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  gridScore: { fontSize: 28, fontWeight: "900", color: "#fff", lineHeight: 32 },
  gridTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" },
  gridFill: { height: "100%", borderRadius: 2 },
  wm: { color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: "600", letterSpacing: 0.5, textAlign: "center" },
});

/* ═══════════════ MAIN SCREEN ═══════════════ */
export default function LookmaxingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [photoUri,    setPhotoUri]    = useState<string | null>(null);
  const [phase,       setPhase]       = useState<"upload"|"loading"|"result">("upload");
  const [loadStage,   setLoadStage]   = useState(0);
  const [scores,      setScores]      = useState<Scores | null>(null);
  const [faceData,    setFaceData]    = useState<FaceData | null>(null);
  const [recos,       setRecos]       = useState(RECOS.slice(0, 4));
  const [sharing,     setSharing]     = useState(false);
  const [showWebCam,  setShowWebCam]  = useState(false);
  const [permission,  reqPermission]  = useCameraPermissions();

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const shareRef   = useRef<View>(null);
  const cameraRef  = useRef<CameraView>(null);

  /* Pulse while loading */
  useEffect(() => {
    if (phase !== "loading") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 600, useNativeDriver: true }),
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
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [phase]);

  const runAnalysis = async () => {
    setPhase("loading");
    setScores(null);
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      setLoadStage(i);
      await new Promise((r) => setTimeout(r, 500));
    }
    haptic();
    const overall = gen100();
    setScores({
      overall,
      potential:   Math.min(100, overall + 5 + Math.floor(Math.random() * 12)),
      jawline:     gen100(),
      cheekBones:  gen100(),
      eyes:        gen100(),
      masculinity: gen100(),
    });
    setFaceData({
      canthalTilt: rnd(CANTHAL),
      eyeShape:    rnd(EYE_SHP),
      eyeType:     rnd(EYE_TYP),
      faceShape:   rnd(FACE_SHP),
      jawWidth:    rnd(JAW_WID),
      noseShape:   rnd(NOSE_SHP),
    });
    const shuffled = [...RECOS].sort(() => Math.random() - 0.5);
    setRecos(shuffled.slice(0, 4));
    setPhase("result");
  };

  const handleUploadPhoto = async () => {
    try {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) { if (Platform.OS !== "web") Alert.alert("Permission Required", "Allow photo library access."); return; }
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] as any, allowsEditing: true, aspect: [1,1], quality: 0.9 });
      if (r.assets?.[0]) { setPhotoUri(r.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const handleTakeSelfie = async () => {
    if (Platform.OS === "web") {
      if (!permission?.granted) {
        const r = await reqPermission();
        if (!r.granted) { Alert.alert("Permission Required", "Allow camera access."); return; }
      }
      setShowWebCam(true);
      return;
    }
    try {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert("Permission Required", "Allow camera access."); return; }
      const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"] as any, allowsEditing: true, aspect: [1,1], quality: 0.9, cameraType: ImagePicker.CameraType.front });
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

  const handleShare = async () => {
    if (!shareRef.current || sharing) return;
    try {
      setSharing(true);
      await playButtonSound();
      await new Promise((r) => setTimeout(r, 120));
      const uri = await captureRef(shareRef, { format: "png", quality: 1 });

      if (Platform.OS === "web") {
        try {
          const blob = await (await fetch(uri)).blob();
          const file = new File([blob], "rizz-ai-score.png", { type: "image/png" });
          if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
            await (navigator as any).share({ files: [file], title: "My Rizz AI Look Score" });
          } else {
            const a = document.createElement("a");
            a.href = uri; a.download = "rizz-ai-score.png"; a.click();
          }
        } catch {}
      } else {
        const ok = await Sharing.isAvailableAsync();
        if (ok) await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Look Score" });
      }
    } catch (e) { console.log("Share error:", e); }
    finally { setSharing(false); }
  };

  const handleReset = () => { setPhotoUri(null); setScores(null); setFaceData(null); setPhase("upload"); };

  const tier = scores ? getTier(scores.overall) : null;

  return (
    <View style={s.root}>
      {/* Subtle purple glow at top */}
      <LinearGradient
        colors={["rgba(123,47,190,0.35)", "transparent"]}
        style={s.topGlow}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />

      {/* Webcam modal */}
      <Modal visible={showWebCam} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="front" />
          <View style={s.camRow}>
            <Pressable style={[s.camBtn, { backgroundColor: "#333" }]} onPress={() => setShowWebCam(false)}>
              <Text style={s.camBtnTxt}>Cancel</Text>
            </Pressable>
            <Pressable style={[s.camBtn, { backgroundColor: PUR }]} onPress={captureWebcam}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={s.camBtnTxt}>Capture</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={s.backBtn} onPress={async () => { await playButtonSound(); navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>Look Score</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════════════════ UPLOAD ══════════════════════════ */}
        {phase === "upload" && (
          <View style={s.uploadWrap}>
            {/* Purple glow icon */}
            <View style={s.heroIconWrap}>
              <LinearGradient colors={[PUR, "#5B0EBF"]} style={s.heroIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name="face-man-shimmer" size={56} color="#fff" />
              </LinearGradient>
              <View style={s.heroIconGlow} />
            </View>

            <Text style={s.uploadTitle}>Get Your Ratings</Text>
            <Text style={s.uploadSub}>AI analyzes 6 facial metrics and gives you an honest attractiveness score</Text>

            {/* Camera frame */}
            <View style={s.frameBox}>
              <View style={[s.corner, s.cTL]} /><View style={[s.corner, s.cTR]} />
              <View style={[s.corner, s.cBL]} /><View style={[s.corner, s.cBR]} />
              <MaterialCommunityIcons name="face-recognition" size={64} color="rgba(123,47,190,0.35)" />
              <Text style={s.frameTxt}>Position your face here</Text>
            </View>

            {/* Stats row */}
            <View style={s.statsRow}>
              {[["6", "Metrics"], ["100", "Max Score"], ["0%", "Data Sent"]].map(([v, l]) => (
                <View key={l} style={s.statBox}>
                  <Text style={s.statVal}>{v}</Text>
                  <Text style={s.statLbl}>{l}</Text>
                </View>
              ))}
            </View>

            {/* Buttons */}
            <Pressable style={s.primaryBtn} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
              <LinearGradient colors={[PUR, "#5B0EBF"]} style={s.primaryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="image" size={22} color="#fff" />
                <Text style={s.primaryBtnTxt}>Upload Photo</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={s.secondaryBtn} onPress={async () => { await playButtonSound(); handleTakeSelfie(); }}>
              <Ionicons name="camera" size={20} color={GREEN} />
              <Text style={[s.secondaryBtnTxt, { color: GREEN }]}>Take a Selfie</Text>
            </Pressable>
          </View>
        )}

        {/* ══════════════════════════ LOADING ══════════════════════════ */}
        {phase === "loading" && (
          <View style={s.loadWrap}>
            {photoUri && (
              <Animated.View style={[s.loadPhotoRing, { transform: [{ scale: pulseAnim }] }]}>
                <Image source={{ uri: photoUri }} style={s.loadPhoto} />
                <View style={s.loadPhotoOverlay}>
                  <Ionicons name="scan" size={40} color="rgba(123,47,190,0.8)" />
                </View>
              </Animated.View>
            )}

            <View style={s.loadCard}>
              <Text style={s.loadCardTitle}>Analyzing your face...</Text>
              <View style={s.loadCardDivider} />
              {LOADING_STAGES.map((stage, i) => (
                <View key={stage} style={s.stageRow}>
                  <View style={[s.stageDot,
                    i < loadStage && { backgroundColor: GREEN },
                    i === loadStage && { backgroundColor: PUR }
                  ]} />
                  <Text style={[s.stageTxt,
                    i === loadStage && { color: "#fff", fontWeight: "700" },
                    i < loadStage && { color: GREEN, textDecorationLine: "line-through" as const },
                  ]}>{stage}</Text>
                  {i < loadStage && <Ionicons name="checkmark-circle" size={16} color={GREEN} style={{ marginLeft: "auto" }} />}
                  {i === loadStage && <ActivityIndicator size={14} color={PUR} style={{ marginLeft: "auto" }} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════════════════════ RESULT ══════════════════════════ */}
        {phase === "result" && scores && faceData && tier && (
          <Animated.View style={[s.resultWrap, { opacity: fadeAnim }]}>

            {/* ── HERO: Photo + Overall ── */}
            <View style={s.heroSection}>
              {/* Photo in glowing ring */}
              <View style={s.photoRingOuter}>
                <View style={[s.photoRingInner, { borderColor: tier.color }]}>
                  {photoUri
                    ? <Image source={{ uri: photoUri }} style={s.heroPhoto} />
                    : <View style={[s.heroPhoto, { backgroundColor: CARD2, justifyContent: "center", alignItems: "center" }]}>
                        <Text style={{ fontSize: 52 }}>👤</Text>
                      </View>
                  }
                </View>
                {/* Glow ring behind */}
                <View style={[s.photoGlowRing, { shadowColor: tier.color, borderColor: tier.color + "30" }]} />
              </View>

              {/* Overall score below photo */}
              <View style={s.heroScoreRow}>
                <Text style={s.heroScoreNum}>{scores.overall}</Text>
                <View style={{ justifyContent: "flex-end", marginBottom: 8 }}>
                  <Text style={s.heroScoreLabel}>/100</Text>
                </View>
              </View>
              <View style={[s.tierPill, { backgroundColor: tier.color + "22", borderColor: tier.color }]}>
                <View style={[s.tierDot, { backgroundColor: tier.color }]} />
                <Text style={[s.tierLabel, { color: tier.color }]}>{tier.label}</Text>
              </View>
            </View>

            {/* ── SECTION HEADER: Your Ratings ── */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>YOUR RATINGS</Text>
              <Text style={s.sectionSub}>tap to share with friends</Text>
            </View>

            {/* ── 2×3 METRIC CARD GRID ── */}
            <View style={s.grid}>
              {[
                { label: "Overall",     score: scores.overall,     delay: 0   },
                { label: "Potential",   score: scores.potential,   delay: 80  },
                { label: "Jawline",     score: scores.jawline,     delay: 160 },
                { label: "Cheekbones", score: scores.cheekBones,  delay: 240 },
                { label: "Eyes",        score: scores.eyes,        delay: 320 },
                { label: "Masculinity", score: scores.masculinity, delay: 400 },
              ].map((m) => <MetricCard key={m.label} {...m} />)}
            </View>

            {/* ── SECTION HEADER: Your Analysis ── */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>YOUR ANALYSIS</Text>
              <Text style={s.sectionSub}>facial structure breakdown</Text>
            </View>

            {/* ── FACE ANALYSIS ── */}
            <View style={s.analysisList}>
              <AnalysisRow label="Canthal Tilt"       value={faceData.canthalTilt} />
              <AnalysisRow label="Eye Shape"          value={faceData.eyeShape}    />
              <AnalysisRow label="Eye Type"           value={faceData.eyeType}     />
              <AnalysisRow label="Face Shape"         value={faceData.faceShape}   />
              <AnalysisRow label="Jaw Width"          value={faceData.jawWidth}    />
              <AnalysisRow label="Nose Shape"         value={faceData.noseShape}   />
            </View>

            {/* ── SECTION HEADER: Your Recommendations ── */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>YOUR RECOMMENDATIONS</Text>
              <Text style={s.sectionSub}>personalized for your ratings</Text>
            </View>

            {/* ── RECOMMENDATIONS ── */}
            <View style={s.recoList}>
              {recos.map((r, i) => (
                <RecoCard key={r.title} num={i + 1} icon={r.icon} title={r.title} desc={r.desc} color={r.color} />
              ))}
            </View>

            <Pressable
              style={s.tipsBtn}
              onPress={async () => { await playButtonSound(); navigation.navigate("LookmaxingTips"); }}
            >
              <Text style={s.tipsBtnTxt}>See All 200 Tips →</Text>
            </Pressable>

            {/* ── SHAREABLE CARD ── */}
            <View style={s.shareCardSection}>
              <View style={s.shareCardLabelRow}>
                <Ionicons name="share-social-outline" size={13} color="rgba(255,255,255,0.3)" />
                <Text style={s.shareCardLabel}>SHAREABLE CARD — WORKS OFFLINE</Text>
              </View>
              <View ref={shareRef} collapsable={false} style={s.shareCardOuter}>
                <ShareCard photoUri={photoUri} scores={scores} />
              </View>
            </View>

            {/* ── SHARE BUTTONS ── */}
            <View style={s.shareRow}>
              <Pressable style={[s.shareBtn, { backgroundColor: "#25D366", shadowColor: "#25D366" }]} onPress={handleShare} disabled={sharing}>
                {sharing ? <ActivityIndicator color="#fff" size="small" /> : (
                  <><Ionicons name="logo-whatsapp" size={22} color="#fff" /><Text style={s.shareBtnTxt}>WhatsApp</Text></>
                )}
              </Pressable>
              <Pressable style={[s.shareBtn, { padding: 0, overflow: "hidden", shadowColor: "#dc2743" }]} onPress={handleShare} disabled={sharing}>
                <LinearGradient colors={["#f09433","#e6683c","#dc2743","#cc2366","#bc1888"]} style={s.shareBtnGrad}>
                  {sharing ? <ActivityIndicator color="#fff" size="small" /> : (
                    <><Ionicons name="logo-instagram" size={22} color="#fff" /><Text style={s.shareBtnTxt}>Instagram</Text></>
                  )}
                </LinearGradient>
              </Pressable>
              <Pressable style={[s.shareBtn, { backgroundColor: "#FFFC00", shadowColor: "#FFFC00" }]} onPress={handleShare} disabled={sharing}>
                {sharing ? <ActivityIndicator color="#000" size="small" /> : (
                  <><FontAwesome name="snapchat-ghost" size={20} color="#000" /><Text style={[s.shareBtnTxt, { color: "#000" }]}>Snap</Text></>
                )}
              </Pressable>
            </View>

            {/* ── TRY ANOTHER ── */}
            <Pressable style={s.tryBtn} onPress={async () => { await playButtonSound(); handleReset(); }}>
              <LinearGradient colors={[PUR, "#5B0EBF"]} style={s.tryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={s.tryBtnTxt}>Try Another Photo</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={s.uploadLink} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
              <Ionicons name="image-outline" size={14} color="rgba(255,255,255,0.25)" />
              <Text style={s.uploadLinkTxt}>Upload from gallery instead</Text>
            </Pressable>

          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

/* ═══════════════ STYLES ═══════════════ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topGlow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 220, zIndex: 0,
  },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 6, zIndex: 10,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: BORD,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, alignItems: "center" },

  /* ── Upload ── */
  uploadWrap: { width: "100%", alignItems: "center", gap: 20, paddingTop: 10 },

  heroIconWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  heroIconBg: {
    width: 104, height: 104, borderRadius: 32,
    justifyContent: "center", alignItems: "center", zIndex: 2,
    shadowColor: PUR, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 14,
  },
  heroIconGlow: {
    position: "absolute", width: 130, height: 130, borderRadius: 65,
    backgroundColor: PUR, opacity: 0.15, zIndex: 1,
  },

  uploadTitle: { fontSize: 32, fontWeight: "900", color: "#fff", textAlign: "center", letterSpacing: 0.3 },
  uploadSub: { fontSize: 15, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 22, fontWeight: "500", maxWidth: 300 },

  frameBox: {
    width: CW, height: CW * 0.68,
    borderRadius: 22, backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1.5, borderColor: "rgba(123,47,190,0.3)",
    borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: 10, position: "relative",
  },
  corner: { position: "absolute", width: 22, height: 22 },
  cTL: { top: 12, left: 12,  borderTopWidth: 3, borderLeftWidth:  3, borderColor: PUR, borderTopLeftRadius:     6 },
  cTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderColor: PUR, borderTopRightRadius:    6 },
  cBL: { bottom: 12, left: 12,  borderBottomWidth: 3, borderLeftWidth:  3, borderColor: PUR, borderBottomLeftRadius:  6 },
  cBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderColor: PUR, borderBottomRightRadius: 6 },
  frameTxt: { color: "rgba(123,47,190,0.5)", fontWeight: "700", fontSize: 13 },

  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORD,
    alignItems: "center", paddingVertical: 14,
  },
  statVal: { fontSize: 22, fontWeight: "900", color: "#fff" },
  statLbl: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "600", marginTop: 2 },

  primaryBtn: {
    width: "100%", borderRadius: 18, overflow: "hidden",
    shadowColor: PUR, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 10,
  },
  primaryBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  primaryBtnTxt: { color: "#fff", fontSize: 19, fontWeight: "800" },

  secondaryBtn: {
    width: "100%", borderRadius: 18, borderWidth: 1.5, borderColor: GREEN + "55",
    backgroundColor: GREEN + "0F",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingVertical: 15,
  },
  secondaryBtnTxt: { fontSize: 17, fontWeight: "800" },

  /* ── Loading ── */
  loadWrap: { width: "100%", alignItems: "center", gap: 24, paddingTop: 10 },
  loadPhotoRing: {
    width: 180, height: 180, borderRadius: 90, overflow: "hidden",
    borderWidth: 3, borderColor: PUR + "80",
    shadowColor: PUR, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 14,
  },
  loadPhoto: { width: "100%", height: "100%" },
  loadPhotoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 70,
    justifyContent: "flex-end", alignItems: "center", paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  loadCard: {
    width: "100%", backgroundColor: CARD2, borderRadius: 22, padding: 22, gap: 12,
    borderWidth: 1, borderColor: BORD,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  loadCardTitle: { fontSize: 17, fontWeight: "800", color: "#fff", textAlign: "center" },
  loadCardDivider: { height: 1, backgroundColor: BORD, marginBottom: 2 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)" },
  stageTxt: { fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: "600", flex: 1 },

  /* ── Result ── */
  resultWrap: { width: "100%", alignItems: "center", gap: 14, paddingTop: 4 },

  /* Hero */
  heroSection: { width: "100%", alignItems: "center", gap: 12, paddingVertical: 10 },
  photoRingOuter: { position: "relative", width: 140, height: 140, justifyContent: "center", alignItems: "center" },
  photoRingInner: {
    width: 130, height: 130, borderRadius: 65, borderWidth: 3, overflow: "hidden", zIndex: 2,
  },
  heroPhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  photoGlowRing: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    borderWidth: 1, zIndex: 1,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 16,
  },
  heroScoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  heroScoreNum: { fontSize: 72, fontWeight: "900", color: "#fff", lineHeight: 76 },
  heroScoreLabel: { color: "rgba(255,255,255,0.35)", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  tierPill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierLabel: { fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },

  /* Section headers */
  sectionHeader: { width: "100%", gap: 2, marginTop: 4 },
  sectionTitle: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  sectionSub: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: "500" },

  /* Metric grid */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, width: "100%" },

  /* Analysis */
  analysisList: { width: "100%", gap: 8 },

  /* Recos */
  recoList: { width: "100%", gap: 10 },
  tipsBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: PUR + "22",
    borderWidth: 1, borderColor: PUR + "44",
  },
  tipsBtnTxt: { color: PUR, fontSize: 13, fontWeight: "800" },

  /* Share card */
  shareCardSection: { width: "100%", gap: 10 },
  shareCardLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  shareCardLabel: { color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  shareCardOuter: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: PUR, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
    borderWidth: 1, borderColor: "rgba(123,47,190,0.3)",
  },

  /* Share buttons */
  shareRow: { flexDirection: "row", gap: 10, width: "100%" },
  shareBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 7,
  },
  shareBtnGrad: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  shareBtnTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },

  /* Try another */
  tryBtn: {
    width: "100%", borderRadius: 18, overflow: "hidden",
    shadowColor: PUR, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
  tryBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  tryBtnTxt: { color: "#fff", fontSize: 18, fontWeight: "800" },

  uploadLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  uploadLinkTxt: { color: "rgba(255,255,255,0.28)", fontSize: 13, fontWeight: "600" },

  /* Webcam */
  camRow: { flexDirection: "row", justifyContent: "space-between", padding: 24, paddingBottom: 44, backgroundColor: "#000" },
  camBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 8 },
  camBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
