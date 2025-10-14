import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    CrownIcon,
    FireIcon,
    HeartAddIcon,
    Leaf01Icon,
    Medal01Icon,
    ShieldIcon,
    StarIcon,
    Wav01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, {
    Circle,
    Defs,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { ThemedText } from "./ThemedText";

interface SobrietyProgressCardProps {
  startDate: Date;
}

const { width: screenWidth } = Dimensions.get("window");

export default function SobrietyProgressCard({
  startDate,
}: SobrietyProgressCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
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
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    return {
      days: diffDays,
      hours: diffHours,
      minutes: diffMinutes,
      weeks: diffWeeks,
      months: diffMonths,
    };
  };

  const getMilestone = (days: number) => {
    if (days >= 365)
      return {
        text: "Champion",
        icon: CrownIcon,
        color: "#FFD700",
        nextMilestone: "Lifetime Hero",
        daysToNext: 730 - days,
      };
    if (days >= 180)
      return {
        text: "Warrior",
        icon: ShieldIcon,
        color: "#FF6B6B",
        nextMilestone: "Champion",
        daysToNext: 365 - days,
      };
    if (days >= 90)
      return {
        text: "Fighter",
        icon: Medal01Icon,
        color: "#4ECDC4",
        nextMilestone: "Warrior",
        daysToNext: 180 - days,
      };
    if (days >= 30)
      return {
        text: "Strong",
        icon: FireIcon,
        color: "#45B7D1",
        nextMilestone: "Fighter",
        daysToNext: 90 - days,
      };
    if (days >= 7)
      return {
        text: "Committed",
        icon: StarIcon,
        color: "#96CEB4",
        nextMilestone: "Strong",
        daysToNext: 30 - days,
      };
    if (days >= 1)
      return {
        text: "Brave",
        icon: Leaf01Icon,
        color: "#FFEAA7",
        nextMilestone: "Committed",
        daysToNext: 7 - days,
      };
    return {
      text: "Starting",
      icon: Leaf01Icon,
      color: "#DDA0DD",
      nextMilestone: "Brave",
      daysToNext: 1 - days,
    };
  };

  const progress = calculateProgress();
  const milestone = getMilestone(progress.days);

  const getProgressPercentage = () => {
    // Progress to next milestone
    const milestoneTargets = [1, 7, 30, 90, 180, 365, 730];
    const currentTarget =
      milestoneTargets.find((target) => target > progress.days) || 730;
    const previousTarget =
      milestoneTargets[milestoneTargets.indexOf(currentTarget) - 1] || 0;

    const progressInCurrentMilestone = progress.days - previousTarget;
    const totalMilestoneRange = currentTarget - previousTarget;

    return (progressInCurrentMilestone / totalMilestoneRange) * 100;
  };

  const getDailyProgress = () => {
    // Calculate progress through current day (24 hours)
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const msInDay = 24 * 60 * 60 * 1000;
    const msSinceStartOfDay = now.getTime() - startOfDay.getTime();
    return (msSinceStartOfDay / msInDay) * 100;
  };

  // Circle progress calculations
  const size = 280;
  const outerStrokeWidth = 20;
  const innerStrokeWidth = 16;
  const center = size / 2;
  const outerRadius = (size - outerStrokeWidth) / 2;
  const innerRadius = outerRadius - 30; // 30px gap between circles

  // Outer circle (24hr progress)
  const outerCircumference = 2 * Math.PI * outerRadius;
  const dailyProgress = getDailyProgress();
  const outerStrokeDashoffset =
    outerCircumference - (dailyProgress / 100) * outerCircumference;

  // Inner circle (overall goal progress)
  const innerCircumference = 2 * Math.PI * innerRadius;
  const overallProgress = getProgressPercentage();
  const innerStrokeDashoffset =
    innerCircumference - (overallProgress / 100) * innerCircumference;

  return (
    <View style={styles.container}>
      {/* Dual Circular Progress */}
      <View style={styles.circularProgressContainer}>
        <Svg width={size} height={size} style={styles.progressSvg}>
          <Defs>
            <SvgLinearGradient
              id="dailyGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
              <Stop offset="50%" stopColor="#FF8E8E" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FF6B6B" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient
              id="overallGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
              <Stop offset="50%" stopColor="#66BB6A" stopOpacity="1" />
              <Stop offset="100%" stopColor="#4CAF50" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>

          {/* Outer Circle Background (24hr) */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
            strokeWidth={outerStrokeWidth}
            fill="none"
          />

          {/* Outer Circle Progress (24hr) */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke="url(#dailyGradient)"
            strokeWidth={outerStrokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerStrokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* Inner Circle Background (Overall) */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
            strokeWidth={innerStrokeWidth}
            fill="none"
          />

          {/* Inner Circle Progress (Overall) */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke="url(#overallGradient)"
            strokeWidth={innerStrokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerStrokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        {/* Center Content */}
        <View style={styles.centerContent}>
          <ThemedText
            style={[
              styles.mainNumber,
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            {progress.days}
          </ThemedText>
          <ThemedText
            style={[
              styles.mainLabel,
              isDark ? styles.subtitleDark : styles.subtitleLight,
            ]}
          >
            {progress.days === 1 ? "day" : "days"}
          </ThemedText>
        </View>
      </View>

      {/* Milestone Badge */}
      <View style={styles.milestoneSection}>
        <View
          style={[
            styles.milestoneBadge,
            { backgroundColor: `${milestone.color}15` },
          ]}
        >
          <HugeiconsIcon
            icon={milestone.icon}
            size={16}
            color={milestone.color}
            strokeWidth={2}
          />
          <ThemedText
            style={[styles.milestoneText, { color: milestone.color }]}
          >
            {milestone.text}
          </ThemedText>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteSection}>
        <ThemedText
          style={[
            styles.quoteText,
            isDark ? styles.textDark : styles.textLight,
          ]}
        >
          More is more when it comes to sobriety
        </ThemedText>
        <ThemedText
          style={[
            styles.quoteDescription,
            isDark ? styles.subtitleDark : styles.subtitleLight,
          ]}
        >
          {progress.days === 0
            ? "Taking the first step is the hardest part. You're already winning by being here."
            : progress.days < 7
              ? "Each day clean is a victory. Your body is already starting to heal and recover."
              : progress.days < 30
                ? "You're rewiring your brain for success. The hardest part is behind you."
                : progress.days < 90
                  ? "Your commitment is transforming your life. Keep building on this incredible foundation."
                  : "You're an inspiration! Your journey shows others that recovery is possible."}
        </ThemedText>
      </View>

      {/* Recovery Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsTitleContainer}>
          <ThemedText
            style={[
              styles.metricsTitle,
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            RECOVERY METRICS
          </ThemedText>
        </View>
        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricBadge,
              {
                backgroundColor: isDark
                  ? "rgba(76,175,80,0.2)"
                  : "rgba(76,175,80,0.15)",
              },
            ]}
          >
            <HugeiconsIcon
              icon={HeartAddIcon}
              size={16}
              color="#4CAF50"
              strokeWidth={2}
            />
            <ThemedText style={[styles.metricText, { color: "#4CAF50" }]}>
              Health
            </ThemedText>
          </View>
          <View
            style={[
              styles.metricBadge,
              {
                backgroundColor: isDark
                  ? "rgba(76,175,80,0.2)"
                  : "rgba(76,175,80,0.15)",
              },
            ]}
          >
            <HugeiconsIcon
              icon={Wav01Icon}
              size={16}
              color="#4CAF50"
              strokeWidth={2}
            />
            <ThemedText style={[styles.metricText, { color: "#4CAF50" }]}>
              Mind
            </ThemedText>
          </View>
          <View
            style={[
              styles.metricBadge,
              {
                backgroundColor: isDark
                  ? "rgba(76,175,80,0.2)"
                  : "rgba(76,175,80,0.15)",
              },
            ]}
          >
            <HugeiconsIcon
              icon={StarIcon}
              size={16}
              color="#4CAF50"
              strokeWidth={2}
            />
            <ThemedText style={[styles.metricText, { color: "#4CAF50" }]}>
              Spirit
            </ThemedText>
          </View>
        </View>
        <View style={styles.metricsSummaryContainer}>
          <ThemedText
            style={[
              styles.metricsSummary,
              isDark ? styles.subtitleDark : styles.subtitleLight,
            ]}
          >
            {progress.days > 0
              ? `${Math.min(3, Math.floor(progress.days / 30) + 1)}/3 metrics improving`
              : "Start your journey to wellness"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    minHeight: 580,
  },
  circularProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    height: 280,
  },
  progressSvg: {
    position: "absolute",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainNumber: {
    fontSize: 84,
    fontFamily: FontFamily.bold,
    lineHeight: 88,
    marginBottom: -4,
  },
  mainLabel: {
    fontSize: 18,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.5,
  },
  milestoneSection: {
    alignItems: "center",
    marginBottom: 14,
  },
  milestoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  milestoneText: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.5,
  },
  quoteSection: {
    paddingHorizontal: 32,
    marginBottom: 28,
  },
  quoteText: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  timeDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  timeDetail: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    letterSpacing: 1,
  },
  metricsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: "100%",
  },
  metricsTitleContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  metricsTitle: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  metricBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  metricsSummaryContainer: {
    alignItems: "center",
    width: "100%",
  },
  metricsSummary: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    textAlign: "center",
  },
  textLight: {
    color: "#1A1A1A",
  },
  textDark: {
    color: "#FFFFFF",
  },
  subtitleLight: {
    color: "rgba(26,26,26,0.6)",
  },
  subtitleDark: {
    color: "rgba(255,255,255,0.6)",
  },
});
