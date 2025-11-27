import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native";
import { Spacing, AppColors } from "@/constants/theme";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: Spacing.sm,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.primary,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
