import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ACCENT } from "./OnboardingShell";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChoiceCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  /** Radio renders a dot, checkbox renders a tick. */
  variant?: "radio" | "checkbox";
}

export function ChoiceCard({
  label,
  sublabel,
  selected,
  onPress,
  variant = "checkbox",
}: ChoiceCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const pressed = useSharedValue(0);
  const fill = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    fill.value = withTiming(selected ? 1 : 0, { duration: 180 });
  }, [selected, fill]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
    borderColor:
      fill.value > 0.5
        ? ACCENT
        : isDark
          ? "rgba(255,255,255,0.10)"
          : "rgba(0,0,0,0.08)",
  }));

  // Separate view so the tint can animate without fighting the blur layer.
  const tintStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    backgroundColor: fill.value > 0.5 ? ACCENT : "transparent",
    borderColor:
      fill.value > 0.5
        ? ACCENT
        : isDark
          ? "rgba(255,255,255,0.25)"
          : "rgba(0,0,0,0.20)",
    transform: [{ scale: 0.85 + fill.value * 0.15 }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessibilityRole={variant === "radio" ? "radio" : "checkbox"}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? "rgba(16,16,16,0.45)"
            : "rgba(255,255,255,0.55)",
        },
        containerStyle,
      ]}
    >
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={20}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? "rgba(76,175,80,0.16)" : "rgba(76,175,80,0.12)" },
          tintStyle,
        ]}
      />

      <View style={styles.content}>
        <View style={styles.textWrap}>
          <ThemedText style={styles.label}>{label}</ThemedText>
          {sublabel ? (
            <ThemedText style={styles.sublabel}>{sublabel}</ThemedText>
          ) : null}
        </View>

        <Animated.View
          style={[
            styles.indicator,
            variant === "radio" && styles.indicatorRound,
            indicatorStyle,
          ]}
        >
          {selected ? (
            <HugeiconsIcon
              icon={Tick02Icon}
              size={14}
              color="#FFFFFF"
              strokeWidth={3}
            />
          ) : null}
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  textWrap: { flex: 1 },
  label: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: FontFamily.regular,
  },
  sublabel: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.55,
    marginTop: 2,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorRound: { borderRadius: 12 },
});
