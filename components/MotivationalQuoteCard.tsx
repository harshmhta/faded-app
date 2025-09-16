import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  QuoteDownIcon,
  QuoteUpIcon,
  RefreshIcon,
  Share01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
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
  mindset: ["#667eea", "#764ba2", "#5a67d8"],
  strength: ["#f093fb", "#f5576c", "#e53e3e"],
  recovery: ["#4facfe", "#00f2fe", "#0bc5ea"],
  new_start: ["#43e97b", "#38f9d7", "#38a169"],
  change: ["#fa709a", "#fee140", "#ed8936"],
  inspiration: ["#a8edea", "#fed6e3", "#d69e2e"],
  progress: ["#ffecd2", "#fcb69f", "#dd6b20"],
  courage: ["#ff9a9e", "#fecfef", "#e53e3e"],
  hope: ["#a18cd1", "#fbc2eb", "#9f7aea"],
  healing: ["#fad0c4", "#ffd1ff", "#d69e2e"],
  consistency: ["#fed6e3", "#d299c2", "#b794f6"],
};

const { width: screenWidth } = Dimensions.get("window");

export default function MotivationalQuoteCard() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const refreshQuote = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Get random quote different from current
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (newIndex === motivationalQuotes.indexOf(currentQuote));

    setTimeout(() => {
      setCurrentQuote(motivationalQuotes[newIndex]);
    }, 200);
  };

  const shareQuote = async () => {
    try {
      // Haptic feedback for better UX
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await Share.share({
        message: `"${currentQuote.quote}" - ${currentQuote.author}`,
        title: "Daily Inspiration",
      });
    } catch (error) {
      console.log("Error sharing quote:", error);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Glassmorphism Background */}
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={isDark ? 60 : 40}
        style={styles.blurBackground}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={
          isDark
            ? [
                `${gradientColors[0]}25`,
                `${gradientColors[1]}20`,
                `${gradientColors[2]}15`,
                "transparent",
              ]
            : [
                `${gradientColors[0]}20`,
                `${gradientColors[1]}15`,
                `${gradientColors[2]}10`,
                "transparent",
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Header with Actions */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: isDark
                    ? `${gradientColors[0]}40`
                    : `${gradientColors[0]}25`,
                  borderColor: `${gradientColors[0]}60`,
                  borderWidth: 1,
                },
              ]}
            >
              <HugeiconsIcon
                icon={SparklesIcon}
                size={12}
                color={gradientColors[0]}
                strokeWidth={2}
              />
              <ThemedText
                style={[styles.categoryText, { color: gradientColors[0] }]}
              >
                Daily Inspiration
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={refreshQuote}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[
                styles.actionButton,
                { backgroundColor: `${gradientColors[1]}20` },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Get new inspirational quote"
              accessibilityHint="Tap to load a different motivational quote"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={18}
                color={gradientColors[1]}
                strokeWidth={2}
              />
            </Pressable>

            <Pressable
              onPress={shareQuote}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[
                styles.actionButton,
                { backgroundColor: `${gradientColors[2]}20` },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Share quote"
              accessibilityHint="Tap to share this inspirational quote with others"
            >
              <HugeiconsIcon
                icon={Share01Icon}
                size={18}
                color={gradientColors[2]}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </View>

        {/* Quote Section */}
        <View style={styles.quoteSection}>
          <View style={styles.quoteContainer}>
            <View style={styles.quoteIconLeft}>
              <HugeiconsIcon
                icon={QuoteUpIcon}
                size={32}
                color={`${gradientColors[0]}60`}
                strokeWidth={1.5}
              />
            </View>

            <ThemedText
              style={[styles.quoteText, { color: textColor }]}
              accessibilityRole="text"
              accessibilityLabel={`Inspirational quote: ${currentQuote.quote}`}
            >
              {currentQuote.quote}
            </ThemedText>

            <View style={styles.quoteIconRight}>
              <HugeiconsIcon
                icon={QuoteDownIcon}
                size={32}
                color={`${gradientColors[1]}60`}
                strokeWidth={1.5}
              />
            </View>
          </View>

          {/* Author */}
          <View style={styles.authorContainer}>
            <LinearGradient
              colors={[gradientColors[1], gradientColors[2]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.authorLine}
            />
            <ThemedText
              style={[styles.authorText, { color: textColor }]}
              accessibilityRole="text"
              accessibilityLabel={`Quote by ${currentQuote.author}`}
            >
              — {currentQuote.author}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    // Enhanced shadow system
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    // Subtle border for definition
    borderWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  contentContainer: {
    padding: 28,
    minHeight: 220,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 11,
    fontFamily: FontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  quoteSection: {
    flex: 1,
    justifyContent: "center",
  },
  quoteContainer: {
    position: "relative",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  quoteIconLeft: {
    position: "absolute",
    top: -8,
    left: -4,
    opacity: 0.6,
  },
  quoteIconRight: {
    position: "absolute",
    bottom: -8,
    right: -4,
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 18,
    fontFamily: FontFamily.medium,
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    letterSpacing: 0.3,
  },
  authorContainer: {
    alignItems: "center",
    gap: 12,
  },
  authorLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  authorText: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    opacity: 0.85,
    letterSpacing: 0.2,
  },
});
