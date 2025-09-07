import React, { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import DashboardHeader from "@/components/DashboardHeader";

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Dashboard Header */}
      <DashboardHeader parentScrollRef={scrollViewRef} />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Your main dashboard content will go here */}
        <View style={styles.placeholderContainer}></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  placeholderContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
