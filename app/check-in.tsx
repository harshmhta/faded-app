import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MoodCheckIn, moodCheckInService } from "@/lib/appwrite";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
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

const MOOD_OPTIONS = [
  { emoji: "😊", label: "Great", color: "#4CAF50" },
  { emoji: "🙂", label: "Good", color: "#8BC34A" },
  { emoji: "😐", label: "Okay", color: "#FFC107" },
  { emoji: "😔", label: "Low", color: "#FF9800" },
  { emoji: "😢", label: "Struggling", color: "#F44336" },
];

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(3);
  const [moodHistory, setMoodHistory] = useState<Map<string, MoodCheckIn>>(
    new Map()
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  // Load mood history
  useEffect(() => {
    loadMoodHistory();
  }, [user]);

  // Load mood for selected date
  useEffect(() => {
    loadMoodForDate(selectedDate);
  }, [selectedDate, moodHistory]);

  const loadMoodHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      const startDate = new Date(weeks[0][0]);
      const endDate = new Date(weeks[weeks.length - 1][6]);

      const checkIns = await moodCheckInService.getMoodCheckInsByDateRange(
        user.$id,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      const historyMap = new Map<string, MoodCheckIn>();
      checkIns.forEach((checkIn) => {
        historyMap.set(checkIn.date, checkIn);
      });

      setMoodHistory(historyMap);
    } catch (error) {
      console.error("Error loading mood history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadMoodForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const checkIn = moodHistory.get(dateStr);

    if (checkIn) {
      setSelectedMood(checkIn.mood);
      setComment(checkIn.comment || "");
    } else {
      setSelectedMood(null);
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

  const handleSaveMood = async () => {
    if (!selectedMood || !user) return;

    if (isFutureDate(selectedDate)) {
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await moodCheckInService.saveMoodCheckIn(
        user.$id,
        selectedMood,
        comment,
        dateStr
      );
      await loadMoodHistory();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Close modal after successful save if it's today
      if (isToday(selectedDate)) {
        setTimeout(() => {
          router.back();
        }, 500);
      }
    } catch (error) {
      console.error("Error saving mood:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
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
        const hasMood = moodHistory.has(dateStr);
        const moodForDate = moodHistory.get(dateStr);

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
                    hasMood && moodForDate
                      ? isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.04)"
                      : "transparent",
                  borderColor: isTodayDate
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
              {hasMood && moodForDate ? (
                <ThemedText style={styles.dayMoodEmoji}>
                  {moodForDate.mood}
                </ThemedText>
              ) : (
                <ThemedText
                  style={[
                    styles.dayLabel,
                    { opacity: isTodayDate || isSelected ? 1 : 0.5 },
                  ]}
                >
                  {dayLabel}
                </ThemedText>
              )}
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

  const getMoodColor = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find((m) => m.emoji === mood);
    return moodOption?.color || "#999";
  };

  const isSelectedDateToday = isToday(selectedDate);
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const hasHistoricalMood = moodHistory.has(selectedDateStr);

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
          <ThemedText style={styles.headerTitle}>Daily Check-in</ThemedText>
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
            Scroll to view your mood history
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

        {/* Date Info */}
        <View style={styles.dateInfoContainer}>
          <ThemedText style={styles.dateInfoText}>
            {isSelectedDateToday
              ? "How are you feeling today?"
              : selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
          </ThemedText>
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

          <ThemedText style={styles.sectionTitle}>
            How are you feeling?
          </ThemedText>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.emoji;
              return (
                <Pressable
                  key={mood.emoji}
                  onPress={() => {
                    if (!isFutureDate(selectedDate)) {
                      setSelectedMood(mood.emoji);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.moodButton,
                    {
                      backgroundColor: isDark
                        ? isSelected
                          ? `${mood.color}25`
                          : "rgba(255,255,255,0.04)"
                        : isSelected
                          ? `${mood.color}18`
                          : "rgba(0,0,0,0.02)",
                      borderColor: isSelected
                        ? mood.color
                        : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.06)",
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                      opacity: isFutureDate(selectedDate) ? 0.3 : 1,
                    },
                  ]}
                  disabled={isFutureDate(selectedDate)}
                >
                  <ThemedText style={styles.moodEmoji}>{mood.emoji}</ThemedText>
                  <ThemedText
                    style={[
                      styles.moodLabel,
                      isSelected && {
                        fontFamily: FontFamily.bold,
                        color: mood.color,
                      },
                    ]}
                  >
                    {mood.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Comment Section */}
        {selectedMood && (
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

            <View style={styles.noteTitleContainer}>
              <ThemedText style={styles.sectionTitle}>
                Add a note
              </ThemedText>
              {isKeyboardVisible && (
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    styles.inlineDoneButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.06)",
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.inlineDoneButtonText}>
                    Done
                  </ThemedText>
                </Pressable>
              )}
            </View>
            <ThemedText style={[styles.sectionSubtitle, { opacity: 0.5 }]}>
              What's on your mind?
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
      {selectedMood && !isFutureDate(selectedDate) && !isKeyboardVisible && (
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
            onPress={handleSaveMood}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: getMoodColor(selectedMood),
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: isSaving ? 0.7 : 1,
              },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                {hasHistoricalMood && !isSelectedDateToday
                  ? "Update Check-in"
                  : isSelectedDateToday && hasHistoricalMood
                    ? "Update Today's Mood"
                    : "Save Check-in"}
              </ThemedText>
            )}
          </Pressable>
        </View>
      )}
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
  dayMoodEmoji: {
    fontSize: 18,
    lineHeight: Platform.OS === "ios" ? 18 : 22,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
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
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  moodButton: {
    width: "48%",
    height: 110,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1.5,
  },
  moodEmoji: {
    fontSize: 38,
    marginBottom: 6,
    lineHeight: 42,
    textAlign: "center",
  },
  moodLabel: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
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
});
