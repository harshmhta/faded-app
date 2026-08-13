import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ThemeOption = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

export interface ThemeContextType {
  colorScheme: ColorScheme;
  themePreference: ThemeOption;
  setThemePreference: (theme: ThemeOption) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] =
    useState<ThemeOption>("system");
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useSystemColorScheme();

  // Determine the actual color scheme based on preference
  const colorScheme: ColorScheme =
    themePreference === "system"
      ? (systemColorScheme ?? "light")
      : themePreference;

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme-preference");
      if (savedTheme && ["system", "light", "dark"].includes(savedTheme)) {
        setThemePreferenceState(savedTheme as ThemeOption);
      }
    } catch (error) {
      console.log("Error loading theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemePreference = async (theme: ThemeOption) => {
    try {
      await AsyncStorage.setItem("theme-preference", theme);
      setThemePreferenceState(theme);
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  const value: ThemeContextType = {
    colorScheme,
    themePreference,
    setThemePreference,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Custom hook to replace useColorScheme throughout the app
export function useColorScheme(): ColorScheme {
  // Both hooks run on every render. Previously useSystemColorScheme() sat
  // behind an early return, so a component rendered once outside the provider
  // and once inside it changed hook order and threw.
  const themeContext = useContext(ThemeContext);
  const systemColorScheme = useSystemColorScheme();

  return themeContext?.colorScheme ?? systemColorScheme ?? "light";
}
