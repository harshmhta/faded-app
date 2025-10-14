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

interface SavingsCalculatorCardCompactProps {
  startDate: Date;
  dailySpending?: number;
  onDailySpendingChange?: (amount: number) => void;
}

export default function SavingsCalculatorCardCompact({
  startDate,
  dailySpending = 15,
  onDailySpendingChange,
}: SavingsCalculatorCardCompactProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");

  const [inputAmount, setInputAmount] = useState(dailySpending.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const calculateSavings = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalSaved = diffDays * dailySpending;
    return { days: diffDays, totalSaved };
  };

  const formatCurrency = (num: number): string => {
    return Math.round(num).toLocaleString("en-US");
  };

  const handleAmountSubmit = () => {
    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0) {
      const cappedAmount = Math.min(amount, 99999);
      onDailySpendingChange?.(cappedAmount);
      setInputAmount(cappedAmount.toString());
      setIsEditing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleBreakdown = () => {
    setShowBreakdown(!showBreakdown);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const savings = calculateSavings();
  const gradientColors = ["#4CAF50", "#66BB6A"];

  return (
    <View style={styles.container}>
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={isDark ? 60 : 40}
        style={styles.blurBackground}
      />

      <LinearGradient
        colors={
          isDark
            ? [`${gradientColors[0]}25`, `${gradientColors[1]}15`, "transparent"]
            : [`${gradientColors[0]}20`, `${gradientColors[1]}10`, "transparent"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <View style={styles.contentContainer}>
        {/* Main Content Row */}
        <View style={styles.mainRow}>
          {/* Left Side - Savings Display */}
          <View style={styles.leftSection}>
            <View style={styles.iconBadge}>
              <HugeiconsIcon
                icon={DollarCircleIcon}
                size={16}
                color={gradientColors[0]}
                strokeWidth={2}
              />
            </View>
            <View style={styles.savingsInfo}>
              <View style={styles.amountContainer}>
                <ThemedText style={[styles.currencySymbol, { color: gradientColors[0] }]}>
                  $
                </ThemedText>
                <ThemedText style={[styles.savingsAmount, { color: textColor }]}>
                  {formatCurrency(savings.totalSaved)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.savingsLabel, { color: textColor }]}>
                Total saved
              </ThemedText>
            </View>
          </View>

          {/* Right Side - Spending Input */}
          <View style={styles.rightSection}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              Daily spending
            </ThemedText>
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
                  onChangeText={setInputAmount}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor={`${textColor}60`}
                  onSubmitEditing={handleAmountSubmit}
                  onBlur={handleAmountSubmit}
                  autoFocus
                  maxLength={6}
                />
              </View>
            ) : (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={styles.editableAmount}
              >
                <ThemedText style={[styles.amountDisplay, { color: gradientColors[0] }]}>
                  ${formatCurrency(dailySpending)}
                </ThemedText>
                <HugeiconsIcon
                  icon={Edit02Icon}
                  size={14}
                  color={`${textColor}60`}
                  strokeWidth={2}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Expandable Breakdown */}
        {showBreakdown && (
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <ThemedText style={[styles.breakdownAmount, { color: textColor }]}>
                  ${formatCurrency(dailySpending * 7)}
                </ThemedText>
                <ThemedText style={[styles.breakdownLabel, { color: textColor }]}>
                  Weekly
                </ThemedText>
              </View>
              <View style={styles.breakdownItem}>
                <ThemedText style={[styles.breakdownAmount, { color: textColor }]}>
                  ${formatCurrency(dailySpending * 30)}
                </ThemedText>
                <ThemedText style={[styles.breakdownLabel, { color: textColor }]}>
                  Monthly
                </ThemedText>
              </View>
              <View style={styles.breakdownItem}>
                <ThemedText style={[styles.breakdownAmount, { color: textColor }]}>
                  ${formatCurrency(dailySpending * 365)}
                </ThemedText>
                <ThemedText style={[styles.breakdownLabel, { color: textColor }]}>
                  Yearly
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Toggle Button */}
        <Pressable onPress={toggleBreakdown} style={styles.toggleButton}>
          <ThemedText style={[styles.toggleText, { color: textColor }]}>
            {showBreakdown ? "Show less" : "View projections"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    padding: 18,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76,175,80,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.3)",
  },
  savingsInfo: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  savingsAmount: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    lineHeight: 32,
  },
  savingsLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  editableAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  amountDisplay: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    textAlign: "center",
    minWidth: 80,
  },
  breakdownContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  breakdownItem: {
    alignItems: "center",
    gap: 4,
  },
  breakdownAmount: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  breakdownLabel: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toggleButton: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.6,
  },
});
