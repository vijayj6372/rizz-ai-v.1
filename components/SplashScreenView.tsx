import React, { useEffect } from "react";
import { StyleSheet, View, Image, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface SplashScreenViewProps {
    onFinish: () => void;
}

export default function SplashScreenView({ onFinish }: SplashScreenViewProps) {
    // Logo animation values
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.7);

    // Glow/shimmer behind the logo
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(0.5);

    // Outer container fade-out
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        // 1. Glow fades in
        glowOpacity.value = withTiming(0.6, {
            duration: 800,
            easing: Easing.out(Easing.quad),
        });
        glowScale.value = withTiming(1.2, {
            duration: 900,
            easing: Easing.out(Easing.quad),
        });

        // 2. Logo pops in with spring-like overshoot feel
        logoOpacity.value = withDelay(
            200,
            withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
        );
        logoScale.value = withDelay(
            200,
            withSequence(
                withTiming(1.08, { duration: 500, easing: Easing.out(Easing.back(2)) }),
                withTiming(1.0, { duration: 250, easing: Easing.inOut(Easing.quad) })
            )
        );

        // 3. Glow pulses gently
        glowOpacity.value = withDelay(
            1000,
            withSequence(
                withTiming(0.9, { duration: 400, easing: Easing.inOut(Easing.quad) }),
                withTiming(0.5, { duration: 400, easing: Easing.inOut(Easing.quad) })
            )
        );

        // 4. Everything fades out -> call onFinish
        const fadeOutDelay = 1900;
        containerOpacity.value = withDelay(
            fadeOutDelay,
            withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }, () => {
                runOnJS(onFinish)();
            })
        );
    }, []);

    const logoAnimStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const glowAnimStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const containerAnimStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerAnimStyle]}>
            <LinearGradient
                colors={["#0D0520", "#1A0A2E", "#2D1055"]}
                style={StyleSheet.absoluteFill}
            />

            {/* Radial glow behind logo */}
            <Animated.View style={[styles.glow, glowAnimStyle]} />

            {/* Logo */}
            <Animated.View style={[styles.logoWrapper, logoAnimStyle]}>
                <Image
                    source={require("../assets/images/rizz ai - logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
}

const LOGO_SIZE = width * 0.62;
const GLOW_SIZE = LOGO_SIZE * 1.8;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    glow: {
        position: "absolute",
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        backgroundColor: "#C44FDB",
        // Blur is simulated via layered shadows
        shadowColor: "#CC55FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 80,
        elevation: 20,
    },
    logoWrapper: {
        shadowColor: "#FF66FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 30,
        elevation: 15,
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
    },
});
