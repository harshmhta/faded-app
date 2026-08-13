import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { createSessionFromUrl } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Landing route for the web OAuth redirect. Native sign-in completes inside
 * `openAuthSessionAsync` and never reaches this screen.
 */
export default function OAuthSuccessScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // On web the tokens or code are already in the address bar.
        const href =
          typeof window !== "undefined" ? window.location.href : undefined;

        if (href) {
          const result = await createSessionFromUrl(href);
          if (!result.ok && result.message) {
            setError(result.message);
            return;
          }
        }
        router.replace("/(tabs)");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't complete sign-in.",
        );
      }
    };
    run();
  }, [params]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <>
          <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
          <Text
            style={[styles.link, { color: colors.tint }]}
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            Back to sign in
          </Text>
        </>
      ) : (
        <ActivityIndicator size="large" color={colors.tint} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  error: {
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
