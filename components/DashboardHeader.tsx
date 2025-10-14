import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConsumptionStatus } from "./DailyConsumptionLogger";
import { ThemedText } from "./ThemedText";
import WeeklyCalendar from "./WeeklyCalendar";

interface DashboardHeaderProps {
  parentScrollRef?: React.RefObject<ScrollView | null>;
  consumptionStatus?: ConsumptionStatus | null;
}

export default function DashboardHeader({
  parentScrollRef,
  consumptionStatus,
}: DashboardHeaderProps) {
  const textColor = useThemeColor({}, "text");
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  const handleDateSelect = (date: Date) => {
    // Handle date selection if needed
    console.log("Selected date:", date);
  };

  return (
    <View style={styles.container}>
      {/* Top row with logo */}
      <View style={[styles.topRow, { marginTop: insets.top + 13 }]}>
        <View style={styles.logoContainer}>
          <Image
            source={
              colorScheme === "dark"
                ? require("@/assets/images/logo-light.svg")
                : require("@/assets/images/logo-dark.svg")
            }
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText style={[styles.brandText, { color: textColor }]}>
            Faded
          </ThemedText>
        </View>
      </View>

      {/* Weekly Calendar */}
      <WeeklyCalendar
        onDateSelect={handleDateSelect}
        parentScrollRef={parentScrollRef}
        consumptionStatus={consumptionStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    height: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    position: "absolute",
    left: 4,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 24,
    fontFamily: FontFamily.medium,
  },
});
