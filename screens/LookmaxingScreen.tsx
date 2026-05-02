import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Image, Modal, Platform,
  Alert, ScrollView, Animated, Dimensions, ActivityIndicator,
  NativeScrollEvent, NativeSyntheticEvent,
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
const PAGE_W = SW;
const CW     = Math.min(SW - 32, 420);

/* ─── App Theme Palette ─── */
const BG_TOP    = "#ABBFF2";
const BG_BOT    = "#BCCFFA";
const CORAL     = "#F86B6D";
const CORAL_SHD = "#D95657";
const GRAD1     = "#FF6C6D";
const GRAD2     = "#FF865A";
const GRAD3     = "#F69C50";
const CARD_BG   = "rgba(255,255,255,0.88)";
const CARD_BG2  = "rgba(255,255,255,0.95)";
const BORD      = "rgba(200,210,240,0.8)";
const TXT_PRI   = "#1A1A2E";
const TXT_SEC   = "#5A5A7A";
const G_HI      = "#22C55E";
const G_MID     = "#86EFAC";
const Y_MID     = "#FACC15";
const R_LOW     = "#F97316";
const R_HI      = "#EF4444";

interface Scores {
  overall: number; potential: number; jawline: number;
  cheekBones: number; eyes: number; masculinity: number;
}
interface FaceData {
  canthalTilt: string; eyeShape: string; eyeType: string;
  faceShape: string; jawWidth: string; noseShape: string;
}

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
  { icon: "💈", title: "Optimize your haircut",   desc: "A properly styled cut adds 0.5–1 point to your facial harmony score.", color: GRAD1 },
  { icon: "💧", title: "Start a skincare routine", desc: "Cleanser + SPF daily. Skin quality is the highest-weighted metric.",  color: GRAD2 },
  { icon: "🏋️", title: "Build facial muscle mass", desc: "Bulking phases define your jaw and cheekbones from the inside.",       color: CORAL },
  { icon: "🧍", title: "Fix your posture now",     desc: "Mewing + forward posture reshapes your lower third over time.",        color: GRAD3 },
  { icon: "😁", title: "Whiten your teeth",        desc: "Tooth color and alignment are major subconscious attraction triggers.", color: "#E57373" },
  { icon: "🌞", title: "SPF every morning",        desc: "Prevents UV-induced aging — the most impactful anti-aging move.",      color: "#FFB74D" },
];

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
  if (s >= 90) return { label: "Chad",             color: G_HI  };
  if (s >= 80) return { label: "Chadlite",         color: G_MID };
  if (s >= 70) return { label: "High-Tier Normie", color: Y_MID };
  if (s >= 60) return { label: "Normie",           color: R_LOW };
  return             { label: "Below Average",     color: R_HI  };
}

function barColor(s: number): [string, string] {
  if (s >= 80) return [G_HI,  "#16A34A"];
  if (s >= 70) return [G_MID, G_HI    ];
  if (s >= 60) return [Y_MID, "#CA8A04"];
  if (s >= 50) return [R_LOW, "#C2410C"];
  return              [R_HI,  "#B91C1C"];
}

function haptic() {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/* ═══════════ METRIC CARD ═══════════ */
function MetricCard({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const tier = getTier(score);
  const [c1, c2] = barColor(score);
  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 900, delay, useNativeDriver: false }).start();
  }, [score]);
  const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={mc.card}>
      <Text style={mc.label}>{label.toUpperCase()}</Text>
      <Text style={mc.score}>{score}</Text>
      <View style={mc.tierRow}>
        <View style={[mc.dot, { backgroundColor: tier.color }]} />
        <Text style={mc.tierTxt}>{tier.label}</Text>
      </View>
      <View style={mc.track}>
        <Animated.View style={{ width: barW, height: "100%", borderRadius: 3, overflow: "hidden" }}>
          <LinearGradient colors={[c1, c2]} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </Animated.View>
      </View>
    </View>
  );
}
const mc = StyleSheet.create({
  card: {
    width: "48%", backgroundColor: CARD_BG2, borderRadius: 20,
    borderWidth: 1.5, borderColor: BORD, padding: 16, gap: 5,
    shadowColor: "#9BB0E8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  label:   { fontSize: 10, fontWeight: "900", color: CORAL, letterSpacing: 1.4 },
  score:   { fontSize: 48, fontWeight: "900", color: TXT_PRI, lineHeight: 52 },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot:     { width: 7, height: 7, borderRadius: 4 },
  tierTxt: { fontSize: 11, fontWeight: "700", color: TXT_SEC },
  track:   { height: 6, backgroundColor: "rgba(180,195,230,0.45)", borderRadius: 3, overflow: "hidden", marginTop: 4 },
});

/* ═══════════ ANALYSIS ROW ═══════════ */
function AnalysisRow({ label, value, index }: { label: string; value: string; index: number }) {
  const icons: Record<string, string> = {
    "Canthal Tilt": "eye-outline", "Eye Shape": "eye", "Eye Type": "eye-sharp",
    "Face Shape": "person-outline", "Jaw Width": "body-outline", "Nose Shape": "water-outline",
  };
  const colors = [GRAD1, GRAD2, CORAL, GRAD3, "#E57373", "#FFB74D"];
  const accent = colors[index % colors.length];
  return (
    <View style={ar.row}>
      <View style={[ar.iconBox, { backgroundColor: accent + "20" }]}>
        <Ionicons name={(icons[label] ?? "sparkles-outline") as any} size={18} color={accent} />
      </View>
      <Text style={ar.label}>{label}</Text>
      <View style={[ar.valuePill, { backgroundColor: accent + "18", borderColor: accent + "50" }]}>
        <Text style={[ar.value, { color: accent }]}>{value}</Text>
      </View>
    </View>
  );
}
const ar = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: CARD_BG, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: BORD,
    shadowColor: "#9BB0E8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 3,
  },
  iconBox:   { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  label:     { flex: 1, color: TXT_PRI, fontSize: 14, fontWeight: "700" },
  valuePill: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4 },
  value:     { fontSize: 12, fontWeight: "800" },
});

/* ═══════════ RECOMMENDATION CARD ═══════════ */
function RecoCard({ num, icon, title, desc, color }: { num: number; icon: string; title: string; desc: string; color: string }) {
  return (
    <View style={rc.card}>
      <View style={[rc.badge, { backgroundColor: color }]}>
        <Text style={rc.num}>{num}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={rc.title}>{icon}  {title}</Text>
        <Text style={rc.desc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={TXT_SEC} />
    </View>
  );
}
const rc = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: CARD_BG, borderRadius: 16,
    borderWidth: 1.5, borderColor: BORD,
    paddingVertical: 14, paddingHorizontal: 14,
    shadowColor: "#9BB0E8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 3,
  },
  badge:  { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  num:    { color: "#fff", fontSize: 14, fontWeight: "900" },
  title:  { color: TXT_PRI, fontSize: 14, fontWeight: "800" },
  desc:   { color: TXT_SEC, fontSize: 12, lineHeight: 17, fontWeight: "500" },
});

/* ═══════════ PAGE HEADER ═══════════ */
function PageHeader({ title, sub, accent }: { title: string; sub: string; accent: string }) {
  return (
    <View style={ph.wrap}>
      <LinearGradient colors={[accent, accent + "60"]} style={ph.bar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={ph.title}>{title}</Text>
        <Text style={ph.sub}>{sub}</Text>
      </View>
    </View>
  );
}
const ph = StyleSheet.create({
  wrap:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  bar:   { width: 5, height: 42, borderRadius: 3 },
  title: { fontSize: 18, fontWeight: "900", color: TXT_PRI, letterSpacing: 0.2 },
  sub:   { fontSize: 12, fontWeight: "600", color: TXT_SEC, marginTop: 1 },
});

/* ═══════════ SHARE CARD ═══════════ */
function ShareCard({ photoUri, scores }: { photoUri: string | null; scores: Scores }) {
  const tier = getTier(scores.overall);
  const metrics = [
    { label: "OVERALL",    score: scores.overall    },
    { label: "POTENTIAL",  score: scores.potential  },
    { label: "JAWLINE",    score: scores.jawline    },
    { label: "CHEEKBONES",score: scores.cheekBones },
    { label: "EYES",       score: scores.eyes       },
    { label: "MASCULINITY",score: scores.masculinity},
  ];
  return (
    <LinearGradient colors={["#ABBFF2", "#D4A5F5", "#BCCFFA"]} style={sc.wrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={sc.brandRow}>
        <Text style={sc.fire}>🔥</Text>
        <Text style={sc.brand}>Rizz AI · Look Score</Text>
      </View>
      <View style={sc.topRow}>
        <View style={[sc.ring, { borderColor: tier.color }]}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={sc.photo} />
            : <View style={[sc.photo, { backgroundColor: "#dce6ff", justifyContent: "center", alignItems: "center" }]}><Text style={{ fontSize: 32 }}>👤</Text></View>}
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={sc.bigNum}>{scores.overall}<Text style={sc.slash}>/100</Text></Text>
          <View style={[sc.pill, { backgroundColor: tier.color + "22", borderColor: tier.color }]}>
            <Text style={[sc.pillTxt, { color: tier.color }]}>{tier.label}</Text>
          </View>
        </View>
      </View>
      <View style={sc.grid}>
        {metrics.map((m) => {
          const [c1] = barColor(m.score);
          return (
            <View key={m.label} style={sc.gridCard}>
              <Text style={[sc.gridLabel, { color: c1 }]}>{m.label}</Text>
              <Text style={sc.gridNum}>{m.score}</Text>
              <View style={sc.gridTrack}>
                <View style={[sc.gridFill, { width: `${m.score}%` as any, backgroundColor: c1 }]} />
              </View>
            </View>
          );
        })}
      </View>
      <Text style={sc.wm}>get yours free · rizz-ai.app</Text>
    </LinearGradient>
  );
}
const sc = StyleSheet.create({
  wrap:      { borderRadius: 20, padding: 16, gap: 12 },
  brandRow:  { flexDirection: "row", alignItems: "center", gap: 5 },
  fire:      { fontSize: 14 },
  brand:     { color: "rgba(0,0,0,0.4)", fontSize: 11, fontWeight: "700" },
  topRow:    { flexDirection: "row", alignItems: "center", gap: 14 },
  ring:      { width: 80, height: 80, borderRadius: 40, borderWidth: 3, overflow: "hidden", flexShrink: 0 },
  photo:     { width: "100%", height: "100%", resizeMode: "cover" },
  bigNum:    { fontSize: 44, fontWeight: "900", color: "#fff", lineHeight: 48 },
  slash:     { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  pill:      { borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 9, paddingVertical: 3, alignSelf: "flex-start" },
  pillTxt:   { fontSize: 11, fontWeight: "800" },
  grid:      { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  gridCard:  { width: "47%", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 11, padding: 10, gap: 3 },
  gridLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  gridNum:   { fontSize: 26, fontWeight: "900", color: "#fff", lineHeight: 30 },
  gridTrack: { height: 3, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" },
  gridFill:  { height: "100%", borderRadius: 2 },
  wm:        { color: "rgba(0,0,0,0.25)", fontSize: 9, fontWeight: "600", textAlign: "center" },
});

/* ═══════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════ */
export default function LookmaxingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [photoUri,   setPhotoUri]   = useState<string | null>(null);
  const [phase,      setPhase]      = useState<"upload" | "loading" | "result">("upload");
  const [loadStage,  setLoadStage]  = useState(0);
  const [scores,     setScores]     = useState<Scores | null>(null);
  const [faceData,   setFaceData]   = useState<FaceData | null>(null);
  const [recos,      setRecos]      = useState(RECOS.slice(0, 4));
  const [sharing,    setSharing]    = useState(false);
  const [showCam,    setShowCam]    = useState(false);
  const [currentPage,setCurrentPage]= useState(0);
  const [permission, reqPermission] = useCameraPermissions();

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const shareRef   = useRef<View>(null);
  const cameraRef  = useRef<CameraView>(null);
  const pagerRef   = useRef<ScrollView>(null);

  const TOTAL_PAGES = 3;

  useEffect(() => {
    if (phase !== "loading") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase]);

  useEffect(() => {
    if (phase === "result") {
      fadeAnim.setValue(0);
      setCurrentPage(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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
      jawline:     gen100(), cheekBones: gen100(),
      eyes:        gen100(), masculinity: gen100(),
    });
    setFaceData({
      canthalTilt: rnd(CANTHAL), eyeShape: rnd(EYE_SHP),
      eyeType:     rnd(EYE_TYP), faceShape: rnd(FACE_SHP),
      jawWidth:    rnd(JAW_WID), noseShape: rnd(NOSE_SHP),
    });
    setRecos([...RECOS].sort(() => Math.random() - 0.5).slice(0, 4));
    setPhase("result");
  };

  const handleUploadPhoto = async () => {
    try {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) { if (Platform.OS !== "web") Alert.alert("Permission Required", "Allow photo library access."); return; }
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] as any, allowsEditing: true, aspect: [1, 1], quality: 0.9 });
      if (r.assets?.[0]) { setPhotoUri(r.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const handleTakeSelfie = async () => {
    if (Platform.OS === "web") {
      if (!permission?.granted) { const r = await reqPermission(); if (!r.granted) { Alert.alert("Permission Required", "Allow camera access."); return; } }
      setShowCam(true); return;
    }
    try {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert("Permission Required", "Allow camera access."); return; }
      const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"] as any, allowsEditing: true, aspect: [1, 1], quality: 0.9, cameraType: ImagePicker.CameraType.front });
      if (r.assets?.[0]) { setPhotoUri(r.assets[0].uri); runAnalysis(); }
    } catch { setPhase("upload"); }
  };

  const captureWebcam = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo?.uri) { setPhotoUri(photo.uri); setShowCam(false); runAnalysis(); }
    } catch {}
  };

  const handleShare = async () => {
    if (!shareRef.current || sharing) return;
    try {
      setSharing(true);
      await playButtonSound();
      await new Promise((r) => setTimeout(r, 200));
      const uri = await captureRef(shareRef, { format: "png", quality: 1 });
      if (Platform.OS === "web") {
        try {
          const blob = await (await fetch(uri)).blob();
          const file = new File([blob], "rizz-ai-score.png", { type: "image/png" });
          if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
            await (navigator as any).share({ files: [file], title: "My Rizz AI Look Score" });
          } else {
            const a = document.createElement("a"); a.href = uri; a.download = "rizz-ai-score.png"; a.click();
          }
        } catch {}
      } else {
        const ok = await Sharing.isAvailableAsync();
        if (ok) await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Look Score" });
      }
    } catch (e) { console.log("Share error:", e); }
    finally { setSharing(false); }
  };

  const handleReset = () => {
    setPhotoUri(null); setScores(null); setFaceData(null);
    setCurrentPage(0); setPhase("upload");
  };

  const onPageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / PAGE_W);
    setCurrentPage(page);
  };

  const goToPage = (page: number) => {
    pagerRef.current?.scrollTo({ x: page * PAGE_W, animated: true });
    setCurrentPage(page);
  };

  const tier = scores ? getTier(scores.overall) : null;

  return (
    <LinearGradient colors={[BG_TOP, "#C5C8F8", BG_BOT]} style={s.root} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>

      {/* Webcam modal */}
      <Modal visible={showCam} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="front" />
          <View style={s.camRow}>
            <Pressable style={[s.camBtn, { backgroundColor: "#333" }]} onPress={() => setShowCam(false)}>
              <Text style={s.camBtnTxt}>Cancel</Text>
            </Pressable>
            <Pressable style={[s.camBtn, { backgroundColor: CORAL }]} onPress={captureWebcam}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={s.camBtnTxt}>Capture</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={s.backBtn} onPress={async () => { await playButtonSound(); navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>
          {phase === "result" ? ["Your Ratings", "Your Analysis", "Share"][currentPage] : "Look Score"}
        </Text>
        {phase === "result"
          ? <View style={s.pageCounter}><Text style={s.pageCounterTxt}>{currentPage + 1}/{TOTAL_PAGES}</Text></View>
          : <View style={{ width: 40 }} />
        }
      </View>

      {/* ══════════════════ UPLOAD / LOADING in vertical scroll ══════════════════ */}
      {phase !== "result" && (
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 48 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── UPLOAD ── */}
          {phase === "upload" && (
            <View style={s.uploadWrap}>
              <View style={s.heroWrap}>
                <LinearGradient colors={[GRAD1, GRAD2, GRAD3]} style={s.heroIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <MaterialCommunityIcons name="face-man-shimmer" size={56} color="#fff" />
                </LinearGradient>
                <View style={s.heroGlow} />
              </View>
              <Text style={s.uploadTitle}>Get Your Ratings</Text>
              <Text style={s.uploadSub}>AI analyzes 6 facial metrics and gives you an honest attractiveness score</Text>
              <View style={s.frameBox}>
                <View style={[s.corner, s.cTL]} /><View style={[s.corner, s.cTR]} />
                <View style={[s.corner, s.cBL]} /><View style={[s.corner, s.cBR]} />
                <MaterialCommunityIcons name="face-recognition" size={64} color="rgba(248,107,109,0.4)" />
                <Text style={s.frameTxt}>Position your face here</Text>
              </View>
              <View style={s.statsRow}>
                {[["6", "Metrics"], ["100", "Max Score"], ["0%", "Data Sent"]].map(([v, l]) => (
                  <View key={l} style={s.statBox}>
                    <Text style={s.statVal}>{v}</Text>
                    <Text style={s.statLbl}>{l}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={s.primaryBtn} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
                <LinearGradient colors={[GRAD1, GRAD2, GRAD3]} style={s.primaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="image" size={22} color="#fff" />
                  <Text style={s.primaryTxt}>Upload Photo</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={s.secondaryBtn} onPress={async () => { await playButtonSound(); handleTakeSelfie(); }}>
                <Ionicons name="camera" size={20} color={CORAL} />
                <Text style={[s.secondaryTxt, { color: CORAL }]}>Take a Selfie</Text>
              </Pressable>
            </View>
          )}

          {/* ── LOADING ── */}
          {phase === "loading" && (
            <View style={s.loadWrap}>
              {photoUri && (
                <Animated.View style={[s.loadRing, { transform: [{ scale: pulseAnim }] }]}>
                  <Image source={{ uri: photoUri }} style={s.loadPhoto} />
                  <View style={s.loadOverlay}>
                    <Ionicons name="scan" size={38} color="rgba(248,107,109,0.9)" />
                  </View>
                </Animated.View>
              )}
              <View style={s.loadCard}>
                <Text style={s.loadTitle}>Analyzing your face...</Text>
                <View style={s.loadDivider} />
                {LOADING_STAGES.map((stage, i) => (
                  <View key={stage} style={s.stageRow}>
                    <View style={[s.stageDot,
                      i < loadStage  && { backgroundColor: CORAL },
                      i === loadStage && { backgroundColor: GRAD1 },
                    ]} />
                    <Text style={[s.stageTxt,
                      i === loadStage && { color: TXT_PRI, fontWeight: "700" },
                      i < loadStage  && { color: CORAL, textDecorationLine: "line-through" as const },
                    ]}>{stage}</Text>
                    {i < loadStage  && <Ionicons name="checkmark-circle" size={16} color={CORAL} style={{ marginLeft: "auto" }} />}
                    {i === loadStage && <ActivityIndicator size={14} color={GRAD1} style={{ marginLeft: "auto" }} />}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ══════════════════ RESULT — 3-page horizontal pager ══════════════════ */}
      {phase === "result" && scores && faceData && tier && (
        <Animated.View style={[s.pagerOuter, { opacity: fadeAnim }]}>

          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPageScroll}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            bounces={false}
          >
            {/* ─────────── PAGE 1: Hero + Ratings ─────────── */}
            <ScrollView
              style={{ width: PAGE_W }}
              contentContainerStyle={s.pageContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero */}
              <View style={s.heroSection}>
                <View style={s.photoOuter}>
                  <View style={[s.photoRing, { borderColor: tier.color }]}>
                    {photoUri
                      ? <Image source={{ uri: photoUri }} style={s.heroPhoto} />
                      : <View style={[s.heroPhoto, { backgroundColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center" }]}>
                          <Text style={{ fontSize: 52 }}>👤</Text>
                        </View>
                    }
                  </View>
                  <View style={[s.photoGlow, { shadowColor: tier.color, borderColor: tier.color + "40" }]} />
                </View>
                <View style={s.heroScoreRow}>
                  <Text style={s.heroNum}>{scores.overall}</Text>
                  <Text style={s.heroSlash}>/100</Text>
                </View>
                <View style={[s.tierPill, { backgroundColor: tier.color + "25", borderColor: tier.color }]}>
                  <View style={[s.tierDot, { backgroundColor: tier.color }]} />
                  <Text style={[s.tierTxt, { color: tier.color }]}>{tier.label}</Text>
                </View>
              </View>

              {/* Swipe hint */}
              <View style={s.swipeHint}>
                <Text style={s.swipeHintTxt}>Your Ratings</Text>
                <Ionicons name="chevron-down" size={14} color={TXT_SEC} />
              </View>

              {/* 2×3 grid */}
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

              {/* Next hint */}
              <Pressable style={s.nextPageBtn} onPress={() => goToPage(1)}>
                <Text style={s.nextPageTxt}>See Your Analysis</Text>
                <Ionicons name="chevron-forward" size={16} color={CORAL} />
              </Pressable>
            </ScrollView>

            {/* ─────────── PAGE 2: Face Analysis ─────────── */}
            <ScrollView
              style={{ width: PAGE_W }}
              contentContainerStyle={s.pageContent}
              showsVerticalScrollIndicator={false}
            >
              <PageHeader title="Your Analysis" sub="Facial structure breakdown" accent={GRAD1} />

              <View style={s.analysisList}>
                {[
                  { label: "Canthal Tilt", value: faceData.canthalTilt },
                  { label: "Eye Shape",    value: faceData.eyeShape    },
                  { label: "Eye Type",     value: faceData.eyeType     },
                  { label: "Face Shape",   value: faceData.faceShape   },
                  { label: "Jaw Width",    value: faceData.jawWidth    },
                  { label: "Nose Shape",   value: faceData.noseShape   },
                ].map((row, i) => (
                  <AnalysisRow key={row.label} label={row.label} value={row.value} index={i} />
                ))}
              </View>

              {/* Info card */}
              <View style={s.infoCard}>
                <Ionicons name="information-circle-outline" size={18} color={GRAD2} />
                <Text style={s.infoTxt}>
                  These traits are determined by your bone structure and facial geometry. Swipe right for personalized tips.
                </Text>
              </View>

              <Pressable style={s.nextPageBtn} onPress={() => goToPage(2)}>
                <Text style={s.nextPageTxt}>See Recommendations</Text>
                <Ionicons name="chevron-forward" size={16} color={CORAL} />
              </Pressable>
            </ScrollView>

            {/* ─────────── PAGE 3: Recommendations + Share ─────────── */}
            <ScrollView
              style={{ width: PAGE_W }}
              contentContainerStyle={s.pageContent}
              showsVerticalScrollIndicator={false}
            >
              <PageHeader title="Your Recommendations" sub="Personalized for your ratings" accent={CORAL} />

              <View style={s.recoList}>
                {recos.map((r, i) => (
                  <RecoCard key={r.title} num={i + 1} icon={r.icon} title={r.title} desc={r.desc} color={r.color} />
                ))}
              </View>

              <Pressable style={s.tipsBtn} onPress={async () => { await playButtonSound(); navigation.navigate("LookmaxingTips"); }}>
                <Ionicons name="bulb-outline" size={15} color={CORAL} />
                <Text style={s.tipsBtnTxt}>See All 200 Tips</Text>
                <Ionicons name="chevron-forward" size={14} color={CORAL} />
              </Pressable>

              {/* Share card label */}
              <View style={s.shareCardLabelRow}>
                <View style={s.shareLabelLine} />
                <Text style={s.shareCardLabel}>SHAREABLE CARD</Text>
                <View style={s.shareLabelLine} />
              </View>

              {/* Shareable card (captured) */}
              <View ref={shareRef} collapsable={false} style={s.shareCardOuter}>
                <ShareCard photoUri={photoUri} scores={scores} />
              </View>

              {/* Share icons row */}
              <View style={s.shareRow}>
                {/* WhatsApp */}
                <Pressable style={[s.shareIconBtn, { backgroundColor: "#25D366", shadowColor: "#25D366" }]} onPress={handleShare} disabled={sharing}>
                  {sharing ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="logo-whatsapp" size={28} color="#fff" />}
                </Pressable>

                {/* Instagram */}
                <Pressable style={[s.shareIconBtn, { padding: 0, overflow: "hidden", shadowColor: "#dc2743" }]} onPress={handleShare} disabled={sharing}>
                  <LinearGradient colors={["#f09433","#e6683c","#dc2743","#cc2366","#bc1888"]} style={s.shareIconGrad} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
                    {sharing ? <ActivityIndicator color="#fff" size="small" />
                      : <Ionicons name="logo-instagram" size={28} color="#fff" />}
                  </LinearGradient>
                </Pressable>

                {/* Snapchat */}
                <Pressable style={[s.shareIconBtn, { backgroundColor: "#FFFC00", shadowColor: "#CCCA00" }]} onPress={handleShare} disabled={sharing}>
                  {sharing ? <ActivityIndicator color="#000" size="small" />
                    : <FontAwesome name="snapchat-ghost" size={26} color="#000" />}
                </Pressable>

                {/* Generic */}
                <Pressable style={[s.shareIconBtn, { backgroundColor: CORAL, shadowColor: CORAL_SHD }]} onPress={handleShare} disabled={sharing}>
                  {sharing ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="share-social" size={26} color="#fff" />}
                </Pressable>
              </View>

              {/* Try Another */}
              <Pressable style={s.tryBtn} onPress={async () => { await playButtonSound(); handleReset(); }}>
                <LinearGradient colors={[GRAD1, GRAD2, GRAD3]} style={s.tryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={s.tryTxt}>Try Another Photo</Text>
                </LinearGradient>
              </Pressable>

              {/* Upload from gallery */}
              <Pressable style={s.galleryBtn} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
                <Ionicons name="image-outline" size={18} color={TXT_SEC} />
                <Text style={s.galleryBtnTxt}>Upload from gallery instead</Text>
              </Pressable>
            </ScrollView>
          </ScrollView>

          {/* ─────────── DOT PAGINATION ─────────── */}
          <View style={[s.dotsRow, { paddingBottom: insets.bottom + 12 }]}>
            {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
              <Pressable key={i} onPress={() => goToPage(i)} hitSlop={10}>
                {currentPage === i
                  ? <LinearGradient colors={[GRAD1, CORAL]} style={s.dotActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                  : <View style={s.dot} />
                }
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

/* ═══════════════════════════════════════
   STYLES
═══════════════════════════════════════ */
const s = StyleSheet.create({
  root: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: CORAL,
    justifyContent: "center", alignItems: "center",
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
  pageCounter: {
    backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
  },
  pageCounterTxt: { fontSize: 12, fontWeight: "800", color: "#fff" },

  /* Upload/Loading scroll */
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, alignItems: "center" },

  /* Upload */
  uploadWrap: { width: "100%", alignItems: "center", gap: 18, paddingTop: 10 },
  heroWrap:   { position: "relative", alignItems: "center", justifyContent: "center" },
  heroIconBg: {
    width: 108, height: 108, borderRadius: 36, justifyContent: "center", alignItems: "center", zIndex: 2,
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 12,
  },
  heroGlow: { position: "absolute", width: 135, height: 135, borderRadius: 68, backgroundColor: CORAL, opacity: 0.18, zIndex: 1 },
  uploadTitle: { fontSize: 30, fontWeight: "900", color: "#fff", textAlign: "center" },
  uploadSub:   { fontSize: 15, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22, fontWeight: "500", maxWidth: 300 },
  frameBox: {
    width: CW, height: CW * 0.65, borderRadius: 24, backgroundColor: CARD_BG,
    borderWidth: 2, borderColor: "rgba(248,107,109,0.4)", borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: 10, position: "relative",
  },
  corner: { position: "absolute", width: 22, height: 22 },
  cTL: { top: 12,    left: 12,  borderTopWidth: 3,    borderLeftWidth: 3,   borderColor: CORAL, borderTopLeftRadius:     6 },
  cTR: { top: 12,    right: 12, borderTopWidth: 3,    borderRightWidth: 3,  borderColor: CORAL, borderTopRightRadius:    6 },
  cBL: { bottom: 12, left: 12,  borderBottomWidth: 3, borderLeftWidth: 3,   borderColor: CORAL, borderBottomLeftRadius:  6 },
  cBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3,  borderColor: CORAL, borderBottomRightRadius: 6 },
  frameTxt:  { color: "rgba(248,107,109,0.6)", fontWeight: "700", fontSize: 13 },
  statsRow:  { flexDirection: "row", gap: 10, width: "100%" },
  statBox:   {
    flex: 1, backgroundColor: CARD_BG2, borderRadius: 14, borderWidth: 1, borderColor: BORD,
    alignItems: "center", paddingVertical: 14,
  },
  statVal:   { fontSize: 22, fontWeight: "900", color: TXT_PRI },
  statLbl:   { fontSize: 11, color: TXT_SEC, fontWeight: "600", marginTop: 2 },
  primaryBtn: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  primaryGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  primaryTxt:  { color: "#fff", fontSize: 19, fontWeight: "800" },
  secondaryBtn: {
    width: "100%", borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(248,107,109,0.45)",
    backgroundColor: "rgba(248,107,109,0.1)",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingVertical: 15,
  },
  secondaryTxt: { fontSize: 17, fontWeight: "800" },

  /* Loading */
  loadWrap:  { width: "100%", alignItems: "center", gap: 24, paddingTop: 10 },
  loadRing:  {
    width: 175, height: 175, borderRadius: 88, overflow: "hidden",
    borderWidth: 3.5, borderColor: "rgba(248,107,109,0.7)",
    shadowColor: CORAL, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 18, elevation: 12,
  },
  loadPhoto:   { width: "100%", height: "100%" },
  loadOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 66,
    justifyContent: "flex-end", alignItems: "center", paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  loadCard:    { width: "100%", backgroundColor: CARD_BG2, borderRadius: 22, padding: 22, gap: 12, borderWidth: 1, borderColor: BORD },
  loadTitle:   { fontSize: 17, fontWeight: "800", color: TXT_PRI, textAlign: "center" },
  loadDivider: { height: 1, backgroundColor: BORD },
  stageRow:    { flexDirection: "row", alignItems: "center", gap: 10 },
  stageDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(100,110,160,0.25)" },
  stageTxt:    { fontSize: 14, color: TXT_SEC, fontWeight: "600", flex: 1 },

  /* Pager outer */
  pagerOuter: { flex: 1 },

  /* Page content */
  pageContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14, alignItems: "center" },

  /* Hero */
  heroSection:  { width: "100%", alignItems: "center", gap: 10, paddingTop: 4, paddingBottom: 4 },
  photoOuter:   { position: "relative", width: 130, height: 130, justifyContent: "center", alignItems: "center" },
  photoRing:    { width: 118, height: 118, borderRadius: 59, borderWidth: 3.5, overflow: "hidden", zIndex: 2 },
  heroPhoto:    { width: "100%", height: "100%", resizeMode: "cover" },
  photoGlow: {
    position: "absolute", width: 142, height: 142, borderRadius: 71,
    borderWidth: 1, zIndex: 1, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 18, elevation: 14,
  },
  heroScoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  heroNum:      { fontSize: 64, fontWeight: "900", color: TXT_PRI, lineHeight: 68 },
  heroSlash:    { color: TXT_SEC, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  tierPill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, borderWidth: 1.5,
  },
  tierDot:   { width: 8, height: 8, borderRadius: 4 },
  tierTxt:   { fontSize: 14, fontWeight: "800" },

  /* Swipe hint */
  swipeHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  swipeHintTxt: { color: TXT_SEC, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  /* Metric grid */
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12, width: "100%" },

  /* Analysis list */
  analysisList: { width: "100%", gap: 9 },

  /* Info card */
  infoCard: {
    flexDirection: "row", gap: 10, backgroundColor: CARD_BG, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: BORD, alignItems: "flex-start",
  },
  infoTxt: { flex: 1, color: TXT_SEC, fontSize: 12, lineHeight: 18, fontWeight: "500" },

  /* Reco list */
  recoList: { width: "100%", gap: 10 },

  /* Tips btn */
  tipsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-end",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: "rgba(248,107,109,0.12)", borderWidth: 1, borderColor: "rgba(248,107,109,0.35)",
  },
  tipsBtnTxt: { color: CORAL, fontSize: 13, fontWeight: "800" },

  /* Share card divider label */
  shareCardLabelRow: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  shareLabelLine:    { flex: 1, height: 1, backgroundColor: BORD },
  shareCardLabel:    { color: TXT_SEC, fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },

  /* Shareable card */
  shareCardOuter: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: CORAL, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 10,
    borderWidth: 1.5, borderColor: "rgba(248,107,109,0.2)",
  },

  /* Share icon buttons */
  shareRow:      { flexDirection: "row", gap: 12, width: "100%", justifyContent: "center" },
  shareIconBtn:  {
    width: 62, height: 62, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 7,
  },
  shareIconGrad: { flex: 1, width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },

  /* Try another + gallery */
  tryBtn: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  tryGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  tryTxt:  { color: "#fff", fontSize: 18, fontWeight: "800" },

  galleryBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 13, paddingHorizontal: 20, borderRadius: 16,
    backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORD, width: "100%", justifyContent: "center",
  },
  galleryBtnTxt: { color: TXT_PRI, fontSize: 15, fontWeight: "700" },

  /* Next page hint */
  nextPageBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: "rgba(248,107,109,0.1)", borderWidth: 1, borderColor: "rgba(248,107,109,0.3)",
    alignSelf: "flex-end",
  },
  nextPageTxt: { color: CORAL, fontSize: 13, fontWeight: "800" },

  /* Dots */
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 10 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { width: 28, height: 8, borderRadius: 4 },

  /* Webcam */
  camRow:   { flexDirection: "row", justifyContent: "space-between", padding: 24, paddingBottom: 44, backgroundColor: "#000" },
  camBtn:   { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 8 },
  camBtnTxt:{ color: "#fff", fontSize: 16, fontWeight: "700" },
});
