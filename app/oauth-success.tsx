import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { account } from "@/lib/appwrite";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function OAuthSuccessScreen() {
  const { refreshUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        const userId = typeof params.userId === "string" ? params.userId : undefined;
        const secret = typeof params.secret === "string" ? params.secret : undefined;

        if (userId && secret) {
          // Finalize session for native using Appwrite one-time secret
          await account.createSession(userId, secret);
        }

        await refreshUser();
      } finally {
        router.replace("/(tabs)");
      }
    };
    run();
  }, [params.secret, params.userId, refreshUser]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});


