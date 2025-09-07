import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";

const { width: screenWidth } = Dimensions.get("window");
const WEEK_WIDTH = screenWidth - 40; // Account for padding
const WEEK_SPACING = 50; // Extra spacing between weeks

interface WeeklyCalendarProps {
  onDateSelect?: (date: Date) => void;
  parentScrollRef?: React.RefObject<ScrollView | null>;
}

export default function WeeklyCalendar({
  onDateSelect,
  parentScrollRef,
}: WeeklyCalendarProps) {
  const textColor = useThemeColor({}, "text");
  const colorScheme = useColorScheme() ?? "light";
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(3); // Start at week 3 (current week)
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  // Generate 4 weeks of dates (3 weeks prior + current week)
  const generateWeeks = () => {
    const today = new Date();
    const weeks: Date[][] = [];

    // Start from 3 weeks ago
    for (let weekOffset = -3; weekOffset <= 0; weekOffset++) {
      const weekDates: Date[] = [];
      const startOfWeek = new Date(today);

      // Calculate start of the target week
      const currentDay = today.getDay(); // 0 = Sunday
      startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);

      // Generate 7 days for this week
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

  // Check if a date is today
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  // Snap to current week on mount
  useEffect(() => {
    const totalWeekWidth = WEEK_WIDTH + WEEK_SPACING;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: currentWeekIndex * totalWeekWidth,
        animated: false,
      });
    }, 100);
  }, []);

  // Handle scroll end to snap to nearest week
  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const totalWeekWidth = WEEK_WIDTH + WEEK_SPACING;
    const weekIndex = Math.round(contentOffsetX / totalWeekWidth);
    const clampedIndex = Math.max(0, Math.min(3, weekIndex));

    if (clampedIndex !== currentWeekIndex) {
      setCurrentWeekIndex(clampedIndex);
    }

    // Snap to the exact position
    scrollViewRef.current?.scrollTo({
      x: clampedIndex * totalWeekWidth,
      animated: true,
    });
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
        const isSelected = selectedDate?.toDateString() === date.toDateString();

        return (
          <Pressable
            key={dayIndex}
            style={styles.dayContainer}
            onPress={() => {
              const isSame =
                selectedDate?.toDateString() === date.toDateString();
              if (!isSame) {
                setSelectedDate(date);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              onDateSelect?.(date);
            }}
          >
            <View
              style={[
                styles.dayCircle,
                isTodayDate ? styles.todayCircle : styles.otherDayCircle,
                {
                  borderColor: isTodayDate
                    ? colorScheme === "dark"
                      ? "#FFFFFF"
                      : "#000000"
                    : "rgba(160, 160, 160, 0.6)",
                },
              ]}
            >
              <ThemedText style={[styles.dayLabel, { color: textColor }]}>
                {dayLabel}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.dateNumber,
                { color: textColor },
                isSelected && styles.selectedDateNumber,
              ]}
            >
              {date.getDate()}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  const handleTouchStart = () => {
    // Disable parent scroll when user starts interacting with calendar
    parentScrollRef?.current?.setNativeProps({ scrollEnabled: false });
  };

  const handleTouchEnd = () => {
    // Re-enable parent scroll when user stops interacting with calendar
    parentScrollRef?.current?.setNativeProps({ scrollEnabled: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScrollBeginDrag={handleTouchStart}
        onScrollEndDrag={handleTouchEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={WEEK_WIDTH + WEEK_SPACING}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {weeks.map((weekDates, weekIndex) => renderWeek(weekDates, weekIndex))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  dayContainer: {
    alignItems: "center",
    flex: 1,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  todayCircle: {
    borderWidth: 1.6,
    borderColor: "#000000",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  otherDayCircle: {
    borderWidth: 1.6,
    borderColor: "rgba(160, 160, 160, 0.6)",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  dayLabel: {
    fontSize: 17,
    fontWeight: "500",
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  todayDateNumber: {
    fontWeight: "700",
    fontFamily: FontFamily.medium,
  },
  selectedDateNumber: {
    fontFamily: FontFamily.medium,
  },
});
