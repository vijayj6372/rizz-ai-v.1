import React from "react";
import { Pressable, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import HomeScreen from "@/screens/HomeScreen";
import PickupLineScreen from "@/screens/PickupLineScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { AppColors, Spacing } from "@/constants/theme";

export type RootStackParamList = {
  Home: undefined;
  PickupLine: { fromScreenshot: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderRightButton() {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        padding: Spacing.xs,
      })}
    >
      <Feather name="plus" size={24} color={AppColors.primary} />
    </Pressable>
  );
}

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
        name="PickupLine"
        component={PickupLineScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Rizz AI" />,
          headerRight: () => <HeaderRightButton />,
        }}
      />
    </Stack.Navigator>
  );
}
