import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { sobrietyTimerService } from "@/lib/appwrite";
import {
  CrownIcon,
  Edit02Icon,
  FireIcon,
  Leaf01Icon,
  Medal01Icon,
  RefreshIcon,
  ShieldIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "./ThemedText";

interface SobrietyTimerCardProps {
  userId: string;
  onReset?: () => void;
}

export interface SobrietyTimerCardRef {
  openResetModal: () => void;
}

const SobrietyTimerCard = React.forwardRef<
  SobrietyTimerCardRef,
  SobrietyTimerCardProps
>(({ userId, onReset }, ref) => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempStartTime, setTempStartTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load timer from database
  useEffect(() => {
    loadTimer();
  }, [userId]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadTimer = async () => {
    try {
      setIsLoading(true);
      const timer = await sobrietyTimerService.getSobrietyTimer(userId);
      if (timer) {
        setStartTime(new Date(timer.startTime));
      }
    } catch (error) {
      console.error("Error loading sobriety timer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeDifference = () => {
    const diffMs = currentTime.getTime() - startTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    return {
      days: diffDays,
      hours: diffHours % 24,
      minutes: diffMins % 60,
      seconds: diffSecs % 60,
      totalHours: diffHours,
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
      daysToNext: 1,
    };
  };

  const handleResetPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTempStartTime(new Date());
    setShowResetModal(true);
  };

  // Expose method to parent component via ref
  React.useImperativeHandle(ref, () => ({
    openResetModal: handleResetPress,
  }));

  const handleConfirmReset = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await sobrietyTimerService.resetSobrietyTimer(
        userId,
        tempStartTime.toISOString()
      );
      setStartTime(tempStartTime);
      setShowResetModal(false);
      onReset?.();
    } catch (error) {
      console.error("Error resetting timer:", error);
    }
  };

  const handleCancelReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowResetModal(false);
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? "rgba(0,0,0,0.3)"
              : "rgba(255,255,255,0.7)",
          },
        ]}
      >
        <BlurView
          tint={isDark ? "dark" : "light"}
          intensity={isDark ? 60 : 40}
          style={styles.blurBackground}
        />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  const timeDiff = calculateTimeDifference();
  const milestone = getMilestone(timeDiff.days);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? "rgba(0,0,0,0.3)"
              : "rgba(255,255,255,0.7)",
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
              ? [
                  "rgba(76,175,80,0.25)",
                  "rgba(129,199,132,0.15)",
                  "transparent",
                ]
              : [
                  "rgba(76,175,80,0.15)",
                  "rgba(129,199,132,0.1)",
                  "transparent",
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />

        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText
              style={[
                styles.headerTitle,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              I've been sober for
            </ThemedText>
            <Pressable
              onPress={handleResetPress}
              style={({ pressed }) => [
                styles.resetButton,
                {
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={20}
                color={isDark ? "#FFFFFF" : "#000000"}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <View style={styles.timerRow}>
              <View style={styles.timeUnit}>
                <ThemedText
                  style={[
                    styles.timeValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {timeDiff.days}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timeLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  {timeDiff.days === 1 ? "day" : "days"}
                </ThemedText>
              </View>

              <ThemedText
                style={[
                  styles.timeSeparator,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                :
              </ThemedText>

              <View style={styles.timeUnit}>
                <ThemedText
                  style={[
                    styles.timeValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {String(timeDiff.hours).padStart(2, "0")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timeLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  hours
                </ThemedText>
              </View>

              <ThemedText
                style={[
                  styles.timeSeparator,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                :
              </ThemedText>

              <View style={styles.timeUnit}>
                <ThemedText
                  style={[
                    styles.timeValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {String(timeDiff.minutes).padStart(2, "0")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timeLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  mins
                </ThemedText>
              </View>

              <ThemedText
                style={[
                  styles.timeSeparator,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                :
              </ThemedText>

              <View style={styles.timeUnit}>
                <ThemedText
                  style={[
                    styles.timeValue,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {String(timeDiff.seconds).padStart(2, "0")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timeLabel,
                    isDark ? styles.subtitleDark : styles.subtitleLight,
                  ]}
                >
                  secs
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Milestone Badge */}
          <View style={styles.milestoneContainer}>
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
            {milestone.daysToNext > 0 && (
              <ThemedText
                style={[
                  styles.nextMilestoneText,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                {milestone.daysToNext} days to {milestone.nextMilestone}
              </ThemedText>
            )}
          </View>
        </View>
      </View>

      {/* Reset Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelReset}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleCancelReset}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark
                  ? "rgba(30,30,30,0.98)"
                  : "rgba(255,255,255,0.98)",
              },
            ]}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={80}
              style={styles.modalBlur}
            />

            <View style={styles.modalInner}>
              <ThemedText
                style={[
                  styles.modalTitle,
                  isDark ? styles.textDark : styles.textLight,
                ]}
              >
                Reset Sobriety Timer
              </ThemedText>
              <ThemedText
                style={[
                  styles.modalDescription,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                Set when you started your sobriety journey
              </ThemedText>

              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempStartTime}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempStartTime(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  textColor={isDark ? "#FFFFFF" : "#000000"}
                  themeVariant={isDark ? "dark" : "light"}
                />
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={handleCancelReset}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.cancelButton,
                    {
                      opacity: pressed ? 0.6 : 1,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.modalButtonText,
                      isDark ? styles.textDark : styles.textLight,
                    ]}
                  >
                    Cancel
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={handleConfirmReset}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.confirmButton,
                    {
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#4CAF50", "#66BB6A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButtonGradient}
                  >
                    <ThemedText style={styles.confirmButtonText}>
                      Start Timer
                    </ThemedText>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});

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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  mainContent: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  resetButton: {
    padding: 8,
  },
  timerContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeUnit: {
    alignItems: "center",
    minWidth: 56,
  },
  timeValue: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    lineHeight: 36,
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    marginTop: 2,
  },
  timeSeparator: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    marginBottom: 16,
  },
  milestoneContainer: {
    alignItems: "center",
    gap: 8,
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
    letterSpacing: 0.3,
  },
  nextMilestoneText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalInner: {
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
  },
  datePickerContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButton: {
    overflow: "hidden",
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: "#FFFFFF",
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

export default SobrietyTimerCard;
