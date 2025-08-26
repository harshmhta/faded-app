import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

export default function ToolsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tools & Resources</ThemedText>
      <ThemedText>Access helpful tools and resources here.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});
