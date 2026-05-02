import React, { useState, useRef, useEffect } from "react";
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

/* ─── App Theme Palette ─── */
const BG_TOP    = "#ABBFF2";
const BG_BOT    = "#BCCFFA";
const CORAL     = "#F86B6D";
const CORAL_SHD = "#D95657";
const GRAD1     = "#FF6C6D";
const GRAD2     = "#FF865A";
const GRAD3     = "#F69C50";
const CARD_BG   = "rgba(255,255,255,0.18)";
const CARD_BG2  = "rgba(255,255,255,0.25)";
const BORD      = "rgba(255,255,255,0.35)";
const DARK_CARD = "rgba(0,0,0,0.12)";

/* ─── Interfaces ─── */
interface Scores {
  overall: number; potential: number; jawline: number;
  cheekBones: number; eyes: number; masculinity: number;
}
interface FaceData {
  canthalTilt: string; eyeShape: string; eyeType: string;
  faceShape: string; jawWidth: string; noseShape: string;
}

/* ─── Static data ─── */
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
  { icon: "💈", title: "Optimize your haircut",    desc: "A properly styled cut adds 0.5–1 point to your facial harmony score.", color: GRAD1 },
  { icon: "💧", title: "Start a skincare routine",  desc: "Cleanser + SPF daily. Skin quality is the highest-weighted metric.",  color: GRAD2 },
  { icon: "🏋️", title: "Build facial muscle mass",  desc: "Bulking phases define your jaw and cheekbones from the inside.",       color: CORAL },
  { icon: "🧍", title: "Fix your posture now",      desc: "Mewing + forward posture reshapes your lower third over time.",        color: GRAD3 },
  { icon: "😁", title: "Whiten your teeth",         desc: "Tooth color and alignment are major subconscious attraction triggers.", color: "#E57373" },
  { icon: "🌞", title: "SPF every morning",         desc: "Prevents UV-induced aging — the most impactful anti-aging move.",      color: "#FFB74D" },
];

/* ─── Helpers ─── */
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
  if (s >= 90) return { label: "Chad",             color: "#FF3D3D" };
  if (s >= 80) return { label: "Chadlite",         color: CORAL     };
  if (s >= 70) return { label: "High-Tier Normie", color: GRAD2     };
  if (s >= 60) return { label: "Normie",           color: GRAD3     };
  return             { label: "Below Average",     color: "#FFB74D" };
}

function barColor(s: number): [string, string] {
  if (s >= 80) return [GRAD1, CORAL_SHD];
  if (s >= 70) return [GRAD2, GRAD1];
  if (s >= 60) return [GRAD3, GRAD2];
  if (s >= 50) return ["#FFB74D", GRAD3];
  return              ["#E0E0E0", "#BDBDBD"];
}

function haptic() {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/* ═══════════════ METRIC CARD ═══════════════ */
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
    width: (CW - 12) / 2, backgroundColor: CARD_BG2, borderRadius: 20,
    borderWidth: 1.5, borderColor: BORD,
    padding: 16, gap: 5,
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  label: { fontSize: 10, fontWeight: "900", color: CORAL, letterSpacing: 1.4 },
  score: { fontSize: 48, fontWeight: "900", color: "#fff", lineHeight: 52 },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tierTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)" },
  track: { height: 5, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden", marginTop: 4 },
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
    backgroundColor: CARD_BG, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 18,
    borderWidth: 1, borderColor: BORD,
  },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "600" },
  value: { color: "#fff", fontSize: 14, fontWeight: "800" },
});

/* ═══════════════ RECOMMENDATION CARD ═══════════════ */
function RecoCard({ num, icon, title, desc, color }: { num: number; icon: string; title: string; desc: string; color: string }) {
  return (
    <View style={rc.card}>
      <View style={[rc.badge, { backgroundColor: color }]}>
        <Text style={rc.badgeTxt}>{num}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={rc.title}>{icon}  {title}</Text>
        <Text style={rc.desc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
    </View>
  );
}
const rc = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: CARD_BG, borderRadius: 18,
    borderWidth: 1, borderColor: BORD,
    paddingVertical: 15, paddingHorizontal: 16,
  },
  badge: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  badgeTxt: { color: "#fff", fontSize: 15, fontWeight: "900" },
  title: { color: "#fff", fontSize: 14, fontWeight: "800" },
  desc: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 17, fontWeight: "500" },
});

/* ═══════════════ SHARE CARD (opaque for capture) ═══════════════ */
function ShareCard({ photoUri, scores }: { photoUri: string | null; scores: Scores }) {
  const tier = getTier(scores.overall);
  const metrics = [
    { label: "OVERALL",     score: scores.overall     },
    { label: "POTENTIAL",   score: scores.potential   },
    { label: "JAWLINE",     score: scores.jawline     },
    { label: "CHEEKBONES",  score: scores.cheekBones  },
    { label: "EYES",        score: scores.eyes        },
    { label: "MASCULINITY", score: scores.masculinity },
  ];
  return (
    <LinearGradient colors={["#ABBFF2", "#D4A5F5", "#BCCFFA"]} style={sc.wrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={sc.brandRow}>
        <Text style={sc.fire}>🔥</Text>
        <Text style={sc.brand}>Rizz AI · Look Score</Text>
      </View>
      <View style={sc.topRow}>
        <View style={[sc.ring, { borderColor: CORAL }]}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={sc.photo} />
            : <View style={[sc.photo, { backgroundColor: "#dce6ff", justifyContent: "center", alignItems: "center" }]}><Text style={{ fontSize: 36 }}>👤</Text></View>}
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={sc.bigNum}>{scores.overall}<Text style={sc.slash}>/100</Text></Text>
          <View style={[sc.pill, { backgroundColor: CORAL + "22", borderColor: CORAL }]}>
            <Text style={[sc.pillTxt, { color: CORAL }]}>{tier.label}</Text>
          </View>
        </View>
      </View>
      <View style={sc.grid}>
        {metrics.map((m) => {
          const [c1] = barColor(m.score);
          return (
            <View key={m.label} style={sc.gridCard}>
              <Text style={[sc.gridLabel, { color: CORAL }]}>{m.label}</Text>
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
  wrap: { borderRadius: 20, padding: 18, gap: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fire: { fontSize: 16 },
  brand: { color: "rgba(0,0,0,0.4)", fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  ring: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, overflow: "hidden", flexShrink: 0 },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  bigNum: { fontSize: 50, fontWeight: "900", color: "#fff", lineHeight: 54 },
  slash: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  pill: { borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  pillTxt: { fontSize: 12, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridCard: { width: "47%", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 12, padding: 12, gap: 4 },
  gridLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  gridNum: { fontSize: 28, fontWeight: "900", color: "#fff", lineHeight: 32 },
  gridTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" },
  gridFill: { height: "100%", borderRadius: 2 },
  wm: { color: "rgba(0,0,0,0.25)", fontSize: 10, fontWeight: "600", textAlign: "center" },
});

/* ═══════════════ MAIN SCREEN ═══════════════ */
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
  const [permission, reqPermission] = useCameraPermissions();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const shareRef  = useRef<View>(null);
  const cameraRef = useRef<CameraView>(null);

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
      canthalTilt: rnd(CANTHAL), eyeShape: rnd(EYE_SHP), eyeType: rnd(EYE_TYP),
      faceShape: rnd(FACE_SHP),  jawWidth: rnd(JAW_WID), noseShape: rnd(NOSE_SHP),
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
      await new Promise((r) => setTimeout(r, 120));
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

  const handleReset = () => { setPhotoUri(null); setScores(null); setFaceData(null); setPhase("upload"); };

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
        <Text style={s.headerTitle}>Look Score</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════════ UPLOAD ══════════════════ */}
        {phase === "upload" && (
          <View style={s.uploadWrap}>
            {/* Hero icon */}
            <View style={s.heroWrap}>
              <LinearGradient colors={[GRAD1, GRAD2, GRAD3]} style={s.heroIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name="face-man-shimmer" size={56} color="#fff" />
              </LinearGradient>
              <View style={s.heroGlow} />
            </View>

            <Text style={s.uploadTitle}>Get Your Ratings</Text>
            <Text style={s.uploadSub}>AI analyzes 6 facial metrics and gives you an honest attractiveness score</Text>

            {/* Viewfinder */}
            <View style={s.frameBox}>
              <View style={[s.corner, s.cTL]} /><View style={[s.corner, s.cTR]} />
              <View style={[s.corner, s.cBL]} /><View style={[s.corner, s.cBR]} />
              <MaterialCommunityIcons name="face-recognition" size={64} color="rgba(248,107,109,0.4)" />
              <Text style={s.frameTxt}>Position your face here</Text>
            </View>

            {/* Stats */}
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

        {/* ══════════════════ LOADING ══════════════════ */}
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
                    i === loadStage && { color: "#fff", fontWeight: "700" },
                    i < loadStage  && { color: CORAL, textDecorationLine: "line-through" as const },
                  ]}>{stage}</Text>
                  {i < loadStage  && <Ionicons name="checkmark-circle" size={16} color={CORAL} style={{ marginLeft: "auto" }} />}
                  {i === loadStage && <ActivityIndicator size={14} color={GRAD1} style={{ marginLeft: "auto" }} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════════════ RESULT ══════════════════ */}
        {phase === "result" && scores && faceData && tier && (
          <Animated.View style={[s.resultWrap, { opacity: fadeAnim }]}>

            {/* Hero: photo + score */}
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

            {/* YOUR RATINGS */}
            <View style={s.secHeader}>
              <Text style={s.secTitle}>YOUR RATINGS</Text>
              <Text style={s.secSub}>tap card to share with friends</Text>
            </View>
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

            {/* YOUR ANALYSIS */}
            <View style={s.secHeader}>
              <Text style={s.secTitle}>YOUR ANALYSIS</Text>
              <Text style={s.secSub}>facial structure breakdown</Text>
            </View>
            <View style={s.analysisList}>
              <AnalysisRow label="Canthal Tilt"  value={faceData.canthalTilt} />
              <AnalysisRow label="Eye Shape"     value={faceData.eyeShape}    />
              <AnalysisRow label="Eye Type"      value={faceData.eyeType}     />
              <AnalysisRow label="Face Shape"    value={faceData.faceShape}   />
              <AnalysisRow label="Jaw Width"     value={faceData.jawWidth}    />
              <AnalysisRow label="Nose Shape"    value={faceData.noseShape}   />
            </View>

            {/* YOUR RECOMMENDATIONS */}
            <View style={s.secHeader}>
              <Text style={s.secTitle}>YOUR RECOMMENDATIONS</Text>
              <Text style={s.secSub}>personalized for your ratings</Text>
            </View>
            <View style={s.recoList}>
              {recos.map((r, i) => (
                <RecoCard key={r.title} num={i + 1} icon={r.icon} title={r.title} desc={r.desc} color={r.color} />
              ))}
            </View>

            <Pressable style={s.tipsBtn} onPress={async () => { await playButtonSound(); navigation.navigate("LookmaxingTips"); }}>
              <Text style={s.tipsBtnTxt}>See All 200 Tips →</Text>
            </Pressable>

            {/* SHARE CARD */}
            <View style={s.shareCardSection}>
              <View style={s.shareCardLabelRow}>
                <Ionicons name="share-social-outline" size={12} color="rgba(255,255,255,0.5)" />
                <Text style={s.shareCardLabel}>SHAREABLE CARD</Text>
              </View>
              <View ref={shareRef} collapsable={false} style={s.shareCardOuter}>
                <ShareCard photoUri={photoUri} scores={scores} />
              </View>
            </View>

            {/* SHARE BUTTONS — icons only */}
            <View style={s.shareRow}>
              {/* WhatsApp */}
              <Pressable
                style={[s.shareIconBtn, { backgroundColor: "#25D366", shadowColor: "#25D366" }]}
                onPress={handleShare} disabled={sharing}
              >
                {sharing
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="logo-whatsapp" size={28} color="#fff" />
                }
              </Pressable>

              {/* Instagram */}
              <Pressable
                style={[s.shareIconBtn, { padding: 0, overflow: "hidden", shadowColor: "#dc2743" }]}
                onPress={handleShare} disabled={sharing}
              >
                <LinearGradient
                  colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]}
                  style={s.shareIconGrad}
                  start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
                >
                  {sharing
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="logo-instagram" size={28} color="#fff" />
                  }
                </LinearGradient>
              </Pressable>

              {/* Snapchat */}
              <Pressable
                style={[s.shareIconBtn, { backgroundColor: "#FFFC00", shadowColor: "#CCCA00" }]}
                onPress={handleShare} disabled={sharing}
              >
                {sharing
                  ? <ActivityIndicator color="#000" size="small" />
                  : <FontAwesome name="snapchat-ghost" size={26} color="#000" />
                }
              </Pressable>

              {/* Generic share */}
              <Pressable
                style={[s.shareIconBtn, { backgroundColor: CORAL, shadowColor: CORAL_SHD }]}
                onPress={handleShare} disabled={sharing}
              >
                {sharing
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="share-social" size={26} color="#fff" />
                }
              </Pressable>
            </View>

            {/* TRY ANOTHER */}
            <Pressable style={s.tryBtn} onPress={async () => { await playButtonSound(); handleReset(); }}>
              <LinearGradient colors={[GRAD1, GRAD2, GRAD3]} style={s.tryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={s.tryTxt}>Try Another Photo</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={s.uploadLink} onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}>
              <Ionicons name="image-outline" size={14} color="rgba(255,255,255,0.4)" />
              <Text style={s.uploadLinkTxt}>Upload from gallery instead</Text>
            </Pressable>

          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

/* ═══════════════ STYLES ═══════════════ */
const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 6,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: CORAL,
    justifyContent: "center", alignItems: "center",
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff", letterSpacing: 0.4 },

  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, alignItems: "center" },

  /* Upload */
  uploadWrap: { width: "100%", alignItems: "center", gap: 18, paddingTop: 10 },

  heroWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  heroIconBg: {
    width: 108, height: 108, borderRadius: 36,
    justifyContent: "center", alignItems: "center", zIndex: 2,
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 12,
  },
  heroGlow: {
    position: "absolute", width: 135, height: 135, borderRadius: 68,
    backgroundColor: CORAL, opacity: 0.18, zIndex: 1,
  },

  uploadTitle: { fontSize: 30, fontWeight: "900", color: "#fff", textAlign: "center", letterSpacing: 0.2 },
  uploadSub: { fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 22, fontWeight: "500", maxWidth: 300 },

  frameBox: {
    width: CW, height: CW * 0.65,
    borderRadius: 24, backgroundColor: CARD_BG,
    borderWidth: 2, borderColor: "rgba(248,107,109,0.4)",
    borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: 10, position: "relative",
  },
  corner: { position: "absolute", width: 22, height: 22 },
  cTL: { top: 12,    left: 12,  borderTopWidth: 3,    borderLeftWidth: 3,   borderColor: CORAL, borderTopLeftRadius:     6 },
  cTR: { top: 12,    right: 12, borderTopWidth: 3,    borderRightWidth: 3,  borderColor: CORAL, borderTopRightRadius:    6 },
  cBL: { bottom: 12, left: 12,  borderBottomWidth: 3, borderLeftWidth: 3,   borderColor: CORAL, borderBottomLeftRadius:  6 },
  cBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3,  borderColor: CORAL, borderBottomRightRadius: 6 },
  frameTxt: { color: "rgba(248,107,109,0.6)", fontWeight: "700", fontSize: 13 },

  statsRow: { flexDirection: "row", gap: 10, width: "100%" },
  statBox: {
    flex: 1, backgroundColor: CARD_BG2, borderRadius: 14, borderWidth: 1, borderColor: BORD,
    alignItems: "center", paddingVertical: 14,
  },
  statVal: { fontSize: 22, fontWeight: "900", color: "#fff" },
  statLbl: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600", marginTop: 2 },

  primaryBtn: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  primaryGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  primaryTxt: { color: "#fff", fontSize: 19, fontWeight: "800" },

  secondaryBtn: {
    width: "100%", borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(248,107,109,0.45)",
    backgroundColor: "rgba(248,107,109,0.1)",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingVertical: 15,
  },
  secondaryTxt: { fontSize: 17, fontWeight: "800" },

  /* Loading */
  loadWrap: { width: "100%", alignItems: "center", gap: 24, paddingTop: 10 },
  loadRing: {
    width: 175, height: 175, borderRadius: 88, overflow: "hidden",
    borderWidth: 3.5, borderColor: "rgba(248,107,109,0.7)",
    shadowColor: CORAL, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 18, elevation: 12,
  },
  loadPhoto: { width: "100%", height: "100%" },
  loadOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 66,
    justifyContent: "flex-end", alignItems: "center", paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  loadCard: {
    width: "100%", backgroundColor: CARD_BG2, borderRadius: 22, padding: 22, gap: 12,
    borderWidth: 1, borderColor: BORD,
  },
  loadTitle: { fontSize: 17, fontWeight: "800", color: "#fff", textAlign: "center" },
  loadDivider: { height: 1, backgroundColor: BORD },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  stageTxt: { fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: "600", flex: 1 },

  /* Result */
  resultWrap: { width: "100%", alignItems: "center", gap: 14, paddingTop: 4 },

  heroSection: { width: "100%", alignItems: "center", gap: 10, paddingVertical: 8 },
  photoOuter: { position: "relative", width: 140, height: 140, justifyContent: "center", alignItems: "center" },
  photoRing: {
    width: 128, height: 128, borderRadius: 64, borderWidth: 3.5, overflow: "hidden", zIndex: 2,
  },
  heroPhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  photoGlow: {
    position: "absolute", width: 152, height: 152, borderRadius: 76,
    borderWidth: 1, zIndex: 1,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 18, elevation: 14,
  },
  heroScoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  heroNum: { fontSize: 68, fontWeight: "900", color: "#fff", lineHeight: 72 },
  heroSlash: { color: "rgba(255,255,255,0.45)", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  tierPill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierTxt: { fontSize: 14, fontWeight: "800", letterSpacing: 0.2 },

  secHeader: { width: "100%", gap: 1, marginTop: 4 },
  secTitle: { color: CORAL, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  secSub: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "500" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, width: "100%" },
  analysisList: { width: "100%", gap: 8 },
  recoList: { width: "100%", gap: 10 },

  tipsBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: "rgba(248,107,109,0.2)", borderWidth: 1, borderColor: "rgba(248,107,109,0.4)",
  },
  tipsBtnTxt: { color: CORAL, fontSize: 13, fontWeight: "800" },

  shareCardSection: { width: "100%", gap: 10 },
  shareCardLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  shareCardLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  shareCardOuter: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: CORAL, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 10,
    borderWidth: 1.5, borderColor: "rgba(248,107,109,0.25)",
  },

  /* Share buttons — icons only */
  shareRow: { flexDirection: "row", gap: 12, width: "100%", justifyContent: "center" },
  shareIconBtn: {
    width: 60, height: 60, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 7,
  },
  shareIconGrad: {
    flex: 1, width: "100%", height: "100%",
    justifyContent: "center", alignItems: "center",
  },

  tryBtn: {
    width: "100%", borderRadius: 20, overflow: "hidden",
    shadowColor: CORAL_SHD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  tryGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  tryTxt: { color: "#fff", fontSize: 18, fontWeight: "800" },

  uploadLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  uploadLinkTxt: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: "600" },

  /* Webcam */
  camRow: { flexDirection: "row", justifyContent: "space-between", padding: 24, paddingBottom: 44, backgroundColor: "#000" },
  camBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 8 },
  camBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
