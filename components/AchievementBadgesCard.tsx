import { FontFamily } from "@/constants/Fonts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface AchievementBadgesCardProps {
  startDate: Date;
}

const achievements = [
  {
    id: "first_day",
    title: "First Step",
    description: "Completed your first day",
    icon: "🌱",
    daysRequired: 1,
    color: "#4CAF50",
  },
  {
    id: "first_week",
    title: "Week Warrior",
    description: "One week strong!",
    icon: "💪",
    daysRequired: 7,
    color: "#2196F3",
  },
  {
    id: "two_weeks",
    title: "Fortnight Fighter",
    description: "Two weeks of freedom",
    icon: "⚡",
    daysRequired: 14,
    color: "#FF9800",
  },
  {
    id: "first_month",
    title: "Monthly Master",
    description: "One month milestone",
    icon: "🏆",
    daysRequired: 30,
    color: "#9C27B0",
  },
  {
    id: "three_months",
    title: "Quarter Champion",
    description: "Three months clean",
    icon: "👑",
    daysRequired: 90,
    color: "#E91E63",
  },
  {
    id: "six_months",
    title: "Half Year Hero",
    description: "Six months of strength",
    icon: "🦸",
    daysRequired: 180,
    color: "#00BCD4",
  },
  {
    id: "one_year",
    title: "Annual Achiever",
    description: "One full year!",
    icon: "🎉",
    daysRequired: 365,
    color: "#FFD700",
  },
  {
    id: "savings_100",
    title: "Saver",
    description: "Saved $100+",
    icon: "💰",
    daysRequired: 7, // Roughly 1 week at $15/day
    color: "#4CAF50",
  },
];

export default function AchievementBadgesCard({
  startDate,
}: AchievementBadgesCardProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const calculateDaysSinceStart = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceStart = calculateDaysSinceStart();
  const earnedAchievements = achievements.filter(
    (achievement) => daysSinceStart >= achievement.daysRequired,
  );
  const nextAchievement = achievements.find(
    (achievement) => daysSinceStart < achievement.daysRequired,
  );

  const renderAchievement = ({
    item,
    index,
  }: {
    item: (typeof achievements)[0];
    index: number;
  }) => {
    const isEarned = daysSinceStart >= item.daysRequired;
    const isNext = item === nextAchievement;

    return (
      <View
        style={[
          styles.badgeContainer,
          {
            backgroundColor: isEarned
              ? `${item.color}20`
              : "rgba(128, 128, 128, 0.1)",
          },
          isNext && styles.nextBadgeContainer,
          isNext && { borderColor: item.color },
        ]}
      >
        <LinearGradient
          colors={
            isEarned
              ? [`${item.color}30`, `${item.color}10`]
              : ["rgba(128, 128, 128, 0.1)", "rgba(128, 128, 128, 0.05)"]
          }
          style={styles.badgeGradient}
        >
          <View
            style={[
              styles.badgeIcon,
              {
                backgroundColor: isEarned
                  ? item.color
                  : "rgba(128, 128, 128, 0.3)",
              },
            ]}
          >
            <ThemedText
              style={[styles.badgeEmoji, { opacity: isEarned ? 1 : 0.5 }]}
            >
              {item.icon}
            </ThemedText>
          </View>
          <ThemedText
            style={[
              styles.badgeTitle,
              { color: textColor, opacity: isEarned ? 1 : 0.6 },
            ]}
          >
            {item.title}
          </ThemedText>
          <ThemedText
            style={[
              styles.badgeDescription,
              { color: textColor, opacity: isEarned ? 0.8 : 0.4 },
            ]}
          >
            {item.description}
          </ThemedText>
          {isNext && (
            <ThemedText style={[styles.daysLeft, { color: item.color }]}>
              {item.daysRequired - daysSinceStart} days to go
            </ThemedText>
          )}
          {isEarned && (
            <View style={[styles.earnedBadge, { backgroundColor: item.color }]}>
              <ThemedText style={styles.earnedText}>✓</ThemedText>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[
          "rgba(255, 193, 7, 0.1)",
          "rgba(255, 152, 0, 0.1)",
          "rgba(255, 193, 7, 0.05)",
        ]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.headerIcon, { color: "#FFD700" }]}>
            🏆
          </ThemedText>
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Achievements
          </ThemedText>
        </View>

        {/* Progress Summary */}
        <View
          style={[
            styles.summaryContainer,
            { backgroundColor: "rgba(255, 193, 7, 0.15)" },
          ]}
        >
          <ThemedText style={[styles.summaryText, { color: textColor }]}>
            {earnedAchievements.length} of {achievements.length} badges earned!
            🎯
          </ThemedText>
          {nextAchievement && (
            <ThemedText
              style={[styles.nextAchievementText, { color: textColor }]}
            >
              Next: {nextAchievement.title} in{" "}
              {nextAchievement.daysRequired - daysSinceStart} days
            </ThemedText>
          )}
        </View>

        {/* Achievement Badges Grid */}
        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.badgesGrid}
          columnWrapperStyle={styles.badgeRow}
        />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 4,
  },
  nextAchievementText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    opacity: 0.8,
  },
  badgesGrid: {
    alignItems: "stretch",
  },
  badgeRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badgeContainer: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  nextBadgeContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
  },
  badgeGradient: {
    padding: 16,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeTitle: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 10,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    lineHeight: 14,
  },
  daysLeft: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    marginTop: 4,
  },
  earnedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  earnedText: {
    fontSize: 12,
    color: "white",
    fontFamily: FontFamily.bold,
  },
});
