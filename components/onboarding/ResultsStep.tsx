import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ACCENT, GlassPanel } from "./OnboardingShell";

/**
 * Counts a number up on mount. Kept on the JS thread deliberately — it drives
 * text content, which worklets cannot set directly, and it runs once.
 */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      // Ease-out so it decelerates into the final figure.
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);

  return value;
}

interface ResultsStepProps {
  dailySpend: number;
  currency: string;
  triggerCount: number;
  reasonCount: number;
  topReason?: string;
}

function currencySymbol(code: string) {
  switch (code) {
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "USD":
    default:
      return "$";
  }
}

export function ResultsStep({
  dailySpend,
  currency,
  triggerCount,
  reasonCount,
  topReason,
}: ResultsStepProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const symbol = currencySymbol(currency);

  const yearly = Math.round(dailySpend * 365);
  const monthly = Math.round(dailySpend * 30);

  const yearlyShown = useCountUp(yearly, 1100);

  const barFill = useSharedValue(0);
  React.useEffect(() => {
    barFill.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [barFill]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barFill.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <GlassPanel style={styles.hero}>
          <ThemedText style={styles.heroLabel}>
            A year from now, not spending it
          </ThemedText>
          <View style={styles.heroAmountRow}>
            <ThemedText style={styles.heroSymbol}>{symbol}</ThemedText>
            <ThemedText style={styles.heroAmount}>
              {yearlyShown.toLocaleString("en-US")}
            </ThemedText>
          </View>
          <ThemedText style={styles.heroSub}>
            About {symbol}
            {monthly.toLocaleString("en-US")} a month, based on what you told us
          </ThemedText>

          <View
            style={[
              styles.barTrack,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(0,0,0,0.07)",
              },
            ]}
          >
            <Animated.View style={[styles.barFill, barStyle]}>
              <LinearGradient
                colors={[ACCENT, "#7BC67E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </GlassPanel>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(400)}
        style={styles.row}
      >
        <GlassPanel style={styles.statCard}>
          <ThemedText style={styles.statValue}>{triggerCount}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {triggerCount === 1 ? "trigger to watch" : "triggers to watch"}
          </ThemedText>
        </GlassPanel>

        <GlassPanel style={styles.statCard}>
          <ThemedText style={styles.statValue}>{reasonCount}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {reasonCount === 1 ? "reason to hold on to" : "reasons to hold on to"}
          </ThemedText>
        </GlassPanel>
      </Animated.View>

      {topReason ? (
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <GlassPanel style={styles.quoteCard}>
            <ThemedText style={styles.quoteLabel}>
              When it gets hard, this is what you said
            </ThemedText>
            <ThemedText style={styles.quoteText}>{topReason}</ThemedText>
          </GlassPanel>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(420).duration(400)}>
        <ThemedText style={styles.footnote}>
          Luma knows all of this now, so you won&apos;t have to explain yourself
          from scratch.
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  hero: { padding: 22 },
  heroLabel: { fontSize: 14, opacity: 0.6, marginBottom: 6 },
  heroAmountRow: { flexDirection: "row", alignItems: "flex-start", gap: 2 },
  heroSymbol: {
    fontSize: 26,
    fontFamily: FontFamily.medium,
    color: ACCENT,
    marginTop: 8,
  },
  heroAmount: {
    fontSize: 52,
    lineHeight: 60,
    fontFamily: FontFamily.medium,
    color: ACCENT,
  },
  heroSub: { fontSize: 14, opacity: 0.6, marginTop: 2, marginBottom: 18 },
  barTrack: { height: 6, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, overflow: "hidden" },
  row: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, padding: 18, alignItems: "flex-start" },
  statValue: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FontFamily.medium,
  },
  statLabel: { fontSize: 13, lineHeight: 18, opacity: 0.6, marginTop: 2 },
  quoteCard: { padding: 20 },
  quoteLabel: { fontSize: 13, opacity: 0.55, marginBottom: 8 },
  quoteText: {
    fontSize: 19,
    lineHeight: 26,
    fontFamily: FontFamily.medium,
  },
  footnote: {
    fontSize: 13.5,
    lineHeight: 19,
    opacity: 0.5,
    textAlign: "center",
    paddingHorizontal: 10,
    marginTop: 6,
  },
});
