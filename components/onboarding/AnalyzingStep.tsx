import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { ANALYSIS_STEPS } from "@/constants/onboardingQuestions";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ACCENT } from "./OnboardingShell";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 148;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Milliseconds each line spends as the "current" step. */
const STEP_MS = 900;

interface AnalyzingStepProps {
  onDone: () => void;
}

export function AnalyzingStep({ onDone }: AnalyzingStepProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const [index, setIndex] = React.useState(0);

  const total = ANALYSIS_STEPS.length;
  const sweep = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Ring fills across the whole sequence rather than per step, so it reads as
  // one continuous action instead of five stutters.
  React.useEffect(() => {
    sweep.value = withTiming(1, {
      duration: STEP_MS * total,
      easing: Easing.inOut(Easing.cubic),
    });
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(sweep);
      cancelAnimation(pulse);
    };
  }, [sweep, pulse, total]);

  React.useEffect(() => {
    if (index >= total) {
      const finish = setTimeout(onDone, 420);
      return () => clearTimeout(finish);
    }
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIndex((i) => i + 1);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [index, total, onDone]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - sweep.value),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ringWrap, pulseStyle]}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={ACCENT}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={ringProps}
            // Start the sweep at 12 o'clock.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
      </Animated.View>

      <ThemedText style={styles.heading}>Building your plan</ThemedText>

      <View style={styles.steps}>
        {ANALYSIS_STEPS.map((step, i) => {
          const done = i < index;
          const active = i === index;
          if (i > index) return null;

          return (
            <Animated.View
              key={step}
              entering={FadeIn.duration(240)}
              style={styles.stepRow}
            >
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: done ? ACCENT : "transparent",
                    borderColor: done
                      ? ACCENT
                      : isDark
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(0,0,0,0.25)",
                  },
                ]}
              >
                {done ? (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={11}
                    color="#FFFFFF"
                    strokeWidth={3.5}
                  />
                ) : null}
              </View>
              <ThemedText
                style={[styles.stepText, { opacity: active ? 1 : 0.5 }]}
              >
                {step}
              </ThemedText>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  ringWrap: { marginBottom: 36 },
  heading: {
    fontSize: 24,
    fontFamily: FontFamily.medium,
    marginBottom: 28,
  },
  steps: { alignSelf: "stretch", paddingHorizontal: 8, gap: 14 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 15.5, lineHeight: 20 },
});
