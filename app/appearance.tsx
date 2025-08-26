import { Stack, router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useTheme, type ThemeOption } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ArrowLeft01Icon,
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

interface ThemeButtonProps {
  theme: ThemeOption;
  icon: any;
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

function ThemeButton({
  theme,
  icon,
  title,
  isSelected,
  onPress,
}: ThemeButtonProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      style={[
        styles.themeButton,
        {
          borderColor: isSelected
            ? Colors[colorScheme ?? "light"].tint
            : Colors[colorScheme ?? "light"].icon + "40",
          backgroundColor: isSelected
            ? Colors[colorScheme ?? "light"].tint + "10"
            : "transparent",
        },
      ]}
      onPress={onPress}
    >
      <HugeiconsIcon
        icon={icon}
        size={32}
        color={
          isSelected
            ? Colors[colorScheme ?? "light"].tint
            : Colors[colorScheme ?? "light"].icon
        }
        strokeWidth={2.0}
      />
      <ThemedText
        style={[
          styles.themeTitle,
          {
            color: isSelected
              ? Colors[colorScheme ?? "light"].tint
              : Colors[colorScheme ?? "light"].text,
          },
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function AppearanceScreen() {
  const colorScheme = useColorScheme();
  const { themePreference, setThemePreference } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Appearance",
          headerShown: true,
          headerTitleStyle: {
            fontSize: 18,
            fontFamily: FontFamily.medium,
          },
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={24}
                color={Colors[colorScheme ?? "light"].text}
                strokeWidth={2.0}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Color Scheme</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Turn on dark mode, or let Faded visually match your device settings.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.themeOptions}>
          <ThemeButton
            theme="system"
            icon={ComputerIcon}
            title="System"
            isSelected={themePreference === "system"}
            onPress={() => setThemePreference("system")}
          />
          <ThemeButton
            theme="light"
            icon={Sun03Icon}
            title="Light"
            isSelected={themePreference === "light"}
            onPress={() => setThemePreference("light")}
          />
          <ThemeButton
            theme="dark"
            icon={Moon02Icon}
            title="Dark"
            isSelected={themePreference === "dark"}
            onPress={() => setThemePreference("dark")}
          />
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerButton: {
    padding: 8,
    marginLeft: -4,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  themeOptions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: "transparent",
  },
  themeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  themeTitle: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    marginTop: 8,
  },
});
