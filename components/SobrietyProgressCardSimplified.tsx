import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    CrownIcon,
    FireIcon,
    Leaf01Icon,
    Medal01Icon,
    ShieldIcon,
    StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import Svg, {
    Circle,
    Defs,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { ThemedText } from "./ThemedText";

interface SobrietyProgressCardSimplifiedProps {
  startDate: Date;
}

const { width: screenWidth } = Dimensions.get("window");

export default function SobrietyProgressCardSimplified({
  startDate,
}: SobrietyProgressCardSimplifiedProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  const [showDetails, setShowDetails] = useState(false);
  const [heightAnim] = useState(new Animated.Value(0));

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
      daysToNext: 1,
    };
  };

  const progress = calculateProgress();
  const milestone = getMilestone(progress.days);

  const getProgressPercentage = () => {
    const milestoneTargets = [1, 7, 30, 90, 180, 365, 730];
    const currentTarget =
      milestoneTargets.find((target) => target > progress.days) || 730;
    const previousTarget =
      milestoneTargets[milestoneTargets.indexOf(currentTarget) - 1] || 0;

    const progressInCurrentMilestone = progress.days - previousTarget;
    const totalMilestoneRange = currentTarget - previousTarget;

    return (progressInCurrentMilestone / totalMilestoneRange) * 100;
  };

  // Circle progress calculations
  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = getProgressPercentage();
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetails(!showDetails);

    Animated.timing(heightAnim, {
      toValue: showDetails ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
          },
        ]}
      >
        <BlurView
          tint={isDark ? "dark" : "light"}
          intensity={isDark ? 60 : 40}
          style={styles.blurBackground}
        />

        <LinearGradient
          colors={
            isDark
              ? ["rgba(76,175,80,0.25)", "rgba(129,199,132,0.15)", "transparent"]
              : ["rgba(76,175,80,0.15)", "rgba(129,199,132,0.1)", "transparent"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />

        <View style={styles.mainContent}>
          {/* Circular Progress */}
          <View style={styles.circularProgressContainer}>
            <Svg width={size} height={size} style={styles.progressSvg}>
              <Defs>
                <SvgLinearGradient
                  id="progressGradient"
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

              {/* Background Circle */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Progress Circle */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
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

          {/* Right Side Info */}
          <View style={styles.rightContent}>
            {/* Milestone Badge */}
            <View
              style={[
                styles.milestoneBadge,
                { backgroundColor: `${milestone.color}15` },
              ]}
            >
              <HugeiconsIcon
                icon={milestone.icon}
                size={14}
                color={milestone.color}
                strokeWidth={2}
              />
              <ThemedText
                style={[styles.milestoneText, { color: milestone.color }]}
              >
                {milestone.text}
              </ThemedText>
            </View>

            {/* Progress to Next */}
            <View style={styles.nextMilestoneContainer}>
              <ThemedText
                style={[
                  styles.nextMilestoneLabel,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                Next milestone
              </ThemedText>
              <ThemedText
                style={[
                  styles.nextMilestoneValue,
                  isDark ? styles.textDark : styles.textLight,
                ]}
              >
                {milestone.daysToNext} days
              </ThemedText>
              <View style={styles.miniProgressBar}>
                <View
                  style={[
                    styles.miniProgressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: milestone.color,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Expand Hint */}
            <ThemedText
              style={[
                styles.expandHint,
                isDark ? styles.subtitleDark : styles.subtitleLight,
              ]}
            >
              Tap for details
            </ThemedText>
          </View>
        </View>

        {/* Expandable Details */}
        {showDetails && (
          <Animated.View
            style={[
              styles.detailsContainer,
              {
                opacity: heightAnim,
              },
            ]}
          >
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <ThemedText
                  style={[
                    styles.detailValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {progress.hours}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.detailLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  hours
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText
                  style={[
                    styles.detailValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {progress.minutes}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.detailLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  minutes
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText
                  style={[
                    styles.detailValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {Math.floor(progress.days / 7)}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.detailLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  weeks
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  circularProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 200,
  },
  progressSvg: {
    position: "absolute",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainNumber: {
    fontSize: 64,
    fontFamily: FontFamily.bold,
    lineHeight: 68,
  },
  mainLabel: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.5,
  },
  rightContent: {
    flex: 1,
    gap: 12,
  },
  milestoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
    alignSelf: "flex-start",
  },
  milestoneText: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.3,
  },
  nextMilestoneContainer: {
    gap: 4,
  },
  nextMilestoneLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  nextMilestoneValue: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  expandHint: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 8,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
  },
  detailValue: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
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
