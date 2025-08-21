import { DarkTheme, DefaultTheme, ThemeProvider as ReactNavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import 'react-native-reanimated';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StartupScreen } from '@/components/StartupScreen';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
                <Stack.Screen name="appearance" options={{ presentation: 'modal', title: 'Appearance' }} />
                <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
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
    <ReactNavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </ReactNavigationThemeProvider>
  );
}
