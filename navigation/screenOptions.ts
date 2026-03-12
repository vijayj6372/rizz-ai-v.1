import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";

interface ScreenOptionsParams {
  theme: {
    backgroundRoot: string;
    text: string;
  };
  isDark: boolean;
  transparent?: boolean;
}

export const getCommonScreenOptions = ({
  theme,
  isDark,
  transparent = true,
}: ScreenOptionsParams): NativeStackNavigationOptions => ({
  headerTitleAlign: "center",
  headerTransparent: transparent,
  headerBlurEffect: isDark ? "dark" : "light",
  headerTintColor: "#F6766E",
  headerStyle: {
    backgroundColor: "transparent",
  },
  gestureEnabled: true,
  gestureDirection: "horizontal",
  fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
  contentStyle: {
    backgroundColor: theme.backgroundRoot,
  },
});
