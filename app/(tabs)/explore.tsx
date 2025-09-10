import { CategoryTile } from "@/components/CategoryTile";
import ExploreCalendar from "@/components/ExploreCalendar";
import { ResourceCard } from "@/components/ResourceCard";
import { ThemedText } from "@/components/ThemedText";
import { contentCategories, getFeaturedContent } from "@/data/content";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ContentCategory, ContentItem } from "@/types/content";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TileProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: any;
  hideChevron?: boolean;
};

function Tile({ title, subtitle, onPress, style, hideChevron }: TileProps) {
  const scheme = useColorScheme() ?? "light";
  const isAppDark = scheme === "dark";
  const isDarkTile = isAppDark;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        isDarkTile ? styles.tileDark : styles.tileLight,
        isDarkTile ? styles.tileBorderDark : styles.tileBorderLight,
        style,
      ]}
    >
      <BlurView
        tint={isDarkTile ? "dark" : "light"}
        intensity={24}
        style={styles.tileBlur}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          isDarkTile
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
          isDarkTile
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]
            : ["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]
        }
        start={{ x: 0.3, y: 0.0 }}
        end={{ x: 0.3, y: 1.0 }}
        style={styles.tileBottomFade}
      />
      <View>
        <ThemedText
          type="subtitle"
          style={[
            styles.tileTitle,
            isDarkTile ? styles.tileTitleDark : styles.tileTitleLight,
          ]}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            style={[
              styles.tileSubtitle,
              isDarkTile ? styles.tileSubtitleDark : styles.tileSubtitleLight,
            ]}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {!hideChevron && (
        <View style={styles.chevron}>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            color={isDarkTile ? "#FFFFFF" : "#000000"}
            strokeWidth={2.5}
          />
        </View>
      )}
    </Pressable>
  );
}

export default function ExploreResourcesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const scrollViewRef = useRef<ScrollView>(null);

  const featuredContent = getFeaturedContent();

  const handleCategoryPress = (category: ContentCategory) => {
    router.push(`/category/${category.id}`);
  };

  const handleContentPress = (item: ContentItem) => {
    router.push(`/content/${item.id}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 45 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {/* Sobriety Streak Tile */}
          <View
            style={[
              styles.tile,
              styles.fullWidthTile,
              styles.streakTile,
              isDark ? styles.tileDark : styles.tileLight,
              isDark ? styles.tileBorderDark : styles.tileBorderLight,
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

            {/* Streak Content */}
            <View style={styles.streakHeader}>
              <ThemedText
                style={[
                  styles.streakTitle,
                  isDark ? styles.tileTitleDark : styles.tileTitleLight,
                ]}
              >
                Recovery Journey
              </ThemedText>
              <View style={styles.streakBadge}>
                <ThemedText style={[styles.streakEmoji]}>🌟</ThemedText>
              </View>
            </View>

            <View style={styles.streakMainContent}>
              <View style={styles.streakNumberContainer}>
                <ThemedText
                  style={[
                    styles.streakNumber,
                    isDark ? styles.tileTitleDark : styles.tileTitleLight,
                  ]}
                >
                  5
                </ThemedText>
                <ThemedText
                  style={[
                    styles.streakDays,
                    isDark ? styles.tileSubtitleDark : styles.tileSubtitleLight,
                  ]}
                >
                  days clean
                </ThemedText>
              </View>

              <View style={styles.streakProgress}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={["#4CAF50", "#8BC34A", "#4CAF50"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: "50%" }]}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.progressText,
                    isDark ? styles.tileSubtitleDark : styles.tileSubtitleLight,
                  ]}
                >
                  5/10 days to next milestone
                </ThemedText>
              </View>
            </View>

            <ExploreCalendar parentScrollRef={scrollViewRef} />
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <ThemedText
              style={[
                styles.sectionTitle,
                isDark ? styles.tileTitleDark : styles.tileTitleLight,
              ]}
            >
              Quick Support
            </ThemedText>
          </View>

          <Tile
            title="SOS Help"
            subtitle="Immediate support for cravings"
            onPress={() => {
              // Navigate to emergency coping strategies
              router.push("/category/coping-strategies");
            }}
            style={[
              styles.emergencyTile,
              {
                backgroundColor: isDark
                  ? "rgba(244, 67, 54, 0.2)"
                  : "rgba(244, 67, 54, 0.1)",
              },
            ]}
          />

          <Tile
            title="Daily Check-in"
            subtitle="How are you feeling today?"
            onPress={() => {
              // Navigate to mood tracking or daily reflection
              router.push("/category/mindfulness");
            }}
            style={[
              styles.checkInTile,
              {
                backgroundColor: isDark
                  ? "rgba(76, 175, 80, 0.2)"
                  : "rgba(76, 175, 80, 0.1)",
              },
            ]}
          />

          {/* Featured Content Section */}
          {featuredContent.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    isDark ? styles.tileTitleDark : styles.tileTitleLight,
                  ]}
                >
                  Recommended for You
                </ThemedText>
              </View>
              {featuredContent.slice(0, 2).map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  onPress={handleContentPress}
                />
              ))}
            </>
          )}

          {/* Categories Section */}
          <View style={styles.sectionHeader}>
            <ThemedText
              style={[
                styles.sectionTitle,
                isDark ? styles.tileTitleDark : styles.tileTitleLight,
              ]}
            >
              Recovery Resources
            </ThemedText>
          </View>
          {contentCategories.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              onPress={handleCategoryPress}
            />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
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
  tileTitle: {
    fontSize: 26,
    lineHeight: 28,
  },
  tileTitleDark: {
    color: "#FFFFFF",
  },
  tileTitleLight: {
    color: "#000000",
  },
  tileSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  tileSubtitleDark: {
    color: "rgba(255,255,255,0.7)",
  },
  tileSubtitleLight: {
    color: "rgba(0,0,0,0.7)",
  },
  chevron: {
    position: "absolute",
    right: 14,
    bottom: 14,
  },
  fullWidthTile: {
    width: "100%",
    marginBottom: 16,
  },
  streakTile: {
    justifyContent: "space-between",
    alignItems: "stretch",
    paddingBottom: 10,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  streakBadge: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakMainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  streakNumberContainer: {
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
  },
  streakDays: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: -2,
  },
  streakProgress: {
    flex: 1,
    marginLeft: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(160, 160, 160, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sectionHeader: {
    width: "100%",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emergencyTile: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  checkInTile: {
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
});
