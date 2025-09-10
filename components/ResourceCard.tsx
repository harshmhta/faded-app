import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ContentItem } from "@/types/content";
import {
  BookOpenIcon,
  ClockIcon,
  PlayIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface ResourceCardProps {
  item: ContentItem;
  onPress?: (item: ContentItem) => void;
  style?: any;
}

export function ResourceCard({ item, onPress, style }: ResourceCardProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <HugeiconsIcon
        key={i}
        icon={StarIcon}
        size={12}
        color={i < difficulty ? "#FFD700" : isDark ? "#444" : "#DDD"}
        strokeWidth={1.5}
      />
    ));
  };

  const getTypeIcon = () => {
    return item.type === "video" ? PlayIcon : BookOpenIcon;
  };

  const getDuration = () => {
    return item.type === "video" ? item.duration : item.readTime;
  };

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        isDark ? styles.cardBorderDark : styles.cardBorderLight,
        style,
      ]}
    >
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={24}
        style={styles.cardBlur}
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
        style={styles.cardGradient}
      />

      {/* Featured badge */}
      {item.featured && (
        <View style={styles.featuredBadge}>
          <ThemedText style={styles.featuredText}>Featured</ThemedText>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header with type icon and duration */}
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <HugeiconsIcon
              icon={getTypeIcon()}
              size={16}
              color={isDark ? "#FFFFFF" : "#000000"}
              strokeWidth={2}
            />
            <ThemedText style={styles.typeText}>
              {item.type === "video" ? "Video" : "Guide"}
            </ThemedText>
          </View>

          {getDuration() && (
            <View style={styles.durationContainer}>
              <HugeiconsIcon
                icon={ClockIcon}
                size={12}
                color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
                strokeWidth={2}
              />
              <ThemedText
                style={[
                  styles.durationText,
                  isDark ? styles.durationTextDark : styles.durationTextLight,
                ]}
              >
                {getDuration()}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Title */}
        <ThemedText
          style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>

        {/* Description */}
        <ThemedText
          style={[
            styles.description,
            isDark ? styles.descriptionDark : styles.descriptionLight,
          ]}
          numberOfLines={2}
        >
          {item.description}
        </ThemedText>

        {/* Footer with difficulty and tags */}
        <View style={styles.footer}>
          <View style={styles.difficultyContainer}>
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
              {getDifficultyStars(item.difficulty)}
            </View>
          </View>

          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <ThemedText
                style={[styles.tag, isDark ? styles.tagDark : styles.tagLight]}
              >
                #{item.tags[0]}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 200,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  cardLight: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  cardDark: {
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
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 107, 107, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "500",
  },
  durationTextDark: {
    color: "rgba(255,255,255,0.6)",
  },
  durationTextLight: {
    color: "rgba(0,0,0,0.6)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 6,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  titleLight: {
    color: "#000000",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  descriptionDark: {
    color: "rgba(255,255,255,0.7)",
  },
  descriptionLight: {
    color: "rgba(0,0,0,0.7)",
  },
  footer: {
    gap: 8,
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  difficultyLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  difficultyLabelDark: {
    color: "rgba(255,255,255,0.6)",
  },
  difficultyLabelLight: {
    color: "rgba(0,0,0,0.6)",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    fontSize: 11,
    fontWeight: "500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(100, 100, 100, 0.1)",
  },
  tagDark: {
    color: "rgba(255,255,255,0.8)",
  },
  tagLight: {
    color: "rgba(0,0,0,0.8)",
  },
});
