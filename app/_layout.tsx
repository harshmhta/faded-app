import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ReactNavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import "react-native-reanimated";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StartupScreen } from "@/components/StartupScreen";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "LeavvesSans-Thin": require("../assets/fonts/LeavvesSans-Thin.ttf"),
    "LeavvesSans-ThinItalic": require("../assets/fonts/LeavvesSans-ThinItalic.ttf"),
    "LeavvesSans-Light": require("../assets/fonts/LeavvesSans-Light.ttf"),
    "LeavvesSans-LightItalic": require("../assets/fonts/LeavvesSans-LightItalic.ttf"),
    "LeavvesSans-Regular": require("../assets/fonts/LeavvesSans-Regular.ttf"),
    "LeavvesSans-Italic": require("../assets/fonts/LeavvesSans-Italic.ttf"),
    "LeavvesSans-Medium": require("../assets/fonts/LeavvesSans-Medium.ttf"),
    "LeavvesSans-MediumItalic": require("../assets/fonts/LeavvesSans-MediumItalic.ttf"),
    "LeavvesSans-Bold": require("../assets/fonts/LeavvesSans-Bold.ttf"),
    "LeavvesSans-BoldItalic": require("../assets/fonts/LeavvesSans-BoldItalic.ttf"),
    "LeavvesSans-Black": require("../assets/fonts/LeavvesSans-Black.ttf"),
    "LeavvesSans-BlackItalic": require("../assets/fonts/LeavvesSans-BlackItalic.ttf"),
  });
  const [showStartup, setShowStartup] = useState(true);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const handleStartupComplete = () => {
    setShowStartup(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeWrapper>
          {showStartup ? (
            <StartupScreen onAnimationComplete={handleStartupComplete} />
          ) : (
            <ProtectedRoute>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                <Stack.Screen
                  name="appearance"
                  options={{ presentation: "modal", title: "Appearance" }}
                />
                <Stack.Screen
                  name="settings"
                  options={{ presentation: "modal", title: "Settings" }}
                />
              </Stack>
            </ProtectedRoute>
          )}
          <StatusBar style="auto" />
        </ThemeWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();

  return (
    <ReactNavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      {children}
    </ReactNavigationThemeProvider>
  );
}
