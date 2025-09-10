import { FontFamily } from "@/constants/Fonts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface HealthBenefitsCardProps {
  startDate: Date;
}

const healthBenefits = [
  {
    timeframe: "20 minutes",
    title: "Heart Rate Normalizes",
    description: "Your heart rate and blood pressure drop to normal levels",
    icon: "💓",
    color: "#FF6B6B",
    achieved: true,
  },
  {
    timeframe: "2 hours",
    title: "Improved Circulation",
    description: "Blood circulation improves, especially to hands and feet",
    icon: "🫀",
    color: "#4ECDC4",
    achieved: true,
  },
  {
    timeframe: "24 hours",
    title: "Anxiety Peaks",
    description: "Withdrawal symptoms peak but your body starts healing",
    icon: "🧠",
    color: "#45B7D1",
    achieved: true,
  },
  {
    timeframe: "3 days",
    title: "Breathing Improves",
    description: "Lung function increases and breathing becomes easier",
    icon: "🫁",
    color: "#96CEB4",
    achieved: false,
  },
  {
    timeframe: "1 week",
    title: "Sleep Quality",
    description: "Sleep patterns begin to normalize and improve",
    icon: "😴",
    color: "#FFEAA7",
    achieved: false,
  },
  {
    timeframe: "2 weeks",
    title: "Mental Clarity",
    description: "Concentration and mental clarity significantly improve",
    icon: "🎯",
    color: "#DDA0DD",
    achieved: false,
  },
  {
    timeframe: "1 month",
    title: "Mood Stabilizes",
    description: "Mood swings reduce and emotional stability improves",
    icon: "😊",
    color: "#98D8C8",
    achieved: false,
  },
  {
    timeframe: "3 months",
    title: "Memory Enhancement",
    description: "Short-term memory and cognitive function improve",
    icon: "🧩",
    color: "#F7DC6F",
    achieved: false,
  },
  {
    timeframe: "6 months",
    title: "Lung Healing",
    description: "Lung capacity increases and respiratory health improves",
    icon: "💨",
    color: "#AED6F1",
    achieved: false,
  },
  {
    timeframe: "1 year",
    title: "Complete Recovery",
    description: "Brain chemistry normalizes and addiction pathways weaken",
    icon: "🏆",
    color: "#FFD700",
    achieved: false,
  },
];

export default function HealthBenefitsCard({
  startDate,
}: HealthBenefitsCardProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const calculateProgress = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    return { days: diffDays, hours: diffHours, minutes: diffMinutes };
  };

  const getBenefitStatus = (timeframe: string, progress: any) => {
    const { days, hours, minutes } = progress;

    switch (timeframe) {
      case "20 minutes":
        return minutes >= 20;
      case "2 hours":
        return hours >= 2;
      case "24 hours":
        return days >= 1;
      case "3 days":
        return days >= 3;
      case "1 week":
        return days >= 7;
      case "2 weeks":
        return days >= 14;
      case "1 month":
        return days >= 30;
      case "3 months":
        return days >= 90;
      case "6 months":
        return days >= 180;
      case "1 year":
        return days >= 365;
      default:
        return false;
    }
  };

  const progress = calculateProgress();
  const achievedBenefits = healthBenefits.filter((benefit) =>
    getBenefitStatus(benefit.timeframe, progress),
  );
  const nextBenefit = healthBenefits.find(
    (benefit) => !getBenefitStatus(benefit.timeframe, progress),
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[
          "rgba(76, 175, 80, 0.1)",
          "rgba(33, 150, 243, 0.1)",
          "rgba(76, 175, 80, 0.05)",
        ]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.headerIcon, { color: "#4CAF50" }]}>
            🌱
          </ThemedText>
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Health Benefits
          </ThemedText>
        </View>

        {/* Progress Summary */}
        <View
          style={[
            styles.summaryContainer,
            { backgroundColor: "rgba(76, 175, 80, 0.1)" },
          ]}
        >
          <ThemedText style={[styles.summaryText, { color: textColor }]}>
            {achievedBenefits.length} of {healthBenefits.length} benefits
            achieved! 🎉
          </ThemedText>
        </View>

        {/* Next Benefit */}
        {nextBenefit && (
          <View
            style={[
              styles.nextBenefitContainer,
              { backgroundColor: `${nextBenefit.color}20` },
            ]}
          >
            <View style={styles.nextBenefitHeader}>
              <ThemedText
                style={[styles.nextBenefitIcon, { color: nextBenefit.color }]}
              >
                {nextBenefit.icon}
              </ThemedText>
              <View style={styles.nextBenefitTextContainer}>
                <ThemedText
                  style={[styles.nextBenefitTitle, { color: textColor }]}
                >
                  Coming up: {nextBenefit.title}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.nextBenefitTimeframe,
                    { color: nextBenefit.color },
                  ]}
                >
                  In {nextBenefit.timeframe}
                </ThemedText>
              </View>
            </View>
            <ThemedText
              style={[styles.nextBenefitDescription, { color: textColor }]}
            >
              {nextBenefit.description}
            </ThemedText>
          </View>
        )}

        {/* Benefits Timeline */}
        <View style={styles.timelineContainer}>
          <ThemedText style={[styles.timelineTitle, { color: textColor }]}>
            Your Health Journey
          </ThemedText>
          <ScrollView
            style={styles.timelineScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {healthBenefits.map((benefit, index) => {
              const isAchieved = getBenefitStatus(benefit.timeframe, progress);

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineIcon,
                        {
                          backgroundColor: isAchieved
                            ? benefit.color
                            : `${benefit.color}30`,
                          borderColor: benefit.color,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.timelineEmoji,
                          { opacity: isAchieved ? 1 : 0.5 },
                        ]}
                      >
                        {benefit.icon}
                      </ThemedText>
                    </View>
                    {index < healthBenefits.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: isAchieved
                              ? benefit.color
                              : `${benefit.color}30`,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <ThemedText
                          style={[
                            styles.timelineTimeframe,
                            {
                              color: benefit.color,
                              opacity: isAchieved ? 1 : 0.7,
                            },
                          ]}
                        >
                          {benefit.timeframe}
                        </ThemedText>
                        {isAchieved && (
                          <ThemedText
                            style={[
                              styles.achievedBadge,
                              { color: benefit.color },
                            ]}
                          >
                            ✓ Achieved
                          </ThemedText>
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.timelineItemTitle,
                          {
                            color: textColor,
                            opacity: isAchieved ? 1 : 0.7,
                          },
                        ]}
                      >
                        {benefit.title}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.timelineDescription,
                          {
                            color: textColor,
                            opacity: isAchieved ? 0.8 : 0.5,
                          },
                        ]}
                      >
                        {benefit.description}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
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
  },
  nextBenefitContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  nextBenefitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  nextBenefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nextBenefitTextContainer: {
    flex: 1,
  },
  nextBenefitTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 2,
  },
  nextBenefitTimeframe: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  nextBenefitDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    opacity: 0.8,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 16,
    textAlign: "center",
  },
  timelineScroll: {
    maxHeight: 300,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineEmoji: {
    fontSize: 18,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
    minHeight: 30,
  },
  timelineRight: {
    flex: 1,
  },
  timelineContent: {
    paddingTop: 4,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineTimeframe: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    textTransform: "uppercase",
  },
  achievedBadge: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
  },
  timelineItemTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
  },
});
