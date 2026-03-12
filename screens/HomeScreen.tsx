import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, Text, Image, Modal, Linking } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  runOnJS,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing } from "@/constants/theme";
import { playButtonSound } from "@/utils/soundUtils";
import { BannerAd, BannerAdSize, RewardedAd, RewardedAdEventType, TestIds, useRewardedAd } from 'react-native-google-mobile-ads';
import { getLookmaxingCredits, addLookmaxingCredits } from "@/utils/creditUtils";
import { useFocusEffect } from "@react-navigation/native";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ActionCardProps {
  renderIcon: () => React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function triggerHaptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

function ActionCard({ renderIcon, title, subtitle, onPress }: ActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = async () => {
    runOnJS(triggerHaptic)();
    await playButtonSound();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionCard, animatedStyle]}
    >
      <View style={styles.iconWrapper}>{renderIcon()}</View>
      <Text style={styles.actionCardTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
      ) : null}
    </AnimatedPressable>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [credits, setCredits] = useState(0);

  const { isLoaded, isEarnedReward, show, load, reward } = useRewardedAd(
    "ca-app-pub-3940256099942544/5224354917",
    { requestNonPersonalizedAdsOnly: true }
  );

  // Load ad on mount and when earned
  React.useEffect(() => {
    load();
  }, [load, isEarnedReward]);

  // Handle reward
  React.useEffect(() => {
    if (isEarnedReward) {
      const grantCredits = async () => {
        const newCredits = await addLookmaxingCredits(5);
        setCredits(newCredits);
        setShowAdModal(false);
        navigation.navigate("Lookmaxing");
      };
      grantCredits();
    }
  }, [isEarnedReward]);

  // Update credits when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      const updateCredits = async () => {
        const c = await getLookmaxingCredits();
        setCredits(c);
      };
      updateCredits();
    }, [])
  );



  const handleUploadScreenshot = async () => {
    navigation.navigate("UploadScreenshot");
  };

  const handleGetPickupLine = () => {
    navigation.navigate("PickupLine");
  };

  const handleLookmaxing = async () => {
    if (credits > 0) {
      navigation.navigate("Lookmaxing");
    } else {
      setShowAdModal(true);
    }
  };

  const handleClaimNow = async () => {
    await playButtonSound();
    if (isLoaded) {
      show();
    } else {
      // If ad not loaded, try to load again or show alert
      load();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  const handleSendEmail = async () => {
    const email = "vijayj6372@gmail.com";

    if (Platform.OS === "web") {
      Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`);
      return;
    }

    // Try opening native Gmail App explicitly
    const gmailUrl = Platform.OS === "ios"
      ? `googlegmail://co?to=${email}`
      : `intent://compose?to=${email}#Intent;scheme=mailto;package=com.google.android.gm;end`;

    try {
      const canOpen = await Linking.canOpenURL(gmailUrl);
      if (canOpen) {
        await Linking.openURL(gmailUrl);
        return;
      }
    } catch (e) {
      // Ignore checks failure
    }

    // Standard fallback to whatever default mail app is registered
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      // Final fallback to Web Gmail if device mailto routing fails completely
      Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`);
    }
  };

  return (
    <LinearGradient
      colors={["#ABBFF2", "#BCCFFA"]}
      style={styles.container}
    >
      <Modal visible={showSettings} transparent animationType="slide">
        <Pressable style={styles.settingsModalOverlay} onPress={() => setShowSettings(false)}>
          <Pressable style={styles.settingsCard} onPress={(e) => { /* stop propagation */ }}>
            <LinearGradient
              colors={["#FF6C6D", "#FF865A", "#F69C50"]}
              style={styles.settingsGradient}
            >
              <View style={styles.settingsContentArea}>
                <Pressable
                  style={styles.settingsLinkBtn}
                  onPress={async () => {
                    await playButtonSound();
                    handleSendEmail();
                  }}
                >
                  <Text style={styles.settingsLinkBtnText}>Send us an Email</Text>
                </Pressable>

                <Pressable
                  style={styles.settingsLinkBtn}
                  onPress={async () => {
                    await playButtonSound();
                    Linking.openURL("https://x.com/Vijay_Jadav_7");
                  }}
                >
                  <Text style={styles.settingsLinkBtnText}>About me</Text>
                </Pressable>

                <Pressable
                  style={styles.privacyLinkWrapper}
                  onPress={async () => {
                    await playButtonSound();
                    Linking.openURL("https://sites.google.com/view/rizz-ai-privacy-policy-com/home");
                  }}
                >
                  <Text style={styles.privacyLinkText}>Privacy Policy</Text>
                </Pressable>
              </View>
            </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>

      <Modal visible={showAdModal} transparent animationType="fade">
        <Pressable style={styles.adModalOverlay} onPress={() => setShowAdModal(false)}>
          <View style={styles.adModalCard}>
            <LinearGradient
              colors={["#FF6C6D", "#FF865A"]}
              style={styles.adModalGradient}
            >
              <View style={styles.adModalContent}>
                <MaterialCommunityIcons name="fire" size={80} color="#FFFFFF" />
                <Text style={styles.adModalTitle}>Become Hot!</Text>
                <Text style={styles.adModalSubtitle}>
                  Watch 1 ad to get {"\n"}5 Lookmaxing uploads
                </Text>
                
                <Pressable 
                  style={({ pressed }) => [
                    styles.claimButton,
                    { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
                  ]}
                  onPress={handleClaimNow}
                >
                  <Text style={styles.claimButtonText}>CLAIM NOW</Text>
                </Pressable>

                <Pressable onPress={async () => {
                  await playButtonSound();
                  setShowAdModal(false);
                }}>
                  <Text style={styles.cancelText}>Maybe later</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </Pressable>
      </Modal>

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        {/* ── Settings Button (top-left corner, absolute positioning) ── */}
        <Pressable
          style={[styles.settingsButton, { top: insets.top + 16 }]}
          onPress={async () => {
            await playButtonSound();
            setShowSettings(true);
          }}
        >
          <Ionicons name="settings-sharp" size={26} color="#FFFFFF" />
        </Pressable>

        {/* ── Title Area (centered, below settings button) ── */}
        <View style={styles.titleContainer}>
          <View style={styles.titleWrapper}>
            {/* Shadow layer to emulate the soft drop shadow behind the white stroke */}
            <Text style={[styles.appTitleShadow, { transform: [{ translateX: 0 }, { translateY: 6 }] }]} aria-hidden>
              Rizz AI
            </Text>

            {/* Multiple white outline layers for an extra thick stroke effect */}
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -5 }, { translateY: 0 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 5 }, { translateY: 0 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 0 }, { translateY: -5 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 0 }, { translateY: 5 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -4 }, { translateY: -4 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 4 }, { translateY: -4 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -4 }, { translateY: 4 }] }]} aria-hidden>
              Rizz AI
            </Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 4 }, { translateY: 4 }] }]} aria-hidden>
              Rizz AI
            </Text>
            {/* Extra diagonals for maximum thickness and smoothness */}
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -2 }, { translateY: -5 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 2 }, { translateY: -5 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -2 }, { translateY: 5 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 2 }, { translateY: 5 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -5 }, { translateY: -2 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 5 }, { translateY: -2 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: -5 }, { translateY: 2 }] }]} aria-hidden>Rizz AI</Text>
            <Text style={[styles.appTitleOutline, { transform: [{ translateX: 5 }, { translateY: 2 }] }]} aria-hidden>Rizz AI</Text>

            {/* Main coral/pink title on top */}
            <Text style={styles.appTitle}>Rizz AI</Text>
          </View>
        </View>

        {/* ── Cards ── */}
        <View style={styles.cardsContainer}>
          {/* Card 1 – Upload Screenshot */}
          <ActionCard
            renderIcon={() => (
              <Ionicons name="scan" size={60} color="#FFFFFF" />
            )}
            title="Upload Screenshot"
            subtitle="of a Convo"
            onPress={handleUploadScreenshot}
          />

          {/* Card 2 – Pickup Line */}
          <ActionCard
            renderIcon={() => (
              <Ionicons name="chatbubble-outline" size={60} color="#FFFFFF" />
            )}
            title="Give me a pickup line"
            onPress={handleGetPickupLine}
          />

          {/* Card 3 – Lookmaxing */}
          <ActionCard
            renderIcon={() => (
              <MaterialCommunityIcons
                name="face-man-shimmer"
                size={60}
                color="#FFFFFF"
              />
            )}
            title="Lookmaxing"
            onPress={handleLookmaxing}
          />
        </View>

        {/* ── Banner Ad ── */}
        <View style={styles.adContainer}>
          <BannerAd
            unitId="ca-app-pub-3940256099942544/9214589741"
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const CARD_PINK = "#F86B6D"; // Exact pinkish-coral color
const SHADOW_PINK = "#D95657";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  /* ── Settings Modal ── */
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  settingsCard: {
    width: "100%",
    height: "65%", // Made slightly smaller
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  settingsGradient: {
    flex: 1,
  },
  settingsContentArea: {
    paddingTop: 80, // push buttons down
    alignItems: "center",
    gap: 30,
    paddingHorizontal: 20,
  },
  settingsLinkBtn: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 320,
    paddingVertical: 22,
    borderRadius: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  settingsLinkBtnText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
  },
  privacyLinkWrapper: {
    marginTop: 80, // push privacy link further down
    padding: 10,
  },
  privacyLinkText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "#FFFFFF",
  },
  settingsSparkle: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },


  /* ── Settings Button (top-left, absolute positioned) ── */
  settingsButton: {
    position: "absolute",
    left: 20,
    backgroundColor: CARD_PINK,
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: SHADOW_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ── Title Area (centered, sits between settings and cards) ── */
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 120, // Added more margin so there is clear spacing below settings button
  },
  titleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  appTitleShadow: {
    position: "absolute",
    fontSize: 76,
    fontFamily: "LilitaOne-Regular",
    color: "rgba(0, 0, 0, 0.12)", // Soft dark drop shadow for outline
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  appTitleOutline: {
    position: "absolute",
    fontSize: 76,
    fontFamily: "LilitaOne-Regular",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: 76,
    fontFamily: "LilitaOne-Regular",
    color: CARD_PINK,
    letterSpacing: 2,
  },

  /* ── Cards ── */
  cardsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 20,
    paddingBottom: 24,
  },
  actionCard: {
    backgroundColor: CARD_PINK,
    borderRadius: 36, // Noticeable rounded corners like image
    height: 175,
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: SHADOW_PINK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 22,
    fontWeight: "800", // Thicker bold text
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
  },
  actionCardSubtitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
  },
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 'auto',
    paddingTop: 10,
  },

  /* ── Ad Modal ── */
  adModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  adModalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  adModalGradient: {
    padding: 32,
  },
  adModalContent: {
    alignItems: "center",
    gap: 16,
  },
  adModalTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "LilitaOne-Regular",
  },
  adModalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  claimButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  claimButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FF6C6D",
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
    marginTop: 8,
  },
});
