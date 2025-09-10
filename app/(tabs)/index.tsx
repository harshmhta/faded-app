import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import AchievementBadgesCard from "@/components/AchievementBadgesCard";
import DashboardHeader from "@/components/DashboardHeader";
import HealthBenefitsCard from "@/components/HealthBenefitsCard";
import MotivationalQuoteCard from "@/components/MotivationalQuoteCard";
import SavingsCalculatorCard from "@/components/SavingsCalculatorCard";
import SobrietyProgressCard from "@/components/SobrietyProgressCard";

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock data - in a real app, this would come from user preferences/storage
  const [sobrietyStartDate] = useState(
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  ); // 5 days ago
  const [dailySpending, setDailySpending] = useState(15);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Dashboard Header */}
      <DashboardHeader parentScrollRef={scrollViewRef} />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Sobriety Progress Tracker */}
        <SobrietyProgressCard startDate={sobrietyStartDate} />

        {/* Daily Motivational Quote */}
        <MotivationalQuoteCard />

        {/* Money Saved Calculator */}
        <SavingsCalculatorCard
          startDate={sobrietyStartDate}
          dailySpending={dailySpending}
          onDailySpendingChange={setDailySpending}
        />

        {/* Health Benefits Timeline */}
        <HealthBenefitsCard startDate={sobrietyStartDate} />

        {/* Achievement Badges */}
        <AchievementBadgesCard startDate={sobrietyStartDate} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
});
