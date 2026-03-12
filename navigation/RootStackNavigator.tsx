import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import PickupLineScreen from "@/screens/PickupLineScreen";
import UploadScreenshotScreen from "@/screens/UploadScreenshotScreen";
import LookmaxingScreen from "@/screens/LookmaxingScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type RootStackParamList = {
  Home: undefined;
  PickupLine: undefined;
  UploadScreenshot: undefined;
  Lookmaxing: undefined;
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
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UploadScreenshot"
        component={UploadScreenshotScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PickupLine"
        component={PickupLineScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Lookmaxing"
        component={LookmaxingScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
