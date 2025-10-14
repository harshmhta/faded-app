import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import DailyConsumptionLogger, { ConsumptionStatus } from "@/components/DailyConsumptionLogger";
import DashboardHeader from "@/components/DashboardHeader";
import MotivationalQuoteCardCompact from "@/components/MotivationalQuoteCardCompact";
import QuickActions from "@/components/QuickActions";
import SavingsCalculatorCardCompact from "@/components/SavingsCalculatorCardCompact";
import SobrietyProgressCardSimplified from "@/components/SobrietyProgressCardSimplified";
import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // Mock data - in a real app, this would come from user preferences/storage
  const [sobrietyStartDate] = useState(
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  ); // 5 days ago
  const [dailySpending, setDailySpending] = useState(15);
  const [refreshing, setRefreshing] = useState(false);
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#4CAF50" : "#2E7D32"}
          colors={["#4CAF50"]}
        />
      }
    >
      {/* Dashboard Header */}
      <DashboardHeader parentScrollRef={scrollViewRef} consumptionStatus={consumptionStatus} />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Your Progress Section */}
        <View style={styles.firstSection}>
          <ThemedText style={styles.sectionTitle}>Your Progress</ThemedText>
          <SobrietyProgressCardSimplified startDate={sobrietyStartDate} />
        </View>

        {/* Daily Check-in Section */}
        <View style={styles.section}>
          <DailyConsumptionLogger 
            onStatusChange={setConsumptionStatus}
            initialStatus={consumptionStatus}
          />
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <QuickActions />
        </View>

        {/* Money Saved Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Money Saved</ThemedText>
          <SavingsCalculatorCardCompact
            startDate={sobrietyStartDate}
            dailySpending={dailySpending}
            onDailySpendingChange={setDailySpending}
          />
        </View>

        {/* Insights Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Today's Insights</ThemedText>
          <MotivationalQuoteCardCompact />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  firstSection: {
    marginTop: 4,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
