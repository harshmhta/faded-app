import { FontFamily } from "@/constants/Fonts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface SobrietyProgressCardProps {
  startDate: Date;
}

export default function SobrietyProgressCard({
  startDate,
}: SobrietyProgressCardProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const calculateProgress = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    return { days: diffDays, hours: diffHours, minutes: diffMinutes };
  };

  const getMilestone = (days: number) => {
    if (days >= 365) return { text: "Champion", icon: "👑", color: "#FFD700" };
    if (days >= 180) return { text: "Warrior", icon: "⚔️", color: "#FF6B6B" };
    if (days >= 90) return { text: "Fighter", icon: "💪", color: "#4ECDC4" };
    if (days >= 30) return { text: "Strong", icon: "🔥", color: "#45B7D1" };
    if (days >= 7) return { text: "Committed", icon: "🌟", color: "#96CEB4" };
    if (days >= 1) return { text: "Brave", icon: "🌱", color: "#FFEAA7" };
    return { text: "Starting", icon: "🌱", color: "#DDA0DD" };
  };

  const progress = calculateProgress();
  const milestone = getMilestone(progress.days);

  const getProgressPercentage = () => {
    const targetDays = 365; // 1 year target
    return Math.min((progress.days / targetDays) * 100, 100);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={["rgba(76, 175, 80, 0.1)", "rgba(76, 175, 80, 0.05)"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.milestoneContainer}>
            <ThemedText
              style={[styles.milestoneIcon, { color: milestone.color }]}
            >
              {milestone.icon}
            </ThemedText>
            <ThemedText
              style={[styles.milestoneText, { color: milestone.color }]}
            >
              {milestone.text}
            </ThemedText>
          </View>
        </View>

        {/* Main Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.timeContainer}>
            <View style={styles.timeBlock}>
              <ThemedText style={[styles.timeNumber, { color: textColor }]}>
                {progress.days}
              </ThemedText>
              <ThemedText style={[styles.timeLabel, { color: textColor }]}>
                {progress.days === 1 ? "Day" : "Days"}
              </ThemedText>
            </View>
            <View style={styles.timeBlock}>
              <ThemedText style={[styles.timeNumber, { color: textColor }]}>
                {progress.hours}
              </ThemedText>
              <ThemedText style={[styles.timeLabel, { color: textColor }]}>
                {progress.hours === 1 ? "Hour" : "Hours"}
              </ThemedText>
            </View>
            <View style={styles.timeBlock}>
              <ThemedText style={[styles.timeNumber, { color: textColor }]}>
                {progress.minutes}
              </ThemedText>
              <ThemedText style={[styles.timeLabel, { color: textColor }]}>
                {progress.minutes === 1 ? "Minute" : "Minutes"}
              </ThemedText>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarBackground,
                { backgroundColor: "rgba(76, 175, 80, 0.2)" },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: "#4CAF50",
                  },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: textColor }]}>
              {getProgressPercentage().toFixed(1)}% to 1 year milestone
            </ThemedText>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.messageContainer}>
          <ThemedText style={[styles.messageText, { color: textColor }]}>
            {progress.days === 0
              ? "Every journey begins with a single step. You've got this! 🌟"
              : progress.days < 7
                ? "You're building incredible strength. Keep going! 💪"
                : progress.days < 30
                  ? "Amazing progress! Your body is already healing. 🌱"
                  : progress.days < 90
                    ? "You're becoming unstoppable! Look how far you've come! 🔥"
                    : "You're an inspiration! Your dedication is paying off! 👑"}
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
    marginBottom: 24,
  },
  milestoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  milestoneIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  milestoneText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  progressContainer: {
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
  },
  timeBlock: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  timeNumber: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  progressBarContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  messageContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    lineHeight: 20,
  },
});
