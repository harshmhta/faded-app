import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DollarCircleIcon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { ThemedText } from "./ThemedText";

type SpendingFrequency = "daily" | "weekly" | "monthly";

interface SavingsCalculatorCardProps {
  startDate: Date;
  dailySpending?: number;
  onDailySpendingChange?: (amount: number) => void;
}

export default function SavingsCalculatorCard({
  startDate,
  dailySpending = 15,
  onDailySpendingChange,
}: SavingsCalculatorCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  // Format input value with commas as user types
  const formatInputValue = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const [inputAmount, setInputAmount] = useState(
    formatInputValue(dailySpending.toString()),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [frequency, setFrequency] = useState<SpendingFrequency>("daily");
  const [scaleAnim] = useState(new Animated.Value(1));

  const calculateSavings = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Convert spending to daily amount based on frequency
    let dailyAmount = dailySpending;
    if (frequency === "weekly") {
      dailyAmount = dailySpending / 7;
    } else if (frequency === "monthly") {
      dailyAmount = dailySpending / 30;
    }

    const totalSaved = diffDays * dailyAmount;
    return { days: diffDays, totalSaved, dailyAmount };
  };

  const getSavingsBreakdown = (dailyAmount: number) => {
    const weekly = dailyAmount * 7;
    const monthly = dailyAmount * 30;
    const yearly = dailyAmount * 365;
    return { weekly, monthly, yearly };
  };

  // Format number with commas (no decimals)
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString("en-US");
  };

  // Format currency with commas (no decimals)
  const formatCurrency = (num: number): string => {
    return Math.round(num).toLocaleString("en-US");
  };

  // Remove commas from input for parsing
  const parseInputValue = (value: string): number => {
    return parseFloat(value.replace(/,/g, ""));
  };

  const handleAmountSubmit = () => {
    const amount = parseInputValue(inputAmount);
    const maxAmount = 99999;

    if (!isNaN(amount) && amount > 0) {
      const cappedAmount = Math.min(amount, maxAmount);
      onDailySpendingChange?.(cappedAmount);
      setInputAmount(formatInputValue(cappedAmount.toString()));
      setIsEditing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleInputChange = (value: string) => {
    const numericValue = parseInputValue(value);
    const maxAmount = 99999;

    if (numericValue <= maxAmount || value === "") {
      setInputAmount(formatInputValue(value));
    }
  };

  const handleFrequencyChange = (newFrequency: SpendingFrequency) => {
    setFrequency(newFrequency);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const savings = calculateSavings();
  const breakdown = getSavingsBreakdown(savings.dailyAmount);

  // Determine if we should use vertical layout for breakdown (when any result has 5+ digits)
  const shouldUseVerticalLayout =
    breakdown.weekly >= 10000 ||
    breakdown.monthly >= 10000 ||
    breakdown.yearly >= 10000;

  // Gradient colors for money theme
  const gradientColors = ["#4CAF50", "#66BB6A", "#81C784"];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Glassmorphism Background */}
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={isDark ? 60 : 40}
        style={styles.blurBackground}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={
          isDark
            ? [
                `${gradientColors[0]}25`,
                `${gradientColors[1]}20`,
                `${gradientColors[2]}15`,
                "transparent",
              ]
            : [
                `${gradientColors[0]}20`,
                `${gradientColors[1]}15`,
                `${gradientColors[2]}10`,
                "transparent",
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <View style={styles.contentContainer}>
        {/* Header with Icon and Title */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: isDark
                    ? `${gradientColors[0]}40`
                    : `${gradientColors[0]}25`,
                  borderColor: `${gradientColors[0]}60`,
                  borderWidth: 1,
                },
              ]}
            >
              <HugeiconsIcon
                icon={DollarCircleIcon}
                size={16}
                color={gradientColors[0]}
                strokeWidth={2}
              />
              <ThemedText
                style={[styles.headerTitle, { color: gradientColors[0] }]}
              >
                Money Saved
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Main Savings Display */}
        <View style={styles.savingsSection}>
          <View style={styles.savingsContainer}>
            <ThemedText
              style={[styles.currencySymbol, { color: gradientColors[0] }]}
            >
              $
            </ThemedText>
            <ThemedText style={[styles.savingsAmount, { color: textColor }]}>
              {formatCurrency(savings.totalSaved)}
            </ThemedText>
          </View>
          <ThemedText style={[styles.savingsSubtext, { color: textColor }]}>
            Total saved since {startDate.toLocaleDateString()}
          </ThemedText>
        </View>

        {/* Spending Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              Spending amount:
            </ThemedText>
          </View>

          {/* Frequency Selector */}
          <View style={styles.frequencySelector}>
            {(["daily", "weekly", "monthly"] as SpendingFrequency[]).map(
              (freq) => (
                <Pressable
                  key={freq}
                  onPress={() => handleFrequencyChange(freq)}
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor:
                        frequency === freq
                          ? `${gradientColors[0]}30`
                          : isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)",
                      borderColor:
                        frequency === freq ? gradientColors[0] : "transparent",
                      borderWidth: frequency === freq ? 1 : 0,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.frequencyText,
                      {
                        color:
                          frequency === freq ? gradientColors[0] : textColor,
                        opacity: frequency === freq ? 1 : 0.7,
                      },
                    ]}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </ThemedText>
                </Pressable>
              ),
            )}
          </View>

          {/* Amount Input */}
          {isEditing ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: gradientColors[0],
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
                value={inputAmount}
                onChangeText={handleInputChange}
                keyboardType="numeric"
                placeholder="15.00"
                placeholderTextColor={`${textColor}60`}
                onSubmitEditing={handleAmountSubmit}
                onBlur={handleAmountSubmit}
                autoFocus
                maxLength={8} // Allows for 99,999.99
              />
            </View>
          ) : (
            <View style={styles.editableAmount}>
              <View style={styles.amountContainer}>
                <Pressable
                  onPress={() => setIsEditing(true)}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.amountPressable}
                >
                  <ThemedText
                    style={[styles.amountDisplay, { color: gradientColors[0] }]}
                  >
                    ${formatCurrency(dailySpending)}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setIsEditing(true)}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.inlineEditButton}
                >
                  <HugeiconsIcon
                    icon={Edit02Icon}
                    size={12}
                    color={`${textColor}60`}
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
              <ThemedText style={[styles.editHint, { color: textColor }]}>
                per{" "}
                {frequency === "daily"
                  ? "day"
                  : frequency === "weekly"
                    ? "week"
                    : "month"}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Savings Breakdown */}
        <View style={styles.breakdownContainer}>
          <ThemedText style={[styles.breakdownTitle, { color: textColor }]}>
            Projected Savings
          </ThemedText>
          <View
            style={[
              shouldUseVerticalLayout
                ? styles.breakdownGridVertical
                : styles.breakdownGrid,
            ]}
          >
            <View
              style={[
                shouldUseVerticalLayout
                  ? styles.breakdownItemVertical
                  : styles.breakdownItem,
                { backgroundColor: `${gradientColors[0]}15` },
              ]}
            >
              <View
                style={
                  shouldUseVerticalLayout
                    ? styles.breakdownContentVertical
                    : styles.breakdownContent
                }
              >
                <ThemedText
                  style={[
                    styles.breakdownAmount,
                    { color: textColor },
                    shouldUseVerticalLayout && { marginBottom: 0 },
                  ]}
                >
                  ${formatNumber(breakdown.weekly)}
                </ThemedText>
                <ThemedText
                  style={[styles.breakdownLabel, { color: textColor }]}
                >
                  Weekly
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                shouldUseVerticalLayout
                  ? styles.breakdownItemVertical
                  : styles.breakdownItem,
                { backgroundColor: `${gradientColors[1]}15` },
              ]}
            >
              <View
                style={
                  shouldUseVerticalLayout
                    ? styles.breakdownContentVertical
                    : styles.breakdownContent
                }
              >
                <ThemedText
                  style={[
                    styles.breakdownAmount,
                    { color: textColor },
                    shouldUseVerticalLayout && { marginBottom: 0 },
                  ]}
                >
                  ${formatNumber(breakdown.monthly)}
                </ThemedText>
                <ThemedText
                  style={[styles.breakdownLabel, { color: textColor }]}
                >
                  Monthly
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                shouldUseVerticalLayout
                  ? styles.breakdownItemVertical
                  : styles.breakdownItem,
                { backgroundColor: `${gradientColors[2]}15` },
              ]}
            >
              <View
                style={
                  shouldUseVerticalLayout
                    ? styles.breakdownContentVertical
                    : styles.breakdownContent
                }
              >
                <ThemedText
                  style={[
                    styles.breakdownAmount,
                    { color: textColor },
                    shouldUseVerticalLayout && { marginBottom: 0 },
                  ]}
                >
                  ${formatNumber(breakdown.yearly)}
                </ThemedText>
                <ThemedText
                  style={[styles.breakdownLabel, { color: textColor }]}
                >
                  Yearly
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    // Enhanced shadow system
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    // Subtle border for definition
    borderWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  contentContainer: {
    padding: 20,
    minHeight: 280,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  iconBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    alignSelf: "flex-start",
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: FontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  savingsSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 4,
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 4,
    paddingVertical: 4,
  },
  currencySymbol: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    marginRight: 6,
    lineHeight: 40,
  },
  savingsAmount: {
    fontSize: 52,
    fontFamily: FontFamily.bold,
    lineHeight: 56,
  },
  savingsSubtext: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  frequencySelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  frequencyText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  editableAmount: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  amountContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  amountPressable: {
    // No additional styling needed - just makes the text pressable
  },
  amountDisplay: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
  },
  inlineEditButton: {
    position: "absolute",
    right: -25,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editHint: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    textAlign: "center",
    minWidth: 120,
  },
  breakdownContainer: {
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 2,
  },
  breakdownGrid: {
    flexDirection: "row",
    gap: 12,
  },
  breakdownGridVertical: {
    flexDirection: "column",
    gap: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  breakdownItemVertical: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "space-between",
  },
  breakdownContent: {
    alignItems: "center",
  },
  breakdownContentVertical: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  breakdownAmount: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
