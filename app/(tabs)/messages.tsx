import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
        },
      ]}
    >
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
