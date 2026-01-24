import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RefreshIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { ThemedText } from "./ThemedText";

const motivationalQuotes = [
  {
    quote: "Every moment is a fresh beginning.",
    author: "T.S. Eliot",
    category: "new_start",
  },
  {
    quote: "Progress, not perfection.",
    author: "Unknown",
    category: "progress",
  },
  {
    quote: "Your current situation is not your final destination.",
    author: "Unknown",
    category: "hope",
  },
  {
    quote: "You don't have to be perfect, you just have to be consistent.",
    author: "Unknown",
    category: "consistency",
  },
  {
    quote: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell",
    category: "courage",
  },
];

const categoryColors = {
  new_start: ["#43e97b", "#38f9d7"],
  progress: ["#ffecd2", "#fcb69f"],
  hope: ["#a18cd1", "#fbc2eb"],
  consistency: ["#fed6e3", "#d299c2"],
  courage: ["#ff9a9e", "#fecfef"],
};

export default function MotivationalQuoteCardCompact() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Get daily quote based on current date
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    setCurrentQuote(motivationalQuotes[quoteIndex]);
  }, []);

  const gradientColors =
    categoryColors[currentQuote.category as keyof typeof categoryColors] ||
    categoryColors.hope;

  const refreshQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (newIndex === motivationalQuotes.indexOf(currentQuote));

    setTimeout(() => {
      setCurrentQuote(motivationalQuotes[newIndex]);
    }, 150);
  };

  return (
    <View style={styles.container}>
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={isDark ? 60 : 40}
        style={styles.blurBackground}
      />

      <LinearGradient
        colors={
          isDark
            ? [`${gradientColors[0]}30`, `${gradientColors[1]}20`, "transparent"]
            : [`${gradientColors[0]}25`, `${gradientColors[1]}15`, "transparent"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <HugeiconsIcon
              icon={SparklesIcon}
              size={14}
              color={gradientColors[0]}
              strokeWidth={2}
            />
          </View>
          
          <Pressable
            onPress={refreshQuote}
            style={({ pressed }) => [
              styles.refreshButton,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              color={textColor}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <View style={styles.quoteSection}>
          <ThemedText style={[styles.quoteText, { color: textColor }]}>
            "{currentQuote.quote}"
          </ThemedText>
          <ThemedText style={[styles.authorText, { color: textColor }]}>
            — {currentQuote.author}
          </ThemedText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    padding: 16,
    minHeight: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  quoteSection: {
    gap: 6,
    minHeight: 70,
    justifyContent: "flex-start",
  },
  quoteText: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    lineHeight: 22,
    letterSpacing: 0.2,
    minHeight: 44,
  },
  authorText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    opacity: 0.7,
    minHeight: 18,
  },
});
