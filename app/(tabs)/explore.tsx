import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { StyleSheet } from "react-native";

export default function InsightsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <HugeiconsIcon
          icon={StarIcon}
          size={310}
          color="#808080"
          strokeWidth={2.0}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Insights</ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <ThemedText type="subtitle">Personal Analytics</ThemedText>
        <ThemedText>
          Track your progress and discover patterns in your data.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.placeholderContainer}>
        <ThemedText>📊 Analytics Dashboard</ThemedText>
        <ThemedText>📈 Progress Tracking</ThemedText>
        <ThemedText>🎯 Goal Insights</ThemedText>
        <ThemedText>📱 Usage Patterns</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  contentContainer: {
    marginVertical: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    gap: 10,
  },
  placeholderContainer: {
    marginVertical: 20,
    gap: 15,
  },
});
