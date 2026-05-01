import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
  ScrollView,
  Animated,
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

const VERDICTS: { min: number; label: string; emoji: string; color: string; sub: string }[] = [
  { min: 9,   label: "Certified Chad",   emoji: "🔱", color: "#4CAF50", sub: "You're in the top 5%. Genetics blessed you." },
  { min: 8,   label: "Top 10%",          emoji: "🔥", color: "#8BC34A", sub: "Consistently above average. Keep optimizing." },
  { min: 7,   label: "Above Average",    emoji: "✨", color: "#FF9800", sub: "Solid foundation. Glow-up is very achievable." },
  { min: 6,   label: "Solid Baseline",   emoji: "💪", color: "#FF6B35", sub: "Good starting point. Lots of room to grow." },
  { min: 0,   label: "Rising Star",      emoji: "🌱", color: "#E040A0", sub: "Every top 1% person started somewhere." },
];

const GLOW_TIPS = [
  { icon: "💈", title: "Get a fresh haircut every 3-4 weeks", desc: "A maintained cut signals you have your life together. Consistency in cuts keeps you looking polished even on lazy days.", impact: "🔥 High Impact", color: "#FF6B35" },
  { icon: "💧", title: "Start a 3-step skincare routine", desc: "Cleanser → Moisturizer → SPF. Non-negotiable. SPF alone prevents aging better than any cream on the market.", impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "🏋️", title: "Hit the gym 3-4x per week", desc: "Muscle transforms your face AND body. Jaw gets more defined, face thins out, posture improves visibly.", impact: "🔥 High Impact", color: "#FF1744" },
  { icon: "🧍", title: "Fix your posture immediately", desc: "Shoulders back, chest up, chin parallel to floor. Instant height, dominance, and attractiveness boost. Do it right now.", impact: "✨ Quick Win", color: "#FF9800" },
  { icon: "😴", title: "Sleep 7-9 hours every night", desc: "Sleep deprivation shows instantly in your skin, eyes, and energy. 8 hours is a better investment than any supplement.", impact: "🔥 High Impact", color: "#4CAF50" },
  { icon: "🌞", title: "Wear SPF 30+ every morning", desc: "UV damage is the number one cause of premature aging. Apply even on cloudy days. The single best anti-aging move.", impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "😁", title: "Whiten your teeth", desc: "Whitening strips used consistently give you a celebrity smile for $20. The ROI on this single purchase is insane.", impact: "✨ Quick Win", color: "#29B6F6" },
  { icon: "🤨", title: "Groom your eyebrows monthly", desc: "Unibrows and wild brows drop your attractiveness score significantly. Threading or waxing takes 20 minutes and lasts a month.", impact: "✨ Quick Win", color: "#E040A0" },
  { icon: "🍷", title: "Reduce alcohol significantly", desc: "Alcohol causes facial bloating within 24 hours, disrupts sleep, and dramatically ages skin. Cut it by 80% and see the change.", impact: "🔥 High Impact", color: "#FF1744" },
  { icon: "💧", title: "Drink 3 liters of water daily", desc: "Dehydration causes dull skin, dark circles, poor metabolism. Water is the cheapest glow-up there is.", impact: "✨ Quick Win", color: "#29B6F6" },
  { icon: "🌹", title: "Find a signature cologne", desc: "Scent is processed in the same brain region as memory and emotion. A good cologne makes you unforgettable.", impact: "✨ Quick Win", color: "#E040A0" },
  { icon: "👔", title: "Wear clothes that actually fit", desc: "Poorly fitted clothes undermine even great genetics. Tailor one outfit and see how differently people treat you.", impact: "⚡ Medium", color: "#9C27B0" },
  { icon: "🥩", title: "Eat 1g protein per lb of bodyweight", desc: "Muscle requires protein. So does hair, skin elasticity, and nail strength. Most people eat half of what they need.", impact: "🔥 High Impact", color: "#FF9800" },
  { icon: "🧴", title: "Use retinol 2-3x per week at night", desc: "Retinol speeds up cell turnover, reduces wrinkles, and fades hyperpigmentation. The gold standard of anti-aging.", impact: "🔥 High Impact", color: "#00CFA8" },
  { icon: "🪒", title: "Maintain your beard or shave clean", desc: "Patchy stubble is the enemy. Either grow it fully, maintain it precisely, or shave clean. No in-between.", impact: "✨ Quick Win", color: "#E040A0" },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

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
  const viewRef = useRef<View>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (phase === "loading") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
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
      await new Promise((r) => setTimeout(r, 500));
    }

    triggerHaptic();
    const overall = generateScore();
    setScores({
      masculinity: generateScore(),
      cheekBones: generateScore(),
      jawline: generateScore(),
      eyes: generateScore(),
      hair: generateScore(),
      skin: generateScore(),
      overall,
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
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (res.assets?.[0]) {
        setPhotoUri(res.assets[0].uri);
        runAnalysis();
      }
    } catch (e) {
      setPhase("upload");
    }
  };

  const handleTakeSelfie = async () => {
    if (Platform.OS === "web") {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) {
          Alert.alert("Permission Required", "Please allow camera access.");
          return;
        }
      }
      setShowWebCam(true);
      return;
    }
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Please allow camera access.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });
      if (res.assets?.[0]) {
        setPhotoUri(res.assets[0].uri);
        runAnalysis();
      }
    } catch (e) {
      setPhase("upload");
    }
  };

  const captureWebcamPhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        if (photo?.uri) {
          setPhotoUri(photo.uri);
          setShowWebCam(false);
          runAnalysis();
        }
      } catch (err) {}
    }
  };

  const handleShare = async () => {
    try {
      if (!viewRef.current) return;
      const uri = await captureRef(viewRef, { format: "png", quality: 0.9 });
      const isAvail = await Sharing.isAvailableAsync();
      if (!isAvail) return;
      await Sharing.shareAsync(uri, { dialogTitle: "Share your Look Score!" });
    } catch (e) {}
  };

  const handleTryAnother = () => {
    setPhotoUri(null);
    setScores(null);
    setPhase("upload");
  };

  const verdict = scores ? getVerdict(scores.overall) : null;

  return (
    <LinearGradient colors={["#ABBFF2", "#BCCFFA"]} style={styles.container}>
      {/* Web Camera Modal */}
      <Modal visible={showWebCam} transparent={false} animationType="slide">
        <View style={styles.webcamModal}>
          <CameraView style={styles.cameraView} ref={cameraRef} facing="front" />
          <View style={styles.webcamControls}>
            <Pressable style={[styles.webcamBtn, { backgroundColor: "#333" }]} onPress={() => setShowWebCam(false)}>
              <Text style={styles.webcamBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.webcamBtn, { backgroundColor: CARD_PINK }]} onPress={captureWebcamPhoto}>
              <Ionicons name="camera" size={22} color="white" />
              <Text style={styles.webcamBtnText}>Capture</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backBtn} onPress={async () => { await playButtonSound(); navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={28} color={CARD_PINK} />
        </Pressable>
        <Text style={styles.headerTitle}>Lookmaxing</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── UPLOAD PHASE ── */}
        {phase === "upload" && (
          <View style={styles.uploadPhase}>
            {/* Hero */}
            <View style={styles.heroSection}>
              <LinearGradient
                colors={["#FF7A26", "#F2226B"]}
                style={styles.heroIcon}
              >
                <MaterialCommunityIcons name="face-man-shimmer" size={52} color="#fff" />
              </LinearGradient>
              <Text style={styles.heroTitle}>Get Your Look Score</Text>
              <Text style={styles.heroSub}>AI analyzes 6 key attractiveness metrics and gives you an honest score out of 10</Text>
            </View>

            {/* Photo Placeholder */}
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoPlaceholderInner}>
                <Ionicons name="camera-outline" size={48} color="rgba(248,107,109,0.4)" />
                <Text style={styles.photoPlaceholderText}>Your photo appears here</Text>
              </View>
            </View>

            {/* Info pills */}
            <View style={styles.pillRow}>
              <InfoPill icon="🔒" text="100% Private" />
              <InfoPill icon="📴" text="Works Offline" />
              <InfoPill icon="⚡" text="Instant" />
            </View>

            {/* Buttons */}
            <View style={styles.btnCol}>
              <Pressable
                style={styles.primaryBtn}
                onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}
              >
                <LinearGradient colors={["#FF7A26", "#F2226B"]} style={styles.primaryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="image" size={24} color="#fff" />
                  <Text style={styles.primaryBtnText}>Upload Photo</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.secondaryBtn}
                onPress={async () => { await playButtonSound(); handleTakeSelfie(); }}
              >
                <Ionicons name="camera" size={22} color={CARD_PINK} />
                <Text style={styles.secondaryBtnText}>Take Selfie</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── LOADING PHASE ── */}
        {phase === "loading" && (
          <View style={styles.loadingPhase}>
            {/* Photo thumbnail */}
            {photoUri && (
              <Animated.View style={[styles.loadingPhotoWrap, { transform: [{ scale: pulseAnim }] }]}>
                <Image source={{ uri: photoUri }} style={styles.loadingPhoto} />
                <LinearGradient
                  colors={["transparent", "rgba(248,107,109,0.8)"]}
                  style={styles.loadingPhotoOverlay}
                />
                <View style={styles.loadingOverlayContent}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              </Animated.View>
            )}

            <View style={styles.loadingCard}>
              <Text style={styles.loadingTitle}>AI is Analyzing...</Text>
              {LOADING_STAGES.map((stage, i) => (
                <View key={stage} style={styles.stageRow}>
                  <View style={[
                    styles.stageDot,
                    i < loadingStage && styles.stageDotDone,
                    i === loadingStage && styles.stageDotActive,
                  ]} />
                  <Text style={[
                    styles.stageText,
                    i === loadingStage && styles.stageTextActive,
                    i < loadingStage && styles.stageTextDone,
                  ]}>
                    {stage}
                  </Text>
                  {i < loadingStage && (
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginLeft: "auto" }} />
                  )}
                  {i === loadingStage && (
                    <ActivityIndicator size={14} color={CARD_PINK} style={{ marginLeft: "auto" }} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === "result" && scores && verdict && (
          <View style={styles.resultPhase}>

            {/* Score header card */}
            <View style={[styles.scoreHeaderCard, { borderColor: verdict.color + "44" }]}>
              {/* Photo + score overlay */}
              {photoUri && (
                <View style={styles.resultPhotoWrap}>
                  <Image source={{ uri: photoUri }} style={styles.resultPhoto} />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.75)"]}
                    style={styles.resultPhotoOverlay}
                  />
                  <View style={styles.scoreOverlay}>
                    <Text style={[styles.scoreOverlayNum, { color: verdict.color }]}>{scores.overall}</Text>
                    <Text style={styles.scoreOverlayDenom}>/10</Text>
                  </View>
                </View>
              )}

              {/* Verdict + stars */}
              <View style={styles.verdictSection}>
                <View style={[styles.verdictBadge, { backgroundColor: verdict.color }]}>
                  <Text style={styles.verdictBadgeText}>{verdict.emoji} {verdict.label}</Text>
                </View>
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < Math.round(scores.overall / 2) ? "star" : "star-outline"}
                      size={22}
                      color={i < Math.round(scores.overall / 2) ? verdict.color : "rgba(0,0,0,0.15)"}
                    />
                  ))}
                </View>
                <Text style={styles.verdictSub}>{verdict.sub}</Text>
              </View>
            </View>

            {/* Breakdown bars — shareable card */}
            <View ref={viewRef} collapsable={false}>
              <LinearGradient
                colors={["#FF7A26", "#F2226B", "#D10F80"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.breakdownCard}
              >
                <Text style={styles.breakdownTitle}>Look Breakdown</Text>
                <View style={styles.breakdownList}>
                  {[
                    { emoji: "💪", label: "Masculinity", score: scores.masculinity },
                    { emoji: "🧔", label: "Cheek Bones", score: scores.cheekBones },
                    { emoji: "👄", label: "Jawline",     score: scores.jawline },
                    { emoji: "👀", label: "Eyes",        score: scores.eyes },
                    { emoji: "💇", label: "Hair",        score: scores.hair },
                    { emoji: "💆", label: "Skin",        score: scores.skin },
                  ].map((m) => (
                    <View key={m.label} style={styles.metricRow}>
                      <Text style={styles.metricEmoji}>{m.emoji}</Text>
                      <Text style={styles.metricLabel}>{m.label}</Text>
                      <View style={styles.metricBarBg}>
                        <View style={[styles.metricBarFill, { width: `${(m.score / 10) * 100}%` as any }]} />
                      </View>
                      <Text style={styles.metricScore}>{m.score}/10</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>

            {/* Lookmaxing Tip */}
            <View style={[styles.tipCard, { borderLeftColor: glowTip.color }]}>
              <View style={styles.tipCardHeader}>
                <View style={[styles.tipIconBox, { backgroundColor: glowTip.color + "20" }]}>
                  <Text style={styles.tipIconEmoji}>{glowTip.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.tipLabelRow}>
                    <View style={[styles.tipImpactBadge, { backgroundColor: glowTip.color }]}>
                      <Text style={styles.tipImpactText}>{glowTip.impact}</Text>
                    </View>
                  </View>
                  <Text style={styles.tipTitle}>{glowTip.title}</Text>
                </View>
              </View>
              <Text style={styles.tipDesc}>{glowTip.desc}</Text>
              <Pressable
                style={styles.tipMoreBtn}
                onPress={async () => { await playButtonSound(); navigation.navigate("LookmaxingTips"); }}
              >
                <Text style={[styles.tipMoreBtnText, { color: glowTip.color }]}>See all 200 tips →</Text>
              </Pressable>
            </View>

            {/* Share buttons */}
            <View style={styles.shareSection}>
              <Text style={styles.shareLabel}>Share your score</Text>
              <View style={styles.shareRow}>
                <Pressable style={[styles.shareBtn, { backgroundColor: "#25D366" }]} onPress={async () => { await playButtonSound(); handleShare(); }}>
                  <Ionicons name="chatbubble" size={26} color="white" />
                </Pressable>
                <Pressable onPress={async () => { await playButtonSound(); handleShare(); }}>
                  <LinearGradient
                    colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]}
                    style={styles.shareBtn}
                  >
                    <Ionicons name="logo-instagram" size={28} color="white" />
                  </LinearGradient>
                </Pressable>
                <Pressable style={[styles.shareBtn, { backgroundColor: "#FFFC00" }]} onPress={async () => { await playButtonSound(); handleShare(); }}>
                  <FontAwesome name="snapchat-ghost" size={28} color="black" />
                </Pressable>
              </View>
            </View>

            {/* Try Another */}
            <Pressable
              style={styles.tryAnotherBtn}
              onPress={async () => { await playButtonSound(); handleTryAnother(); }}
            >
              <LinearGradient colors={["#FF7A26", "#F2226B"]} style={styles.tryAnotherGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.tryAnotherText}>Try Another Photo</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.uploadAnotherLink}
              onPress={async () => { await playButtonSound(); handleUploadPhoto(); }}
            >
              <Ionicons name="image-outline" size={16} color="rgba(0,0,0,0.4)" />
              <Text style={styles.uploadAnotherLinkText}>Upload from gallery instead</Text>
            </Pressable>

          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function InfoPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={pillStyles.pill}>
      <Text style={pillStyles.icon}>{icon}</Text>
      <Text style={pillStyles.text}>{text}</Text>
    </View>
  );
}
const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.8)",
  },
  icon: { fontSize: 12 },
  text: { color: "#444", fontSize: 12, fontWeight: "700" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44, height: 44,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "LilitaOne-Regular",
    color: CARD_PINK,
    letterSpacing: 0.5,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: "center",
  },

  /* ── Upload Phase ── */
  uploadPhase: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  heroSection: {
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F2226B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "LilitaOne-Regular",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(0,0,0,0.5)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
    maxWidth: 280,
  },

  photoPlaceholder: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: "rgba(248,107,109,0.3)",
    borderStyle: "dashed",
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderInner: {
    alignItems: "center",
    gap: 10,
  },
  photoPlaceholderText: {
    color: "rgba(248,107,109,0.5)",
    fontWeight: "700",
    fontSize: 14,
  },

  pillRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  btnCol: {
    width: "100%",
    maxWidth: 320,
    gap: 14,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: SHADOW_PINK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    borderColor: CARD_PINK + "60",
  },
  secondaryBtnText: {
    color: CARD_PINK,
    fontSize: 18,
    fontWeight: "800",
  },

  /* ── Loading Phase ── */
  loadingPhase: {
    width: "100%",
    alignItems: "center",
    gap: 24,
    paddingTop: 8,
  },
  loadingPhotoWrap: {
    width: 160,
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    shadowColor: SHADOW_PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  loadingPhoto: { width: "100%", height: "100%" },
  loadingPhotoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
  },
  loadingOverlayContent: {
    position: "absolute", bottom: 16, alignSelf: "center",
  },
  loadingCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stageDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  stageDotDone: { backgroundColor: "#4CAF50" },
  stageDotActive: { backgroundColor: CARD_PINK },
  stageText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.35)",
    fontWeight: "600",
    flex: 1,
  },
  stageTextActive: { color: "#1a1a1a" },
  stageTextDone: { color: "#4CAF50", textDecorationLine: "line-through" },

  /* ── Result Phase ── */
  resultPhase: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    paddingTop: 4,
  },

  scoreHeaderCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  resultPhotoWrap: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  resultPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  resultPhotoOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 100,
  },
  scoreOverlay: {
    position: "absolute",
    bottom: 14,
    left: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  scoreOverlayNum: {
    fontSize: 56,
    fontWeight: "900",
    lineHeight: 60,
  },
  scoreOverlayDenom: {
    fontSize: 24,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    marginBottom: 6,
  },

  verdictSection: {
    padding: 16,
    alignItems: "flex-start",
    gap: 8,
  },
  verdictBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verdictBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  verdictSub: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  /* Breakdown Card (shareable) */
  breakdownCard: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  breakdownTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 16,
  },
  breakdownList: {
    gap: 14,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricEmoji: { fontSize: 22, width: 28 },
  metricLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontWeight: "700",
    width: 100,
  },
  metricBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 4,
  },
  metricScore: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    width: 40,
    textAlign: "right",
  },

  /* Lookmaxing Tip Card */
  tipCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 22,
    padding: 16,
    borderLeftWidth: 4,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  tipCardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  tipIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tipIconEmoji: { fontSize: 24 },
  tipLabelRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  tipImpactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tipImpactText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  tipTitle: {
    color: "#1a1a1a",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  tipDesc: {
    color: "rgba(0,0,0,0.55)",
    fontSize: 13,
    lineHeight: 20,
  },
  tipMoreBtn: {
    alignSelf: "flex-end",
  },
  tipMoreBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },

  /* Share */
  shareSection: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  shareLabel: {
    color: "rgba(0,0,0,0.4)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  shareRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  shareBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  /* Try Another */
  tryAnotherBtn: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: SHADOW_PINK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  tryAnotherGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  tryAnotherText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  uploadAnotherLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  uploadAnotherLinkText: {
    color: "rgba(0,0,0,0.4)",
    fontSize: 13,
    fontWeight: "600",
  },

  /* Webcam */
  webcamModal: { flex: 1, backgroundColor: "#000" },
  cameraView: { flex: 1 },
  webcamControls: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingBottom: 44,
  },
  webcamBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  webcamBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
