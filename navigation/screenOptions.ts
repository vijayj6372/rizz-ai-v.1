import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";


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
  fullScreenGestureEnabled: true,
  contentStyle: {
    backgroundColor: theme.backgroundRoot,
  },
});
