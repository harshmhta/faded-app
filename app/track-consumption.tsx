import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { sobrietyTimerService } from "@/lib/appwrite";
import { Cancel01Icon, CancelCircleHalfDotIcon, FirePitIcon } from "@hugeicons/core-free-icons";
import { useConsumption } from "@/contexts/ConsumptionContext";
import { HugeiconsIcon } from "@hugeicons/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  InputAccessoryView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import {
  KeyboardAwareScrollView,
  useKeyboardHandler,
} from "react-native-keyboard-controller";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");
const WEEK_WIDTH = screenWidth - 75;
const WEEK_SPACING = 30;

const CONSUMPTION_OPTIONS = [
  { id: "clean", icon: CancelCircleHalfDotIcon, label: "Didn't Smoke", color: "#4CAF50" },
  { id: "smoked", icon: FirePitIcon, label: "Smoked", color: "#F44336" },
];

export default function TrackConsumptionScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { consumptionHistory, loadConsumptionHistory, saveConsumption, isLoading: isLoadingHistory } = useConsumption();

  // Parse date from URL params if provided
  const initialDate = params.date 
    ? new Date(params.date as string + 'T00:00:00')
    : new Date();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(3);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResettingTimer, setIsResettingTimer] = useState(false);
  const [resetStartTime, setResetStartTime] = useState<Date>(new Date());

  const scrollViewRef = useRef<ScrollView>(null);
  const calendarScrollRef = useRef<ScrollView>(null);
  const keyboardHeight = useSharedValue(0);
  const [isCalendarReady, setIsCalendarReady] = useState(false);

  const today = new Date();

  // Keyboard handler
  useKeyboardHandler({
    onStart: (e) => {
      "worklet";
      if (e.height > 0) {
        keyboardHeight.value = withSpring(e.height, {
          damping: 80,
          stiffness: 800,
        });
      } else {
        keyboardHeight.value = withSpring(0, {
          damping: 50,
          stiffness: 400,
        });
      }
    },
    onMove: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
  });

  // Track keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Generate 4 weeks of dates (3 weeks prior + current week)
  const generateWeeks = () => {
    const today = new Date();
    const weeks: Date[][] = [];

    for (let weekOffset = -3; weekOffset <= 0; weekOffset++) {
      const weekDates: Date[] = [];
      const startOfWeek = new Date(today);

      const currentDay = today.getDay();
      startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + dayOffset);
        weekDates.push(date);
      }

      weeks.push(weekDates);
    }

    return weeks;
  };

  const [weeks] = useState(generateWeeks());
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Load consumption history on mount
  useEffect(() => {
    const startDate = new Date(weeks[0][0]);
    const endDate = new Date(weeks[weeks.length - 1][6]);
    loadConsumptionHistory(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
  }, []);

  // Load consumption for selected date
  useEffect(() => {
    loadConsumptionForDate(selectedDate);
  }, [selectedDate, consumptionHistory]);

  const loadConsumptionForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const tracking = consumptionHistory.get(dateStr);

    if (tracking) {
      setSelectedStatus(tracking.status);
      setComment(tracking.comment || "");
    } else {
      setSelectedStatus(null);
      setComment("");
    }
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isFutureDate = (date: Date) => {
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return dateOnly > todayOnly;
  };

  const handleSaveConsumption = async () => {
    if (!selectedStatus || !user) return;

    if (isFutureDate(selectedDate)) {
      return;
    }

    // If user selected "smoked" and it's today, show reset modal
    if (selectedStatus === "smoked" && isToday(selectedDate)) {
      setResetStartTime(new Date());
      setShowResetModal(true);
      return;
    }

    // Otherwise save directly
    await saveConsumptionTracking();
  };

  const saveConsumptionTracking = async () => {
    if (!selectedStatus || !user) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      
      // Use context's optimistic update
      await saveConsumption(selectedStatus, comment, dateStr);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Close modal after successful save if it's today
      if (isToday(selectedDate)) {
        setTimeout(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error saving consumption:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTimer = async () => {
    if (!user) return;

    setIsResettingTimer(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Reset the sobriety timer with selected time
      await sobrietyTimerService.resetSobrietyTimer(user.$id, resetStartTime.toISOString());

      // Save the consumption tracking
      await saveConsumptionTracking();

      setShowResetModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back to home with refresh flag
      setTimeout(() => {
        router.replace('/(tabs)?refreshTimer=true');
      }, 300);
    } catch (error) {
      console.error("Error resetting timer:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsResettingTimer(false);
    }
  };

  const handleGoBack = () => {
    setShowResetModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Scroll to current week when calendar is ready
  useEffect(() => {
    if (isCalendarReady && !isLoadingHistory) {
      const totalWeekWidth = WEEK_WIDTH + WEEK_SPACING;
      // Scroll to the last week (current week)
      setTimeout(() => {
        calendarScrollRef.current?.scrollTo({
          x: 3 * totalWeekWidth, // Index 3 is current week
          animated: false,
        });
      }, 150);
    }
  }, [isCalendarReady, isLoadingHistory]);

  const handleCalendarScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const totalWeekWidth = WEEK_WIDTH + WEEK_SPACING;
    const weekIndex = Math.round(contentOffsetX / totalWeekWidth);
    const clampedIndex = Math.max(0, Math.min(3, weekIndex));

    if (clampedIndex !== currentWeekIndex) {
      setCurrentWeekIndex(clampedIndex);
    }

    calendarScrollRef.current?.scrollTo({
      x: clampedIndex * totalWeekWidth,
      animated: true,
    });
  };

  const handleTouchStart = () => {
    scrollViewRef?.current?.setNativeProps({ scrollEnabled: false });
  };

  const handleTouchEnd = () => {
    scrollViewRef?.current?.setNativeProps({ scrollEnabled: true });
  };

  const renderWeek = (weekDates: Date[], weekIndex: number) => (
    <View
      key={weekIndex}
      style={[
        styles.weekContainer,
        { width: WEEK_WIDTH },
        weekIndex < weeks.length - 1 && { marginRight: WEEK_SPACING },
      ]}
    >
      {dayLabels.map((dayLabel, dayIndex) => {
        const date = weekDates[dayIndex];
        const isTodayDate = isToday(date);
        const isSelected =
          selectedDate?.toDateString() === date.toDateString();
        const dateStr = date.toISOString().split("T")[0];
        const hasTracking = consumptionHistory.has(dateStr);
        const trackingForDate = consumptionHistory.get(dateStr);

        return (
          <Pressable
            key={dayIndex}
            style={styles.dayContainer}
            onPress={() => {
              const isSame =
                selectedDate?.toDateString() === date.toDateString();
              if (!isSame) {
                setSelectedDate(date);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View
              style={[
                styles.dayCircle,
                isTodayDate && styles.todayCircle,
                isSelected && styles.selectedDayCircle,
                {
                  backgroundColor:
                    hasTracking && trackingForDate
                      ? trackingForDate.status === "clean"
                        ? isDark
                          ? "rgba(76, 175, 80, 0.2)"
                          : "rgba(76, 175, 80, 0.15)"
                        : isDark
                          ? "rgba(244, 67, 54, 0.2)"
                          : "rgba(244, 67, 54, 0.15)"
                      : "transparent",
                  borderColor: hasTracking && trackingForDate
                    ? trackingForDate.status === "clean"
                      ? "#4CAF50"
                      : "#F44336"
                    : isTodayDate
                      ? isDark
                        ? "#FFFFFF"
                        : "#000000"
                      : isSelected
                        ? isDark
                          ? "#FFFFFF"
                          : "#000000"
                        : "rgba(160, 160, 160, 0.3)",
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.dayLabel,
                  { opacity: isTodayDate || isSelected ? 1 : 0.5 },
                ]}
              >
                {dayLabel}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.dateNumber,
                (isSelected || isTodayDate) && styles.selectedDateNumber,
                { opacity: isTodayDate || isSelected ? 1 : 0.6 },
              ]}
            >
              {date.getDate()}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  const getStatusColor = (status: string | null) => {
    const statusOption = CONSUMPTION_OPTIONS.find((m) => m.id === status);
    return statusOption?.color || "#999";
  };

  const isSelectedDateToday = isToday(selectedDate);
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const hasHistoricalTracking = consumptionHistory.has(selectedDateStr);

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.background}
      darkColor={Colors.dark.background}
    >
      {/* Header with Drag Handle */}
      <View
        style={[styles.modalHeader, { paddingTop: insets.top > 0 ? 10 : 20 }]}
      >
        <View style={styles.dragHandle} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft} />
          <ThemedText style={styles.headerTitle}>Track Consumption</ThemedText>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={[styles.closeButton, isDark && styles.closeButtonDark]}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              color={isDark ? "#fff" : "#000"}
              strokeWidth={2.5}
            />
          </Pressable>
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (isKeyboardVisible ? 20 : 100) },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={Platform.OS === "ios" ? 20 : 0}
      >
        {/* Calendar Section */}
        <View
          style={[
            styles.section,
            styles.calendarSection,
            isDark ? styles.sectionDark : styles.sectionLight,
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={20}
            style={styles.sectionBlur}
          />

          <ThemedText style={styles.sectionTitle}>Your Journey</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { opacity: 0.5 }]}>
            Scroll to view your consumption history
          </ThemedText>

          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={isDark ? "#fff" : "#000"}
              />
            </View>
          ) : (
            <View style={styles.calendarContainer}>
              <ScrollView
                ref={calendarScrollRef}
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleCalendarScrollEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onScrollBeginDrag={handleTouchStart}
                onScrollEndDrag={handleTouchEnd}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={WEEK_WIDTH + WEEK_SPACING}
                snapToAlignment="start"
                contentContainerStyle={styles.scrollContent}
                onLayout={() => {
                  if (!isCalendarReady) {
                    setIsCalendarReady(true);
                  }
                }}
              >
                {weeks.map((weekDates, weekIndex) =>
                  renderWeek(weekDates, weekIndex)
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Mood Selection */}
        <View
          style={[
            styles.section,
            isDark ? styles.sectionDark : styles.sectionLight,
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={20}
            style={styles.sectionBlur}
          />

          <ThemedText style={styles.consumptionTitle}>
            Did you smoke today?
          </ThemedText>

          <View style={styles.moodGrid}>
            {CONSUMPTION_OPTIONS.map((option, index) => {
              const isSelected = selectedStatus === option.id;
              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    if (!isFutureDate(selectedDate)) {
                      setSelectedStatus(option.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.moodButton,
                    {
                      opacity: isFutureDate(selectedDate) ? 0.3 : pressed ? 0.8 : 1,
                    },
                  ]}
                  disabled={isFutureDate(selectedDate)}
                >
                  <View
                    style={[
                      styles.moodButtonInner,
                      {
                        backgroundColor: option.id === "clean"
                          ? (isDark ? "rgba(76, 175, 80, 0.15)" : "rgba(76, 175, 80, 0.08)")
                          : (isDark ? "rgba(244, 67, 54, 0.15)" : "rgba(244, 67, 54, 0.08)"),
                        borderColor: option.id === "clean"
                          ? (isDark ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.2)")
                          : (isDark ? "rgba(244, 67, 54, 0.3)" : "rgba(244, 67, 54, 0.2)"),
                      },
                    ]}
                  >
                    <BlurView
                      tint={isDark ? "dark" : "light"}
                      intensity={20}
                      style={styles.moodButtonBlur}
                    />
                    {/* Background Icon */}
                    <View style={styles.moodBackgroundIconContainer}>
                      <HugeiconsIcon
                        icon={option.icon}
                        size={60}
                        color={option.id === "clean" 
                          ? (isDark ? "rgba(76, 175, 80, 0.08)" : "rgba(76, 175, 80, 0.06)")
                          : (isDark ? "rgba(244, 67, 54, 0.08)" : "rgba(244, 67, 54, 0.06)")
                        }
                        strokeWidth={1.5}
                      />
                    </View>
                    <View style={styles.moodTextContainer}>
                      <ThemedText
                        style={[
                          styles.moodLabel,
                          isSelected && {
                            fontFamily: FontFamily.bold,
                          },
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Comment Section */}
        {selectedStatus && (
          <View
            style={[
              styles.section,
              isDark ? styles.sectionDark : styles.sectionLight,
            ]}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={20}
              style={styles.sectionBlur}
            />

            <ThemedText style={styles.noteTitle}>
              Add a note
            </ThemedText>

            <TextInput
              style={[
                styles.commentInput,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.02)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                },
              ]}
              placeholder="Share your thoughts, feelings, or reflections..."
              placeholderTextColor={
                isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
              }
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isFutureDate(selectedDate)}
              inputAccessoryViewID={Platform.OS === "ios" ? "doneButton" : undefined}
            />
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* iOS Input Accessory View - Done Button */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID="doneButton">
          <View
            style={[
              styles.inputAccessoryContainer,
              {
                backgroundColor: isDark
                  ? "rgba(28, 28, 30, 0.95)"
                  : "rgba(249, 249, 249, 0.95)",
                borderTopColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={90}
              style={StyleSheet.absoluteFill}
            />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.doneButton,
                {
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText style={styles.doneButtonText}>Done</ThemedText>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}

      {/* Floating Save Button */}
      {selectedStatus && !isFutureDate(selectedDate) && !isKeyboardVisible && (
        <View
          style={[
            styles.floatingButtonContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={80}
            style={styles.floatingButtonBlur}
          />
          <Pressable
            onPress={handleSaveConsumption}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: getStatusColor(selectedStatus),
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: isSaving ? 0.7 : 1,
              },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                {hasHistoricalTracking && !isSelectedDateToday
                  ? "Update Status"
                  : isSelectedDateToday && hasHistoricalTracking
                    ? "Update Today's Status"
                    : "Save Status"}
              </ThemedText>
            )}
          </Pressable>
        </View>
      )}

      {/* Reset Timer Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowResetModal(false)}
        >
          <Pressable
            style={[
              styles.resetModalContainer,
              isDark ? styles.resetModalDark : styles.resetModalLight,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={80}
              style={styles.resetModalBlur}
            />
            <View style={styles.resetModalContent}>
              <ThemedText style={styles.resetModalTitle}>
                Reset Sobriety Timer
              </ThemedText>
              <ThemedText style={styles.resetModalMessage}>
                Set when you started your sobriety journey
              </ThemedText>

              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={resetStartTime}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setResetStartTime(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  textColor={isDark ? "#FFFFFF" : "#000000"}
                  themeVariant={isDark ? "dark" : "light"}
                />
              </View>

              <View style={styles.resetModalButtons}>
                <Pressable
                  onPress={handleGoBack}
                  style={({ pressed }) => [
                    styles.resetModalButton,
                    styles.resetModalSecondaryButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.resetModalButtonText}>
                    Cancel
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleResetTimer}
                  disabled={isResettingTimer}
                  style={({ pressed }) => [
                    styles.resetModalButton,
                    styles.resetModalPrimaryButton,
                    {
                      backgroundColor: "#4CAF50",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {isResettingTimer ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <ThemedText
                      style={[styles.resetModalButtonText, { color: "#fff" }]}
                    >
                      Start Timer
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.15)",
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128, 128, 128, 0.12)",
  },
  closeButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  sectionLight: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(0,0,0,0.06)",
  },
  sectionDark: {
    backgroundColor: "rgba(16,16,16,0.6)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  sectionBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  noteTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  inlineDoneButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inlineDoneButtonText: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  calendarSection: {
    paddingBottom: 16,
  },
  calendarContainer: {
    height: 85,
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 1.4,
  },
  dayContainer: {
    alignItems: "center",
    flex: 1,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  todayCircle: {
    borderWidth: 2,
    borderStyle: "dashed",
  },
  selectedDayCircle: {
    borderWidth: 2,
    borderStyle: "solid",
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: FontFamily.medium,
  },
  dayIconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  moodIconContainer: {
    marginBottom: 8,
  },
  dateNumber: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: FontFamily.medium,
  },
  selectedDateNumber: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
  loadingContainer: {
    height: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  dateInfoContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateInfoText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    opacity: 0.7,
  },
  consumptionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 16,
    textAlign: "center",
  },
  noteTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    textAlign: "center",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  moodButton: {
    width: "48%",
  },
  moodButtonInner: {
    flexDirection: "column",
    alignItems: "center",
    height:80,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    justifyContent: "center",
  },
  moodButtonBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 18,
  },
  moodBackgroundIconContainer: {
    position: "absolute",
    right: -8,
    bottom: -8,
    opacity: 1,
    transform: [{ rotate: "15deg" }],
  },
  moodTextContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  moodLabel: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    textAlign: "center",
  },
  commentInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    minHeight: 100,
    borderWidth: 1,
  },
  inputAccessoryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    overflow: "hidden",
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneButtonText: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    color: Colors.light.tint,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    overflow: "hidden",
  },
  floatingButtonBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  saveButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resetModalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
  },
  resetModalLight: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "rgba(0,0,0,0.1)",
  },
  resetModalDark: {
    backgroundColor: "rgba(28,28,30,0.95)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  resetModalBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  resetModalContent: {
    padding: 24,
  },
  resetModalTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    textAlign: "center",
  },
  resetModalMessage: {
    fontSize: 15,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 20,
  },
  datePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resetModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  resetModalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  resetModalSecondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.2)",
  },
  resetModalPrimaryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetModalButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
});
