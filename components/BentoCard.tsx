import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

export type BentoCardProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function BentoCard({
  title,
  subtitle,
  icon,
  onPress,
  style,
  children,
}: BentoCardProps) {
  const Container = onPress ? Pressable : View;
  const colorScheme = useColorScheme() ?? "light";
  const borderColor = colorScheme === "dark" ? "#2A2A2A" : "#E6E8EB";

  return (
    <Container onPress={onPress} style={[styles.wrapper, style]}>
      <ThemedView
        lightColor="#F6F7F9"
        darkColor="#181A1B"
        style={[styles.card, { borderColor }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" numberOfLines={1}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
        </View>
        {children ? <View style={styles.content}>{children}</View> : null}
      </ThemedView>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  subtitle: {
    opacity: 0.8,
  },
  content: {
    marginTop: 4,
  },
});
