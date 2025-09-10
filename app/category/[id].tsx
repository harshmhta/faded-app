import { ResourceCard } from "@/components/ResourceCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { contentCategories } from "@/data/content";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ContentItem } from "@/types/content";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // Find the category by ID
  const category = contentCategories.find((cat) => cat.id === id);

  if (!category) {
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
          <ThemedText style={styles.errorText}>Category not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleContentPress = (item: ContentItem) => {
    router.push(`/content/${item.id}`);
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
        <ThemedText style={styles.headerTitle}>{category.name}</ThemedText>
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
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: category.color + "20" },
            ]}
          >
            <ThemedText style={styles.iconEmoji}>{category.icon}</ThemedText>
          </View>
          <ThemedText
            style={[
              styles.categoryTitle,
              isDark ? styles.categoryTitleDark : styles.categoryTitleLight,
            ]}
          >
            {category.name}
          </ThemedText>
          <ThemedText
            style={[
              styles.categoryDescription,
              isDark
                ? styles.categoryDescriptionDark
                : styles.categoryDescriptionLight,
            ]}
          >
            {category.description}
          </ThemedText>
          <ThemedText
            style={[
              styles.itemCount,
              isDark ? styles.itemCountDark : styles.itemCountLight,
            ]}
          >
            {category.items.length}{" "}
            {category.items.length === 1 ? "item" : "items"} available
          </ThemedText>
        </View>

        {/* Content Grid */}
        {category.items.length > 0 ? (
          <View style={styles.grid}>
            {category.items.map((item) => (
              <ResourceCard
                key={item.id}
                item={item}
                onPress={handleContentPress}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText
              style={[
                styles.emptyText,
                isDark ? styles.emptyTextDark : styles.emptyTextLight,
              ]}
            >
              No content available in this category yet.
            </ThemedText>
          </View>
        )}
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
  categoryHeader: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 40,
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  categoryTitleDark: {
    color: "#FFFFFF",
  },
  categoryTitleLight: {
    color: "#000000",
  },
  categoryDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
  },
  categoryDescriptionDark: {
    color: "rgba(255,255,255,0.8)",
  },
  categoryDescriptionLight: {
    color: "rgba(0,0,0,0.8)",
  },
  itemCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemCountDark: {
    color: "rgba(255,255,255,0.6)",
  },
  itemCountLight: {
    color: "rgba(0,0,0,0.6)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyTextDark: {
    color: "rgba(255,255,255,0.6)",
  },
  emptyTextLight: {
    color: "rgba(0,0,0,0.6)",
  },
});
