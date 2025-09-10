import { FontFamily } from "@/constants/Fonts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "./ThemedText";

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
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [inputAmount, setInputAmount] = useState(dailySpending.toString());
  const [isEditing, setIsEditing] = useState(false);

  const calculateSavings = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalSaved = diffDays * dailySpending;

    return { days: diffDays, totalSaved };
  };

  const getSavingsBreakdown = (totalSaved: number) => {
    const weekly = dailySpending * 7;
    const monthly = dailySpending * 30;
    const yearly = dailySpending * 365;

    return { weekly, monthly, yearly };
  };

  const getWhatYouCanBuy = (amount: number) => {
    if (amount >= 1000) return { item: "New Laptop", icon: "💻" };
    if (amount >= 500) return { item: "Weekend Getaway", icon: "✈️" };
    if (amount >= 200) return { item: "Nice Dinner Out", icon: "🍽️" };
    if (amount >= 100) return { item: "New Shoes", icon: "👟" };
    if (amount >= 50) return { item: "Great Book Collection", icon: "📚" };
    if (amount >= 20) return { item: "Coffee for a Week", icon: "☕" };
    return { item: "Healthy Snack", icon: "🍎" };
  };

  const handleAmountSubmit = () => {
    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0) {
      onDailySpendingChange?.(amount);
      setIsEditing(false);
    }
  };

  const savings = calculateSavings();
  const breakdown = getSavingsBreakdown(savings.totalSaved);
  const whatCanBuy = getWhatYouCanBuy(savings.totalSaved);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[
          "rgba(76, 175, 80, 0.1)",
          "rgba(139, 195, 74, 0.1)",
          "rgba(76, 175, 80, 0.05)",
        ]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.headerIcon, { color: "#4CAF50" }]}>
            💰
          </ThemedText>
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Money Saved
          </ThemedText>
        </View>

        {/* Main Savings Amount */}
        <View style={styles.savingsContainer}>
          <ThemedText style={[styles.currencySymbol, { color: "#4CAF50" }]}>
            $
          </ThemedText>
          <ThemedText style={[styles.savingsAmount, { color: textColor }]}>
            {savings.totalSaved.toFixed(2)}
          </ThemedText>
        </View>

        {/* Daily Amount Input */}
        <View style={styles.dailyAmountContainer}>
          <ThemedText style={[styles.dailyAmountLabel, { color: textColor }]}>
            Daily spending on weed:
          </ThemedText>
          {isEditing ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: "#4CAF50" },
                ]}
                value={inputAmount}
                onChangeText={setInputAmount}
                keyboardType="numeric"
                placeholder="15.00"
                placeholderTextColor={`${textColor}60`}
                onSubmitEditing={handleAmountSubmit}
                onBlur={handleAmountSubmit}
                autoFocus
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setIsEditing(true)}
              style={styles.editableAmount}
            >
              <ThemedText style={[styles.dailyAmount, { color: "#4CAF50" }]}>
                ${dailySpending.toFixed(2)}
              </ThemedText>
              <ThemedText style={[styles.editHint, { color: textColor }]}>
                (tap to edit)
              </ThemedText>
            </Pressable>
          )}
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <ThemedText
                style={[styles.breakdownAmount, { color: textColor }]}
              >
                ${breakdown.weekly.toFixed(0)}
              </ThemedText>
              <ThemedText style={[styles.breakdownLabel, { color: textColor }]}>
                Weekly
              </ThemedText>
            </View>
            <View style={styles.breakdownItem}>
              <ThemedText
                style={[styles.breakdownAmount, { color: textColor }]}
              >
                ${breakdown.monthly.toFixed(0)}
              </ThemedText>
              <ThemedText style={[styles.breakdownLabel, { color: textColor }]}>
                Monthly
              </ThemedText>
            </View>
            <View style={styles.breakdownItem}>
              <ThemedText
                style={[styles.breakdownAmount, { color: textColor }]}
              >
                ${breakdown.yearly.toFixed(0)}
              </ThemedText>
              <ThemedText style={[styles.breakdownLabel, { color: textColor }]}>
                Yearly
              </ThemedText>
            </View>
          </View>
        </View>

        {/* What You Can Buy */}
        <View
          style={[
            styles.purchaseContainer,
            { backgroundColor: "rgba(76, 175, 80, 0.1)" },
          ]}
        >
          <ThemedText style={[styles.purchaseIcon, { color: "#4CAF50" }]}>
            {whatCanBuy.icon}
          </ThemedText>
          <View style={styles.purchaseTextContainer}>
            <ThemedText style={[styles.purchaseText, { color: textColor }]}>
              You could buy: {whatCanBuy.item}
            </ThemedText>
            <ThemedText style={[styles.purchaseSubtext, { color: textColor }]}>
              Keep going and save for something even better! 🎯
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  gradientBackground: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    marginRight: 4,
  },
  savingsAmount: {
    fontSize: 48,
    fontFamily: FontFamily.bold,
  },
  dailyAmountContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  dailyAmountLabel: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    marginBottom: 8,
    opacity: 0.8,
  },
  editableAmount: {
    alignItems: "center",
  },
  dailyAmount: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  editHint: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
    marginTop: 2,
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "center",
    minWidth: 100,
  },
  breakdownContainer: {
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  breakdownItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  breakdownAmount: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  purchaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  purchaseIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  purchaseTextContainer: {
    flex: 1,
  },
  purchaseText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  purchaseSubtext: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.8,
    lineHeight: 16,
  },
});
