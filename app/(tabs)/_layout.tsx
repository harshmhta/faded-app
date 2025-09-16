import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import {
  DiscoverCircleIcon,
  Home01Icon,
  Leaf04Icon,
  Message01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor:
          colorScheme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            borderTopWidth: 0,
            backgroundColor: "transparent",
            height: 83,
            paddingBottom: 22,
            paddingTop: 6,
            paddingHorizontal: 20,
            // Add subtle shadow for the entire tab bar
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          default: {
            borderTopWidth: 0,
            backgroundColor: "transparent",
            height: 73,
            paddingBottom: 10,
            paddingTop: 6,
            paddingHorizontal: 50,
            elevation: 8,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={Home01Icon}
              size={26}
              color={color}
              strokeWidth={2.5}
              variant={focused ? "solid" : "stroke"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={DiscoverCircleIcon}
              size={26}
              color={color}
              strokeWidth={2.5}
              variant={focused ? "solid" : "stroke"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={Leaf04Icon}
              size={26}
              color={color}
              strokeWidth={2.5}
              variant={focused ? "solid" : "stroke"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={Message01Icon}
              size={26}
              color={color}
              strokeWidth={2.5}
              variant={focused ? "solid" : "stroke"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={Settings02Icon}
              size={26}
              color={color}
              strokeWidth={2.5}
              variant={focused ? "solid" : "stroke"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
