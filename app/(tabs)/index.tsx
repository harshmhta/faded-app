import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";

import DailyConsumptionLogger, { ConsumptionStatus } from "@/components/DailyConsumptionLogger";
import DashboardHeader from "@/components/DashboardHeader";
import MotivationalQuoteCardCompact from "@/components/MotivationalQuoteCardCompact";
import QuickActions from "@/components/QuickActions";
import SavingsCalculatorCardCompact from "@/components/SavingsCalculatorCardCompact";
import SobrietyTimerCard, { SobrietyTimerCardRef } from "@/components/SobrietyTimerCard";
import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Alert02Icon, ArrowRight01Icon, Tick01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

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
          minHeight: 140,
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
  const params = useLocalSearchParams();

  // Mock data - in a real app, this would come from user preferences/storage
  const [sobrietyStartDate] = useState(
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  ); // 5 days ago
  const [dailySpending, setDailySpending] = useState(15);
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus | null>(null);
  const [timerKey, setTimerKey] = useState(0); // Key to force re-render of timer

  // Refresh timer when explicitly requested via params
  useEffect(() => {
    if (params.refreshTimer === 'true') {
      setTimerKey((prev) => prev + 1);
    }
  }, [params.refreshTimer]);

  const handleConsumedPress = () => {
    // Open the reset modal when user clicks "I Consumed"
    timerCardRef.current?.openResetModal();
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
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

        {/* Daily Actions */}
        <View style={[styles.section, styles.dailyActionsSection]}>
          <ThemedText style={styles.sectionTitle}>Daily Actions</ThemedText>
          <View style={styles.actionButtonsContainer}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/track-consumption");
              }}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View
                style={[
                  styles.actionButtonInner,
                  {
                    backgroundColor: isDark
                      ? "rgba(76, 175, 80, 0.15)"
                      : "rgba(76, 175, 80, 0.08)",
                    borderColor: isDark
                      ? "rgba(76, 175, 80, 0.3)"
                      : "rgba(76, 175, 80, 0.2)",
                  },
                ]}
              >
                <BlurView
                  tint={isDark ? "dark" : "light"}
                  intensity={20}
                  style={styles.actionButtonBlur}
                />
                {/* Background Icon */}
                <View style={styles.actionBackgroundIconContainer}>
                  <HugeiconsIcon
                    icon={Tick01Icon}
                    size={60}
                    color={isDark ? "rgba(76, 175, 80, 0.08)" : "rgba(76, 175, 80, 0.06)"}
                    strokeWidth={1.5}
                  />
                </View>
                <View style={styles.actionTextContainer}>
                  <ThemedText style={styles.actionButtonTitle} numberOfLines={2}>
                    Track{"\n"}Consumption
                  </ThemedText>
                  <ThemedText style={styles.actionButtonSubtitle} numberOfLines={2}>
                    Did you smoke?
                  </ThemedText>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/check-in");
              }}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View
                style={[
                  styles.actionButtonInner,
                  {
                    backgroundColor: isDark
                      ? "rgba(33, 150, 243, 0.15)"
                      : "rgba(33, 150, 243, 0.08)",
                    borderColor: isDark
                      ? "rgba(33, 150, 243, 0.3)"
                      : "rgba(33, 150, 243, 0.2)",
                  },
                ]}
              >
                <BlurView
                  tint={isDark ? "dark" : "light"}
                  intensity={20}
                  style={styles.actionButtonBlur}
                />
                {/* Background Icon */}
                <View style={styles.actionBackgroundIconContainer}>
                  <HugeiconsIcon
                    icon={PencilEdit02Icon}
                    size={60}
                    color={isDark ? "rgba(33, 150, 243, 0.08)" : "rgba(33, 150, 243, 0.06)"}
                    strokeWidth={1.5}
                  />
                </View>
                <View style={styles.actionTextContainer}>
                  <ThemedText style={styles.actionButtonTitle} numberOfLines={2}>
                    Log{"\n"}Mood
                  </ThemedText>
                  <ThemedText style={styles.actionButtonSubtitle} numberOfLines={2}>
                    Your feelings?
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Today's Insights</ThemedText>
          <MotivationalQuoteCardCompact />
        </View>

        {/* Recovery Journey Section - COMMENTED OUT */}
        {/* <View style={styles.section}>
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
        </View> */}
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
    paddingTop: 4,
    paddingBottom: 24,
  },
  firstSection: {
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  dailyActionsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonInner: {
    flexDirection: "column",
    alignItems: "center",
    height: 100,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    justifyContent: "center",
  },
  actionButtonBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  actionBackgroundIconContainer: {
    position: "absolute",
    right: -8,
    bottom: -8,
    opacity: 1,
    transform: [{ rotate: "15deg" }],
  },
  actionTextContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FontFamily.bold,
    marginBottom: 3,
    textAlign: "center",
  },
  actionButtonSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
    textAlign: "center",
  },
  textDark: {
    color: "#FFFFFF",
  },
  textLight: {
    color: "#000000",
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
