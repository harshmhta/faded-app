import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    AlertCircleIcon,
    HeartAddIcon,
    PencilEdit02Icon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface QuickActionProps {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  isFullWidth?: boolean;
}

function QuickAction({ icon, label, color, onPress, isFullWidth }: QuickActionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        isFullWidth ? styles.fullWidthActionButton : styles.actionButton,
        {
          backgroundColor: isDark
            ? `${color}20`
            : `${color}15`,
          borderColor: `${color}30`,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}25` }]}>
        <HugeiconsIcon
          icon={icon}
          size={24}
          color={color}
          strokeWidth={2}
        />
      </View>
      <ThemedText style={[
        isFullWidth ? styles.fullWidthActionLabel : styles.actionLabel, 
        { color: textColor }
      ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function QuickActions() {
  const cravingAction = {
    icon: AlertCircleIcon,
    label: "PANIC",
    color: "#FF6B6B",
    onPress: () => router.push("/category/coping-strategies"),
  };

  const otherActions = [
    {
      icon: PencilEdit02Icon,
      label: "Check-in",
      color: "#4CAF50",
      onPress: () => router.push("/check-in"),
    },
    {
      icon: UserGroupIcon,
      label: "Community",
      color: "#45B7D1",
      onPress: () => router.push("/messages"),
    },
    {
      icon: HeartAddIcon,
      label: "Support",
      color: "#9B59B6",
      onPress: () => router.push("/tools"),
    },
  ];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
      
      {/* Full-width Craving button */}
      <View style={styles.fullWidthContainer}>
        <QuickAction {...cravingAction} isFullWidth />
      </View>
      
      {/* Grid for other actions */}
      <View style={styles.actionsGrid}>
        {otherActions.map((action, index) => (
          <QuickAction key={index} {...action} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  fullWidthContainer: {
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    gap: 10,
    borderWidth: 1,
  },
  fullWidthActionButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 18,
    gap: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    flex: 1,
  },
  fullWidthActionLabel: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
});
