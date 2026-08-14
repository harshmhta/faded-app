import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const {
    isOnboarded,
    isLoading: profileLoading,
    profile,
  } = useProfile();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!user) {
      // User is not authenticated
      if (!inAuthGroup) {
        // Redirect to sign-in if not already in auth routes
        router.replace("/(auth)/sign-in");
      }
      return;
    }

    // Signed in. Wait for the profile before deciding anything about
    // onboarding — routing off a not-yet-loaded profile would bounce an
    // existing user through the flow a second time.
    if (profileLoading || !profile) return;

    if (!isOnboarded) {
      if (!inOnboarding) router.replace("/onboarding");
      return;
    }

    if (inAuthGroup || inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, isOnboarded, profileLoading, profile]);

  // Hold the spinner while the profile is still in flight for a signed-in
  // user — otherwise the tabs flash for a frame before a non-onboarded user
  // is redirected into the onboarding flow. If the profile load *failed*
  // (profileLoading false, profile null), fall through and render the app:
  // a network error should degrade to "assume onboarded", not a dead spinner.
  if (isLoading || (user && profileLoading && !profile)) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: "transparent" }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
