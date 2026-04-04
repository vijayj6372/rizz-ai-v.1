import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import PickupLineScreen from "@/screens/PickupLineScreen";
import UploadScreenshotScreen from "@/screens/UploadScreenshotScreen";
import LookmaxingScreen from "@/screens/LookmaxingScreen";
import FunFeaturesScreen from "@/screens/FunFeaturesScreen";
import RoastMySelfieScreen from "@/screens/RoastMySelfieScreen";
import RateMyCrushScreen from "@/screens/RateMyCrushScreen";
import HotOrNotScreen from "@/screens/HotOrNotScreen";
import LookmaxingTipsScreen from "@/screens/LookmaxingTipsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type RootStackParamList = {
  Home: undefined;
  PickupLine: undefined;
  UploadScreenshot: undefined;
  Lookmaxing: undefined;
  FunFeatures: undefined;
  RoastMySelfie: undefined;
  RateMyCrush: undefined;
  HotOrNot: undefined;
  LookmaxingTips: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadScreenshot"
        component={UploadScreenshotScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PickupLine"
        component={PickupLineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Lookmaxing"
        component={LookmaxingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FunFeatures"
        component={FunFeaturesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoastMySelfie"
        component={RoastMySelfieScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RateMyCrush"
        component={RateMyCrushScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HotOrNot"
        component={HotOrNotScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LookmaxingTips"
        component={LookmaxingTipsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
