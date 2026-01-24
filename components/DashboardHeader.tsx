import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConsumptionStatus } from "./DailyConsumptionLogger";
import { ThemedText } from "./ThemedText";
import WeeklyCalendar from "./WeeklyCalendar";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

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

  const handleSOSPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // @ts-expect-error - New route, types will be regenerated on build
    router.push("/sos-mirror");
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
        
        {/* SOS Button */}
        <Pressable
          onPress={handleSOSPress}
          style={({ pressed }) => [
            styles.sosButton,
            {
              backgroundColor: colorScheme === "dark" 
                ? "rgba(244, 67, 54, 0.15)" 
                : "rgba(244, 67, 54, 0.1)",
              borderColor: "#F44336",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <HugeiconsIcon
            icon={Alert02Icon}
            size={16}
            color="#F44336"
            strokeWidth={2.5}
          />
          <ThemedText style={styles.sosText}>SOS</ThemedText>
        </Pressable>
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
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 24,
    fontFamily: FontFamily.medium,
  },
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  sosText: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: "#F44336",
  },
});
