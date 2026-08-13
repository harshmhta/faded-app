import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";

export const ACCENT = "#4CAF50";

interface OnboardingShellProps {
  /** 0–1. Drives the top bar. */
  progress: number;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  ctaLabel?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
  /** Small print under the CTA, e.g. "Choose as many as you like". */
  footnote?: string;
  scrollable?: boolean;
}

export function OnboardingShell({
  progress,
  onBack,
  title,
  subtitle,
  children,
  ctaLabel,
  onCta,
  ctaDisabled,
  footnote,
  scrollable = true,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const barWidth = useSharedValue(progress);
  React.useEffect(() => {
    barWidth.value = withSpring(progress, { damping: 18, stiffness: 120 });
  }, [progress, barWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, barWidth.value)) * 100}%`,
  }));

  const Body = scrollable ? ScrollView : View;

  return (
    <View style={styles.container}>
      {/* Progress + back */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => {
            if (!onBack) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          hitSlop={12}
          disabled={!onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backButton,
            { opacity: onBack ? (pressed ? 0.5 : 1) : 0 },
          ]}
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            size={22}
            color={isDark ? "#FFFFFF" : "#000000"}
            strokeWidth={2.2}
          />
        </Pressable>

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <Animated.View style={[styles.progressFill, barStyle]}>
            <LinearGradient
              colors={[ACCENT, "#7BC67E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <View style={styles.backButton} />
      </View>

      <Body
        style={styles.body}
        {...(scrollable
          ? {
              contentContainerStyle: [
                styles.bodyContent,
                { paddingBottom: 24 },
              ],
              showsVerticalScrollIndicator: false,
              keyboardShouldPersistTaps: "handled" as const,
            }
          : { style: [styles.body, styles.bodyContent] })}
      >
        {title ? (
          <Animated.View entering={FadeIn.duration(260)}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle ? (
              <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            ) : null}
          </Animated.View>
        ) : null}

        {children}
      </Body>

      {/* CTA */}
      {ctaLabel ? (
        <View
          style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}
          pointerEvents="box-none"
        >
          {footnote ? (
            <ThemedText style={styles.footnote}>{footnote}</ThemedText>
          ) : null}
          <Pressable
            onPress={() => {
              if (ctaDisabled || !onCta) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onCta();
            }}
            disabled={ctaDisabled}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            accessibilityState={{ disabled: !!ctaDisabled }}
            style={({ pressed }) => [
              styles.cta,
              {
                opacity: ctaDisabled ? 0.4 : pressed ? 0.9 : 1,
                transform: [{ scale: pressed && !ctaDisabled ? 0.985 : 1 }],
              },
            ]}
          >
            <LinearGradient
              colors={[ACCENT, "#3E9E43"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <ThemedText style={styles.ctaText}>{ctaLabel}</ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** Glass surface matching the cards used across the rest of the app. */
export function GlassPanel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: isDark
            ? "rgba(16,16,16,0.55)"
            : "rgba(255,255,255,0.65)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
        style,
      ]}
    >
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={24}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { width: 28, height: 28, justifyContent: "center" },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, overflow: "hidden" },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20 },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: FontFamily.medium,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    opacity: 0.6,
    marginBottom: 26,
  },
  ctaWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  footnote: {
    fontSize: 13,
    opacity: 0.5,
    textAlign: "center",
  },
  cta: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: FontFamily.medium,
  },
  panel: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
});
