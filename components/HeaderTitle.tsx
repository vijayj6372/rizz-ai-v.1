import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native";
import { AppColors } from "@/constants/theme";

interface HeaderTitleProps {
  title: string;
  showIcon?: boolean;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  return (
    <View style={styles.container}>
      {/* Layered text to mimic the thick white outline style from the provided image */}
      <View style={styles.layerWrapper} pointerEvents="none">
        <Text style={[styles.title, styles.outline, { transform: [{ translateX: -3 }, { translateY: 0 }] }]}>
          {title}
        </Text>
        <Text style={[styles.title, styles.outline, { transform: [{ translateX: 3 }, { translateY: 0 }] }]}>
          {title}
        </Text>
        <Text style={[styles.title, styles.outline, { transform: [{ translateX: 0 }, { translateY: -3 }] }]}>
          {title}
        </Text>
        <Text style={[styles.title, styles.outline, { transform: [{ translateX: 0 }, { translateY: 3 }] }]}>
          {title}
        </Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  icon: {
    width: 0,
    height: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: AppColors.primary,
    fontFamily: "LilitaOne-Regular",
    textAlign: "center",
    lineHeight: 30,
  },
  outline: {
    position: "absolute",
    color: AppColors.white,
    zIndex: 0,
  },
  layerWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
