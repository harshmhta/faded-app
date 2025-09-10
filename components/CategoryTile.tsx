import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ContentCategory } from "@/types/content";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface CategoryTileProps {
  category: ContentCategory;
  onPress?: (category: ContentCategory) => void;
  style?: any;
}

export function CategoryTile({ category, onPress, style }: CategoryTileProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  return (
    <Pressable
      onPress={() => onPress?.(category)}
      style={[
        styles.tile,
        isDark ? styles.tileDark : styles.tileLight,
        isDark ? styles.tileBorderDark : styles.tileBorderLight,
        style,
      ]}
    >
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={24}
        style={styles.tileBlur}
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
        style={styles.tileGradient}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          isDark
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]
            : ["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]
        }
        start={{ x: 0.3, y: 0.0 }}
        end={{ x: 0.3, y: 1.0 }}
        style={styles.tileBottomFade}
      />

      {/* Category Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: category.color + "20" },
        ]}
      >
        <ThemedText style={[styles.iconEmoji]}>{category.icon}</ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText
          style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
          numberOfLines={1}
        >
          {category.name}
        </ThemedText>
        <ThemedText
          style={[
            styles.description,
            isDark ? styles.descriptionDark : styles.descriptionLight,
          ]}
          numberOfLines={2}
        >
          {category.description}
        </ThemedText>

        {/* Item count */}
        <View style={styles.countContainer}>
          <ThemedText
            style={[
              styles.count,
              isDark ? styles.countDark : styles.countLight,
            ]}
          >
            {category.items.length}{" "}
            {category.items.length === 1 ? "item" : "items"}
          </ThemedText>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.chevron}>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          color={isDark ? "#FFFFFF" : "#000000"}
          strokeWidth={2.5}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "48%",
    minHeight: 180,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  tileBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tileGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tileBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  tileLight: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  tileDark: {
    backgroundColor: "rgba(16,16,16,0.55)",
  },
  tileBorderDark: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tileBorderLight: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 6,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  titleLight: {
    color: "#000000",
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  descriptionDark: {
    color: "rgba(255,255,255,0.7)",
  },
  descriptionLight: {
    color: "rgba(0,0,0,0.7)",
  },
  countContainer: {
    marginTop: "auto",
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
  },
  countDark: {
    color: "rgba(255,255,255,0.6)",
  },
  countLight: {
    color: "rgba(0,0,0,0.6)",
  },
  chevron: {
    position: "absolute",
    right: 14,
    bottom: 14,
  },
});
