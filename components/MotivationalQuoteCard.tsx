import { FontFamily } from "@/constants/Fonts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

const motivationalQuotes = [
  {
    quote:
      "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives.",
    author: "William James",
    category: "mindset",
  },
  {
    quote:
      "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne",
    category: "strength",
  },
  {
    quote:
      "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.",
    author: "Unknown",
    category: "recovery",
  },
  {
    quote: "Every moment is a fresh beginning.",
    author: "T.S. Eliot",
    category: "new_start",
  },
  {
    quote:
      "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    author: "Alan Watts",
    category: "change",
  },
  {
    quote:
      "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins",
    category: "inspiration",
  },
  {
    quote: "Progress, not perfection.",
    author: "Unknown",
    category: "progress",
  },
  {
    quote: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell",
    category: "courage",
  },
  {
    quote: "Your current situation is not your final destination.",
    author: "Unknown",
    category: "hope",
  },
  {
    quote:
      "Healing isn't about erasing your past, it's about making peace with it.",
    author: "Unknown",
    category: "healing",
  },
  {
    quote: "You don't have to be perfect, you just have to be consistent.",
    author: "Unknown",
    category: "consistency",
  },
  {
    quote:
      "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
    author: "Unknown",
    category: "strength",
  },
];

const categoryColors = {
  mindset: ["#667eea", "#764ba2"],
  strength: ["#f093fb", "#f5576c"],
  recovery: ["#4facfe", "#00f2fe"],
  new_start: ["#43e97b", "#38f9d7"],
  change: ["#fa709a", "#fee140"],
  inspiration: ["#a8edea", "#fed6e3"],
  progress: ["#ffecd2", "#fcb69f"],
  courage: ["#ff9a9e", "#fecfef"],
  hope: ["#a18cd1", "#fbc2eb"],
  healing: ["#fad0c4", "#ffd1ff"],
  consistency: ["#fed6e3", "#d299c2"],
};

export default function MotivationalQuoteCard() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

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
    categoryColors.inspiration;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[
          `${gradientColors[0]}20`,
          `${gradientColors[1]}20`,
          `${gradientColors[0]}10`,
          `${gradientColors[1]}10`,
        ]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${gradientColors[0]}30` },
            ]}
          >
            <ThemedText
              style={[styles.categoryText, { color: gradientColors[0] }]}
            >
              Daily Inspiration
            </ThemedText>
          </View>
        </View>

        {/* Quote */}
        <View style={styles.quoteContainer}>
          <ThemedText style={[styles.quoteIcon, { color: gradientColors[0] }]}>
            "
          </ThemedText>
          <ThemedText style={[styles.quoteText, { color: textColor }]}>
            {currentQuote.quote}
          </ThemedText>
          <ThemedText
            style={[
              styles.quoteIcon,
              styles.quoteIconEnd,
              { color: gradientColors[0] },
            ]}
          >
            "
          </ThemedText>
        </View>

        {/* Author */}
        <View style={styles.authorContainer}>
          <View
            style={[styles.authorLine, { backgroundColor: gradientColors[1] }]}
          />
          <ThemedText style={[styles.authorText, { color: textColor }]}>
            {currentQuote.author}
          </ThemedText>
        </View>

        {/* Motivational Message */}
        <View
          style={[
            styles.messageContainer,
            { backgroundColor: `${gradientColors[0]}15` },
          ]}
        >
          <ThemedText style={[styles.messageText, { color: textColor }]}>
            💪 You're doing amazing! Take it one day at a time.
          </ThemedText>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  gradientBackground: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quoteContainer: {
    position: "relative",
    marginBottom: 20,
  },
  quoteIcon: {
    fontSize: 40,
    fontFamily: FontFamily.bold,
    position: "absolute",
    top: -10,
    left: -5,
    opacity: 0.3,
  },
  quoteIconEnd: {
    right: -5,
    bottom: -30,
    top: "auto",
    left: "auto",
  },
  quoteText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  authorContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  authorLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
    marginBottom: 8,
  },
  authorText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },
});
