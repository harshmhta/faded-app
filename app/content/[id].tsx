import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { sampleContent } from "@/data/content";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ArrowLeft02Icon,
  BookOpenIcon,
  ClockIcon,
  PlayIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // Find the content item by ID
  const contentItem = sampleContent.find((item) => item.id === id);

  if (!contentItem) {
    return (
      <ThemedView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: Colors[colorScheme].background,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
              strokeWidth={2}
            />
          </Pressable>
        </View>
        <View style={styles.centerContent}>
          <ThemedText style={styles.errorText}>Content not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <HugeiconsIcon
        key={i}
        icon={StarIcon}
        size={16}
        color={i < difficulty ? "#FFD700" : isDark ? "#444" : "#DDD"}
        strokeWidth={1.5}
      />
    ));
  };

  const handlePlayContent = () => {
    Alert.alert(
      contentItem.type === "video" ? "Play Video" : "Read Guide",
      `This would ${contentItem.type === "video" ? "play the video" : "open the guide"}: "${contentItem.title}"`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: contentItem.type === "video" ? "Play" : "Read",
          onPress: () => console.log(`Playing ${contentItem.id}`),
        },
      ],
    );
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: Colors[colorScheme].background,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            size={24}
            color={isDark ? "#FFFFFF" : "#000000"}
            strokeWidth={2}
          />
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {contentItem.type === "video" ? "Video" : "Guide"}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            isDark ? styles.heroCardDark : styles.heroCardLight,
            isDark ? styles.cardBorderDark : styles.cardBorderLight,
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={24}
            style={styles.heroBlur}
          />
          <LinearGradient
            pointerEvents="none"
            colors={
              isDark
                ? [
                    "rgba(255,255,255,0.05)",
                    "rgba(255,255,255,0.015)",
                    "rgba(255,255,255,0)",
                  ]
                : ["rgba(0,0,0,0.03)", "rgba(0,0,0,0.015)", "rgba(0,0,0,0)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          />

          {/* Featured badge */}
          {contentItem.featured && (
            <View style={styles.featuredBadge}>
              <ThemedText style={styles.featuredText}>Featured</ThemedText>
            </View>
          )}

          {/* Content Info */}
          <View style={styles.heroContent}>
            <View style={styles.typeRow}>
              <View style={styles.typeContainer}>
                <HugeiconsIcon
                  icon={contentItem.type === "video" ? PlayIcon : BookOpenIcon}
                  size={20}
                  color={isDark ? "#FFFFFF" : "#000000"}
                  strokeWidth={2}
                />
                <ThemedText style={styles.typeText}>
                  {contentItem.type === "video" ? "Video" : "Guide"}
                </ThemedText>
              </View>

              {(contentItem.duration || contentItem.readTime) && (
                <View style={styles.durationContainer}>
                  <HugeiconsIcon
                    icon={ClockIcon}
                    size={16}
                    color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
                    strokeWidth={2}
                  />
                  <ThemedText
                    style={[
                      styles.durationText,
                      isDark
                        ? styles.durationTextDark
                        : styles.durationTextLight,
                    ]}
                  >
                    {contentItem.duration || contentItem.readTime}
                  </ThemedText>
                </View>
              )}
            </View>

            <ThemedText
              style={[
                styles.heroTitle,
                isDark ? styles.heroTitleDark : styles.heroTitleLight,
              ]}
            >
              {contentItem.title}
            </ThemedText>

            <ThemedText
              style={[
                styles.heroDescription,
                isDark
                  ? styles.heroDescriptionDark
                  : styles.heroDescriptionLight,
              ]}
            >
              {contentItem.description}
            </ThemedText>

            {/* Difficulty */}
            <View style={styles.difficultyRow}>
              <ThemedText
                style={[
                  styles.difficultyLabel,
                  isDark
                    ? styles.difficultyLabelDark
                    : styles.difficultyLabelLight,
                ]}
              >
                Difficulty:
              </ThemedText>
              <View style={styles.stars}>
                {getDifficultyStars(contentItem.difficulty)}
              </View>
            </View>

            {/* Tags */}
            {contentItem.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {contentItem.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      isDark ? styles.tagDark : styles.tagLight,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.tagText,
                        isDark ? styles.tagTextDark : styles.tagTextLight,
                      ]}
                    >
                      #{tag}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={handlePlayContent}
          style={[
            styles.actionButton,
            isDark ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
        >
          <HugeiconsIcon
            icon={contentItem.type === "video" ? PlayIcon : BookOpenIcon}
            size={20}
            color="#FFFFFF"
            strokeWidth={2}
          />
          <ThemedText style={styles.actionButtonText}>
            {contentItem.type === "video" ? "Watch Video" : "Read Guide"}
          </ThemedText>
        </Pressable>

        {/* Additional Info */}
        <View
          style={[
            styles.infoCard,
            isDark ? styles.infoCardDark : styles.infoCardLight,
            isDark ? styles.cardBorderDark : styles.cardBorderLight,
          ]}
        >
          <ThemedText
            style={[
              styles.infoTitle,
              isDark ? styles.infoTitleDark : styles.infoTitleLight,
            ]}
          >
            About this {contentItem.type}
          </ThemedText>
          <ThemedText
            style={[
              styles.infoText,
              isDark ? styles.infoTextDark : styles.infoTextLight,
            ]}
          >
            This {contentItem.type} is categorized under "{contentItem.category}
            " and is suitable for{" "}
            {contentItem.difficulty <= 2
              ? "beginners"
              : contentItem.difficulty <= 3
                ? "intermediate learners"
                : "advanced practitioners"}
            .
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    opacity: 0.6,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  heroCardLight: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  heroCardDark: {
    backgroundColor: "rgba(16,16,16,0.55)",
  },
  cardBorderDark: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardBorderLight: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 107, 107, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  heroContent: {
    gap: 16,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  durationTextDark: {
    color: "rgba(255,255,255,0.6)",
  },
  durationTextLight: {
    color: "rgba(0,0,0,0.6)",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  heroTitleDark: {
    color: "#FFFFFF",
  },
  heroTitleLight: {
    color: "#000000",
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  heroDescriptionDark: {
    color: "rgba(255,255,255,0.8)",
  },
  heroDescriptionLight: {
    color: "rgba(0,0,0,0.8)",
  },
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  difficultyLabelDark: {
    color: "rgba(255,255,255,0.7)",
  },
  difficultyLabelLight: {
    color: "rgba(0,0,0,0.7)",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tagLight: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tagTextDark: {
    color: "rgba(255,255,255,0.9)",
  },
  tagTextLight: {
    color: "rgba(0,0,0,0.9)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  actionButtonDark: {
    backgroundColor: "#007AFF",
  },
  actionButtonLight: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  infoCardLight: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  infoCardDark: {
    backgroundColor: "rgba(16,16,16,0.4)",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoTitleDark: {
    color: "#FFFFFF",
  },
  infoTitleLight: {
    color: "#000000",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 21,
  },
  infoTextDark: {
    color: "rgba(255,255,255,0.8)",
  },
  infoTextLight: {
    color: "rgba(0,0,0,0.8)",
  },
});
