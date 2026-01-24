import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as ReactNavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

import { GlobalMeshBackground } from "@/components/GlobalMeshBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StartupScreen } from "@/components/StartupScreen";
import { Colors } from "@/constants/Colors";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConsumptionProvider } from "@/contexts/ConsumptionContext";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
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
    <KeyboardProvider>
      <ThemeProvider>
        <AuthProvider>
          <ConsumptionProvider>
            <CourseProgressProvider>
              <ThemeWrapper>
                {showStartup ? (
                  <StartupScreen onAnimationComplete={handleStartupComplete} />
                ) : (
                  <ProtectedRoute>
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: "transparent" },
                    headerTransparent: true,
                    headerStyle: { backgroundColor: "transparent" },
                  }}
                >
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="oauth-success"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen
                    name="appearance"
                    options={{ presentation: "modal", title: "Appearance" }}
                  />
                  <Stack.Screen
                    name="check-in"
                    options={{ 
                      presentation: "modal",
                      headerShown: false,
                      animation: "slide_from_bottom"
                    }}
                  />
                  <Stack.Screen
                    name="track-consumption"
                    options={{ 
                      presentation: "modal",
                      headerShown: false,
                      animation: "slide_from_bottom"
                    }}
                  />
                  <Stack.Screen
                    name="sos-mirror"
                    options={{ 
                      presentation: "modal",
                      headerShown: false,
                      animation: "slide_from_bottom"
                    }}
                  />
                  <Stack.Screen
                    name="category/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="content/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="chapter/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="lesson/[chapter]/[section]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="quiz/[id]"
                    options={{ headerShown: false }}
                  />
                </Stack>
                </ProtectedRoute>
              )}
            </ThemeWrapper>
            </CourseProgressProvider>
          </ConsumptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = colorScheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: "transparent",
        card: base.colors.card,
        border: base.colors.border,
        text: base.colors.text,
        primary: base.colors.primary,
        notification: base.colors.notification,
      },
    };
  }, [colorScheme]);

  return (
    <ReactNavigationThemeProvider value={navigationTheme}>
      <View
        style={[
          styles.appContainer,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <GlobalMeshBackground />
        {children}
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </View>
    </ReactNavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
