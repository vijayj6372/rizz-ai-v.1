import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Modal, Platform, Alert, ScrollView, Linking } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { playButtonSound } from "@/utils/soundUtils";
import { getLookmaxingCredits, spendLookmaxingCredit } from "@/utils/creditUtils";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "Lookmaxing">;

const CARD_PINK = "#F86B6D";


interface ScorecardData {
  masculinity: number;
  cheekBones: number;
  jawline: number;
  eyes: number;
  hair: number;
  skin: number;
  overall: number;
}

export default function LookmaxingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<ScorecardData | null>(null);
  const [credits, setCredits] = useState(0);

  // Load credits on mount
  React.useEffect(() => {
    const init = async () => {
      const c = await getLookmaxingCredits();
      setCredits(c);
    };
    init();
  }, []);

  const processAnalysis = async () => {
    setIsAnalyzing(true);
    setScores(null);

    // Simulate AI analysis delay
    setTimeout(async () => {
      setScores({
        masculinity: generateRandomScore(),
        cheekBones: generateRandomScore(),
        jawline: generateRandomScore(),
        eyes: generateRandomScore(),
        hair: generateRandomScore(),
        skin: generateRandomScore(),
        overall: generateRandomScore(),
      });
      setIsAnalyzing(false);
      const remaining = await spendLookmaxingCredit();
      setCredits(remaining);
    }, 2000);
  };

  // Web camera state
  const [showWebCam, setShowWebCam] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const viewRef = useRef<View>(null);

  // Generates scores between 5 and 10 but makes 10 rare.
  const generateRandomScore = () => {
    const r = Math.random();
    // probabilities (approx): 10 -> 3%, 9 -> 7%, 8 -> 15%, 7 -> 25%, 6 -> 30%, 5 -> 20%
    if (r < 0.03) return 10;
    if (r < 0.10) return 9;
    if (r < 0.25) return 8;
    if (r < 0.50) return 7;
    if (r < 0.80) return 6;
    return 5;
  };

  const handleUploadPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        if (Platform.OS !== "web") {
          Alert.alert("Permission Required", "Please allow access to your photo library to upload a photo.");
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        if (credits <= 0) {
          Alert.alert("Out of Credits", "You've used all your uploads. Come back later!");
          return;
        }
        setPhotoUri(result.assets[0].uri);
        processAnalysis();
      }
    } catch (error) {
      setIsAnalyzing(false);
      console.log("Error selecting image:", error);
    }
  };

  const handleTakeSelfie = async () => {
    if (Platform.OS === "web") {
      if (!permission?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          Alert.alert("Permission Required", "Please allow access to your camera to take a selfie.");
          return;
        }
      }
      setShowWebCam(true);
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your camera to take a selfie.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (result.assets && result.assets.length > 0) {
        if (credits <= 0) {
          Alert.alert("Out of Credits", "You've used all your uploads. Come back later!");
          return;
        }
        setPhotoUri(result.assets[0].uri);
        processAnalysis();
      }
    } catch (error) {
      setIsAnalyzing(false);
      console.log("Error taking selfie:", error);
    }
  };

  const captureWebcamPhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        if (photo && photo.uri) {
          if (credits <= 0) {
            setShowWebCam(false);
            Alert.alert("Out of Credits", "You've used all your uploads. Come back later!");
            return;
          }
          setPhotoUri(photo.uri);
          setShowWebCam(false);
          processAnalysis();
        }
      } catch (err) {
        console.log("Error capturing photo:", err);
      }
    }
  };



  const handleShare = async () => {
    try {
      if (!viewRef.current) return;

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 0.9,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing not available", "Sharing is not available on this platform.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: "Share your Lookmaxing Score",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleShareForApp = async (app: "whatsapp" | "instagram" | "snapchat") => {
    try {
      if (!viewRef.current) return;

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 0.9,
      });

      // Try open the target app first (deep link) so user is taken there if available,
      // then open the share sheet as a fallback so they can pick the app and attach the image.
      let scheme = "";
      if (app === "whatsapp") scheme = "whatsapp://send?text=";
      if (app === "instagram") scheme = "instagram://library";
      if (app === "snapchat") scheme = "snapchat://"

      try {
        const can = await Linking.canOpenURL(scheme || "");
        if (can && scheme) {
          // open app with a short message (some apps ignore params)
          await Linking.openURL(scheme + encodeURIComponent("Check out my Lookmaxing score!"));
        }
      } catch (e) {
        // ignore deep link failures and continue to share sheet
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing not available", "Sharing is not available on this platform.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: `Share your Lookmaxing Score on ${app}`,
      });
    } catch (error) {
      console.log("Error sharing to app:", error);
    }
  };

  return (
    <LinearGradient
      colors={[AppColors.background.gradientTop, AppColors.background.gradientBottom]}
      style={styles.container}
    >
      <Modal visible={isAnalyzing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.analysisModal}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.analysisText}>Analyzing your looks...</Text>
          </View>
        </View>
      </Modal>
      <Modal visible={showWebCam} transparent={false} animationType="slide">
        <View style={styles.webcamModal}>
          <CameraView style={styles.cameraView} ref={cameraRef} facing="front" />
          <View style={styles.webcamControls}>
            <Pressable style={[styles.webcamBtn, styles.webcamCancelBtn]} onPress={async () => {
              await playButtonSound();
              setShowWebCam(false);
            }}>
              <Text style={styles.webcamBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.webcamBtn} onPress={async () => {
              await playButtonSound();
              captureWebcamPhoto();
            }}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.webcamBtnText}>Capture</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Custom Header (back arrow + Rizz AI title) ── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        {/* Back Arrow */}
        <Pressable
          style={styles.headerButton}
          onPress={async () => {
            await playButtonSound();
            navigation.goBack();
          }}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={34} color={CARD_PINK} />
        </Pressable>

        {/* Rizz AI Title */}
        <View style={styles.headerTitleWrapper}>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: -3 }, { translateY: 0 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 3 }, { translateY: 0 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 0 }, { translateY: -3 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 0 }, { translateY: 3 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: -2 }, { translateY: -2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 2 }, { translateY: -2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: -2 }, { translateY: 2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={[styles.headerTitleOutline, { transform: [{ translateX: 2 }, { translateY: 2 }] }]} aria-hidden>
            Rizz AI
          </Text>
          <Text style={styles.headerTitle}>Rizz AI</Text>
        </View>

        {/* Empty spacer to balance the back arrow */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {!scores ? (
          <View style={styles.uploadContainer}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Rizz AI</Text>
            <Text style={styles.subtitle}>Upload a photo or take a selfie to get your AI-powered glow-up scores. {"\n"} Remaining: {credits} uploads</Text>

            <View style={styles.buttonsRow}>
              <Pressable style={styles.uploadButton} onPress={async () => {
                await playButtonSound();
                handleUploadPhoto();
              }}>
                <Ionicons name="image-outline" size={24} color="white" />
                <Text style={styles.uploadButtonText}>Upload Photo</Text>
              </Pressable>

              <Pressable style={styles.selfieButton} onPress={async () => {
                await playButtonSound();
                handleTakeSelfie();
              }}>
                <Ionicons name="camera-outline" size={24} color="white" />
                <Text style={styles.uploadButtonText}>Take Selfie</Text>
              </Pressable>
            </View>
          </View>

        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.shareHeaderTitle}>Share and compare with your friends</Text>

            {/* Scorecard View to Capture */}
            <View ref={viewRef} collapsable={false} style={styles.cardWrapper}>
              <LinearGradient
                colors={["#FF7A26", "#F2226B", "#D10F80"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.scoreCard}
              >
                {/* Header: Score & Photo */}
                <View style={styles.cardHeader}>
                  <Text style={styles.overallText}>You're a {scores.overall}</Text>
                  <View style={styles.photoContainer}>
                    {photoUri && <Image source={{ uri: photoUri }} style={styles.userPhoto} />}
                  </View>
                </View>

                {/* Score Rows */}
                <View style={styles.scoreList}>
                  <ScoreRow emoji="💪" label="Masculinity" score={scores.masculinity} />
                  <ScoreRow emoji="🧔" label="Cheek Bones" score={scores.cheekBones} />
                  <ScoreRow emoji="👄" label="Jawline" score={scores.jawline} />
                  <ScoreRow emoji="👀" label="Eyes" score={scores.eyes} />
                  <ScoreRow emoji="💇‍♂️" label="Hair" score={scores.hair} />
                  <ScoreRow emoji="💆‍♂️" label="Skin" score={scores.skin} />
                </View>
              </LinearGradient>
            </View>

            {/* Share Buttons */}
            <View style={styles.shareRow}>
              <Pressable style={[styles.shareIconBtn, { backgroundColor: "#25D366" }]} onPress={async () => {
                await playButtonSound();
                handleShareForApp("whatsapp");
              }}>
                <Ionicons name="logo-whatsapp" size={32} color="white" />
              </Pressable>

              <Pressable onPress={async () => {
                await playButtonSound();
                handleShareForApp("instagram");
              }}>
                <LinearGradient
                  colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]}
                  style={styles.shareIconBtn}
                >
                  <Ionicons name="logo-instagram" size={32} color="white" />
                </LinearGradient>
              </Pressable>

              <Pressable style={[styles.shareIconBtn, { backgroundColor: "#FFFC00" }]} onPress={async () => {
                await playButtonSound();
                handleShareForApp("snapchat");
              }}>
                <FontAwesome name="snapchat-ghost" size={32} color="black" />
              </Pressable>
            </View>

            <Pressable style={styles.resetButton} onPress={async () => {
              await playButtonSound();
              setScores(null);
            }}>
              <Text style={styles.resetButtonText}>Upload Another Photo</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function ScoreRow({ emoji, label, score }: { emoji: string; label: string; score: number }) {
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabelContainer}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
        <Text style={styles.rowLabelText}>{label}</Text>
      </View>
      <Text style={styles.rowScoreText}>{score}/10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ── Custom Header ── */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleOutline: {
    position: "absolute",
    fontSize: 30,
    fontFamily: "LilitaOne-Regular",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "LilitaOne-Regular",
    color: CARD_PINK,
    letterSpacing: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  uploadContainer: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: AppColors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#5A7A8A",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 26,
    marginBottom: Spacing.xl,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    backgroundColor: AppColors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: "#D95657",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  selfieButton: {
    backgroundColor: "#4A90D9",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: "#3570AA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  analysisModal: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing["3xl"],
    alignItems: "center",
    gap: Spacing.lg,
  },
  analysisText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textDark,
  },
  webcamModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    flex: 1,
  },
  webcamControls: {
    padding: Spacing["2xl"],
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingBottom: Spacing["4xl"],
  },
  webcamBtn: {
    backgroundColor: AppColors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  webcamCancelBtn: {
    backgroundColor: "#555",
  },
  webcamBtnText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  resultContainer: {

    width: "100%",
    alignItems: "center",
  },
  shareHeaderTitle: {
    color: "black",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  cardWrapper: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden", // ensures gradient respects border radius when capturing
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: "transparent",
  },
  scoreCard: {
    width: "100%",
    padding: Spacing.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  overallText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Bold" : "sans-serif-condensed", // Try to match the bold sleek font
  },
  photoContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "white",
    overflow: "hidden",
  },
  userPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scoreList: {
    gap: Spacing.lg,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  rowEmoji: {
    fontSize: 24,
  },
  rowLabelText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  rowScoreText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  shareRow: {
    flexDirection: "row",
    gap: Spacing["xl"],
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.xl,
    justifyContent: "center",
  },
  shareIconBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  resetButton: {
    marginTop: Spacing.md,
  },
  resetButtonText: {
    color: "#5A7A8A",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
