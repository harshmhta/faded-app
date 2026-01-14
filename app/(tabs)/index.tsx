import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import DailyConsumptionLogger, { ConsumptionStatus } from "@/components/DailyConsumptionLogger";
import DashboardHeader from "@/components/DashboardHeader";
import MotivationalQuoteCardCompact from "@/components/MotivationalQuoteCardCompact";
import QuickActions from "@/components/QuickActions";
import SavingsCalculatorCardCompact from "@/components/SavingsCalculatorCardCompact";
import SobrietyTimerCard, { SobrietyTimerCardRef } from "@/components/SobrietyTimerCard";
import ExploreCalendar from "@/components/ExploreCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

type TileProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: any;
  hideChevron?: boolean;
};

function Tile({ title, subtitle, onPress, style, hideChevron }: TileProps) {
  const scheme = useColorScheme() ?? "light";
  const isAppDark = scheme === "dark";
  const isDarkTile = isAppDark;
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: "48%",
          minHeight: 180,
          borderRadius: 28,
          padding: 20,
          marginBottom: 16,
          overflow: "hidden",
          justifyContent: "space-between",
          backgroundColor: isDarkTile ? "rgba(16,16,16,0.55)" : "rgba(255,255,255,0.65)",
          borderWidth: 1,
          borderColor: isDarkTile ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
        style,
      ]}
    >
      <BlurView
        tint={isDarkTile ? "dark" : "light"}
        intensity={24}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 28,
        }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          isDarkTile
            ? [
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.015)",
                "rgba(255,255,255,0)",
              ]
            : ["rgba(0,0,0,0.03)", "rgba(0,0,0,0.015)", "rgba(0,0,0,0)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 28,
        }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          isDarkTile
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]
            : ["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]
        }
        start={{ x: 0.3, y: 0.0 }}
        end={{ x: 0.3, y: 1.0 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 90,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      />
      <View>
        <ThemedText
          type="subtitle"
          style={{
            fontSize: 26,
            lineHeight: 28,
            color: isDarkTile ? "#FFFFFF" : "#000000",
          }}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 20,
              color: isDarkTile ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            }}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {!hideChevron && (
        <View style={{
          position: "absolute",
          right: 14,
          bottom: 14,
        }}>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            color={isDarkTile ? "#FFFFFF" : "#000000"}
            strokeWidth={2.5}
          />
        </View>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const timerCardRef = useRef<SobrietyTimerCardRef>(null);
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  // Mock data - in a real app, this would come from user preferences/storage
  const [sobrietyStartDate] = useState(
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  ); // 5 days ago
  const [dailySpending, setDailySpending] = useState(15);
  const [refreshing, setRefreshing] = useState(false);
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus | null>(null);
  const [timerKey, setTimerKey] = useState(0); // Key to force re-render of timer

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate data refresh and reload timer
    setTimeout(() => {
      setRefreshing(false);
      setTimerKey((prev) => prev + 1);
    }, 1500);
  }, []);

  const handleConsumedPress = () => {
    // Open the reset modal when user clicks "I Consumed"
    timerCardRef.current?.openResetModal();
  };

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
          {user && (
            <SobrietyTimerCard
              ref={timerCardRef}
              key={timerKey}
              userId={user.$id}
              onReset={() => setTimerKey((prev) => prev + 1)}
            />
          )}
        </View>

        {/* Recovery Journey Section */}
        <View style={styles.section}>
          <View style={[
            styles.recoveryJourneyTile,
            isDark ? styles.tileDark : styles.tileLight,
            isDark ? styles.tileBorderDark : styles.tileBorderLight,
          ]}>
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={24}
              style={styles.tileBlur}
            />
            <LinearGradient
              pointerEvents="none"
              colors={
                isDark
                  ? [
                      "rgba(255,255,255,0.05)",
                      "rgba(255,255,255,0.015)",
                      "rgba(255,255,255,0)",
                    ]
                  : ["rgba(0,0,0,0.03)", "rgba(0,0,0,0.015)", "rgba(0,0,0,0)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tileGradient}
            />
            <LinearGradient
              pointerEvents="none"
              colors={
                isDark
                  ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]
                  : ["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]
              }
              start={{ x: 0.3, y: 0.0 }}
              end={{ x: 0.3, y: 1.0 }}
              style={styles.tileBottomFade}
            />

            {/* Streak Content */}
            <View style={styles.streakHeader}>
              <ThemedText
                style={[
                  styles.streakTitle,
                  isDark ? styles.tileTitleDark : styles.tileTitleLight,
                ]}
              >
                Recovery Journey
              </ThemedText>
              <View style={styles.streakBadge}>
                <ThemedText style={[styles.streakEmoji]}>🌟</ThemedText>
              </View>
            </View>

            <View style={styles.streakMainContent}>
              <View style={styles.streakNumberContainer}>
                <ThemedText
                  style={[
                    styles.streakNumber,
                    isDark ? styles.tileTitleDark : styles.tileTitleLight,
                  ]}
                >
                  5
                </ThemedText>
                <ThemedText
                  style={[
                    styles.streakDays,
                    isDark ? styles.tileSubtitleDark : styles.tileSubtitleLight,
                  ]}
                >
                  days clean
                </ThemedText>
              </View>

              <View style={styles.streakProgress}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={["#4CAF50", "#8BC34A", "#4CAF50"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: "50%" }]}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.progressText,
                    isDark ? styles.tileSubtitleDark : styles.tileSubtitleLight,
                  ]}
                >
                  5/10 days to next milestone
                </ThemedText>
              </View>
            </View>

            <ExploreCalendar parentScrollRef={scrollViewRef} />
          </View>
        </View>

        {/* Quick Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Support</ThemedText>
          <View style={styles.tilesContainer}>
            <Tile
              title="SOS Help"
              subtitle="Look at yourself. Stay accountable."
              onPress={() => {
                // @ts-expect-error - New route, types will be regenerated on build
                router.push("/sos-mirror");
              }}
              style={[
                {
                  backgroundColor: isDark
                    ? "rgba(244, 67, 54, 0.2)"
                    : "rgba(244, 67, 54, 0.1)",
                  borderColor: "#F44336",
                  borderWidth: 1,
                },
              ]}
            />

            <Tile
              title="Daily Check-in"
              subtitle="How are you feeling today?"
              onPress={() => {
                router.push("/check-in");
              }}
              style={[
                {
                  backgroundColor: isDark
                    ? "rgba(76, 175, 80, 0.2)"
                    : "rgba(76, 175, 80, 0.1)",
                  borderColor: "#4CAF50",
                  borderWidth: 1,
                },
              ]}
            />
          </View>
        </View>

        {/* Daily Check-in Section */}
        <View style={styles.section}>
          <DailyConsumptionLogger 
            onStatusChange={setConsumptionStatus}
            initialStatus={consumptionStatus}
            onConsumed={handleConsumedPress}
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
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recoveryJourneyTile: {
    width: "100%",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    justifyContent: "space-between",
    alignItems: "stretch",
    paddingBottom: 10,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  tileBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tileGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tileBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  tileLight: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  tileDark: {
    backgroundColor: "rgba(16,16,16,0.55)",
  },
  tileBorderDark: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tileBorderLight: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  tileTitleDark: {
    color: "#FFFFFF",
  },
  tileTitleLight: {
    color: "#000000",
  },
  tileSubtitleDark: {
    color: "rgba(255,255,255,0.7)",
  },
  tileSubtitleLight: {
    color: "rgba(0,0,0,0.7)",
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  streakBadge: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakMainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  streakNumberContainer: {
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
  },
  streakDays: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: -2,
  },
  streakProgress: {
    flex: 1,
    marginLeft: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(160, 160, 160, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
