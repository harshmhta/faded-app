import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  CheckmarkCircle02Icon,
  MinusSignCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RedditCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectModerate: () => void;
  onSelectQuit: () => void;
}

const { width } = Dimensions.get("window");

export function RedditCommunityModal({
  visible,
  onClose,
  onSelectModerate,
  onSelectQuit,
}: RedditCommunityModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <ThemedView
            lightColor={Colors.light.background}
            darkColor={Colors.dark.background}
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom || 20 },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={onClose}
                style={[styles.closeButton, isDark && styles.closeButtonDark]}
              >
                <ThemedText style={styles.closeText}>✕</ThemedText>
              </Pressable>
            </View>

            {/* Title and Description */}
            <ThemedText type="title" style={styles.title}>
              Choose Your Path
            </ThemedText>
            <ThemedText style={styles.description}>
              Connect with a supportive community that matches your goals
            </ThemedText>

            {/* Option Cards */}
            <View style={styles.optionsContainer}>
              {/* Moderate Option */}
              <Pressable
                style={[
                  styles.optionCard,
                  isDark && styles.optionCardDark,
                  styles.moderateCard,
                ]}
                onPress={onSelectModerate}
              >
                <View
                  style={[
                    styles.optionIconContainer,
                    styles.moderateIconContainer,
                  ]}
                >
                  <HugeiconsIcon
                    icon={MinusSignCircleIcon}
                    size={28}
                    color="#FF9500"
                  />
                </View>
                <ThemedText type="subtitle" style={styles.optionTitle}>
                  Moderate Usage
                </ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Join r/Petioles - A community focused on responsible use &
                  taking tolerance breaks
                </ThemedText>
                <View style={styles.communityStats}>
                  <View
                    style={[styles.statBadge, isDark && styles.statBadgeDark]}
                  >
                    <ThemedText style={styles.statText}>
                      Mindful approach
                    </ThemedText>
                  </View>
                  <View
                    style={[styles.statBadge, isDark && styles.statBadgeDark]}
                  >
                    <ThemedText style={styles.statText}>T-breaks</ThemedText>
                  </View>
                </View>
              </Pressable>

              {/* Quit Option */}
              <Pressable
                style={[
                  styles.optionCard,
                  isDark && styles.optionCardDark,
                  styles.quitCard,
                ]}
                onPress={onSelectQuit}
              >
                <View
                  style={[styles.optionIconContainer, styles.quitIconContainer]}
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={28}
                    color="#4CAF50"
                  />
                </View>
                <ThemedText type="subtitle" style={styles.optionTitle}>
                  Quit Completely
                </ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Join r/leaves - A supportive community for those wanting to
                  quit cannabis entirely
                </ThemedText>
                <View style={styles.communityStats}>
                  <View
                    style={[styles.statBadge, isDark && styles.statBadgeDark]}
                  >
                    <ThemedText style={styles.statText}>
                      Full sobriety
                    </ThemedText>
                  </View>
                  <View
                    style={[styles.statBadge, isDark && styles.statBadgeDark]}
                  >
                    <ThemedText style={styles.statText}>Recovery</ThemedText>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Footer Note */}
            <ThemedText style={styles.footerNote}>
              You can always switch communities later
            </ThemedText>
          </ThemedView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  closeButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  closeText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 28,
    lineHeight: 32,
  },
  description: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FontFamily.regular,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    backgroundColor: "#F6F7F9",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  optionCardDark: {
    backgroundColor: "#181A1B",
    borderColor: "#2A2A2A",
  },
  moderateCard: {
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  quitCard: {
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  moderateIconContainer: {
    backgroundColor: "rgba(255, 149, 0, 0.15)",
  },
  quitIconContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  optionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  communityStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statBadgeDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  footerNote: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.6,
    fontFamily: FontFamily.regular,
  },
});
