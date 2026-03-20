import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Modal, Platform, Alert, ScrollView, Linking } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { playButtonSound } from "@/utils/soundUtils";

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
        setPhotoUri(result.assets[0].uri);
        await processAnalysis();
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
        setPhotoUri(result.assets[0].uri);
        await processAnalysis();
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
          setPhotoUri(photo.uri);
          setShowWebCam(false);
          await processAnalysis();
        }
      } catch (err) {
        console.log("Error capturing photo:", err);
      }
    }
  };

  const handleShareForApp = async (app: "whatsapp" | "instagram" | "snapchat") => {
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
        dialogTitle: `Share your Lookmaxing Score on ${app}`,
      });
    } catch (error) {
      console.log("Error sharing to app:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#ABBFF2", "#BCCFFA"]}
      style={styles.container}
    >
      <Modal visible={isAnalyzing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.analysisModal}>
            <ActivityIndicator size="large" color={CARD_PINK} />
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

      {/* ── Custom Header ── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.headerButton}
          onPress={async () => {
            await playButtonSound();
            navigation.goBack();
          }}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={32} color={CARD_PINK} />
        </Pressable>

        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Rizz AI</Text>
        </View>

        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!scores ? (
          <View style={styles.uploadContainer}>
            <View style={styles.welcomeContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="face-man-shimmer" size={50} color="white" />
              </View>
              <Text style={styles.title}>Lookmaxing</Text>
              <Text style={styles.subtitle}>Get your AI-powered glow-up scores.{"\n"}Discover your unique features!</Text>
            </View>

            <View style={styles.buttonsColumn}>
              <Pressable style={styles.uploadButton} onPress={async () => {
                await playButtonSound();
                handleUploadPhoto();
              }}>
                <Ionicons name="image" size={24} color="white" />
                <Text style={styles.buttonText}>Upload Photo</Text>
              </Pressable>

              <Pressable style={styles.selfieButton} onPress={async () => {
                await playButtonSound();
                handleTakeSelfie();
              }}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.buttonText}>Take Selfie</Text>
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
                end={{ x: 0.5, y: 1 }}
                style={styles.scoreCard}
              >
                {/* Header: Score & Photo */}
                <View style={styles.cardHeader}>
                  <Text style={styles.overallText}>You're a {scores.overall}</Text>
                  <View style={styles.photoContainer}>
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.userPhoto} />
                    ) : (
                       <Ionicons name="person" size={40} color="white" />
                    )}
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
                <Ionicons name="chatbubble" size={30} color="white" />
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
              <Text style={styles.resetButtonText}>Analyze Another Photo</Text>
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
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "LilitaOne-Regular",
    color: CARD_PINK,
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    backgroundColor: CARD_PINK,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#D95657",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontFamily: "LilitaOne-Regular",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: "#4A4A4A",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 28,
    fontWeight: "600",
  },
  buttonsColumn: {
    width: "100%",
    gap: 20,
    maxWidth: 320,
  },
  uploadButton: {
    backgroundColor: CARD_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    borderRadius: 35,
    gap: 12,
    shadowColor: "#D95657",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  selfieButton: {
    backgroundColor: CARD_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    borderRadius: 35,
    gap: 12,
    shadowColor: "#D95657",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  analysisModal: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 50,
    alignItems: "center",
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  analysisText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  webcamModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    flex: 1,
  },
  webcamControls: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingBottom: 50,
  },
  webcamBtn: {
    backgroundColor: CARD_PINK,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  webcamCancelBtn: {
    backgroundColor: "#333",
  },
  webcamBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  shareHeaderTitle: {
    color: "#000",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 30,
  },
  cardWrapper: {
    width: "100%",
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  scoreCard: {
    width: "100%",
    padding: 30,
    paddingTop: 50,
    paddingBottom: 50,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  overallText: {
    color: "white",
    fontSize: 48,
    fontWeight: "900",
  },
  photoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "white",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scoreList: {
    gap: 20,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowEmoji: {
    fontSize: 32,
  },
  rowLabelText: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },
  rowScoreText: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  shareRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 40,
    marginBottom: 20,
    justifyContent: "center",
  },
  shareIconBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
  },
  resetButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
