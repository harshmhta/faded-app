import CommunityTab from "@/components/CommunityTab";
import RedditTab from "@/components/RedditTab";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

export default function MessagesScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
        },
      ]}
    >
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: tintColor,
          tabBarInactiveTintColor: mutedColor,
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            textTransform: "none",
          },
          tabBarStyle: {
            backgroundColor,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: mutedColor + "20",
          },
          tabBarIndicatorStyle: {
            backgroundColor: tintColor,
            height: 3,
            borderRadius: 2,
          },
          tabBarPressColor: tintColor + "20",
        }}
      >
        <Tab.Screen
          name="Community"
          component={CommunityTab}
          options={{
            tabBarLabel: "💬 Community",
          }}
        />
        <Tab.Screen
          name="Reddit"
          component={RedditTab}
          options={{
            tabBarLabel: "🍃 r/leaves",
          }}
        />
      </Tab.Navigator>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
