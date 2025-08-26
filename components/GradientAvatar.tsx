import { FontFamily } from "@/constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

interface GradientAvatarProps {
  name?: string;
  colors?: [string, string];
  size?: number;
  style?: any;
}

export function GradientAvatar({
  name,
  colors = ["#FF8A65", "#FFAB91"],
  size = 60,
  style,
}: GradientAvatarProps) {
  // Get initials from name if provided
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const initials = name ? getInitials(name) : "";

  return (
    <LinearGradient
      colors={colors}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {initials && (
        <ThemedText style={[styles.initials, { fontSize: size * 0.4 }]}>
          {initials}
        </ThemedText>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  initials: {
    color: "white",
    fontFamily: FontFamily.medium,
    textAlign: "center",
    fontWeight: "600",
  },
});
