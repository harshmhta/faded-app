import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TileProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: any;
  hideChevron?: boolean;
};

function Tile({ title, subtitle, onPress, style, hideChevron }: TileProps) {
  const scheme = useColorScheme() ?? "light";
  const isAppDark = scheme === "dark";
  const isDarkTile = isAppDark;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        isDarkTile ? styles.tileDark : styles.tileLight,
        isDarkTile ? styles.tileBorderDark : styles.tileBorderLight,
        style,
      ]}
    >
      <BlurView
        tint={isDarkTile ? "dark" : "light"}
        intensity={24}
        style={styles.tileBlur}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          isDarkTile
            ? [
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.015)",
                "rgba(255,255,255,0)",
              ]
            : ["rgba(0,0,0,0.03)", "rgba(0,0,0,0.015)", "rgba(0,0,0,0)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tileGradient}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          isDarkTile
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]
            : ["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]
        }
        start={{ x: 0.3, y: 0.0 }}
        end={{ x: 0.3, y: 1.0 }}
        style={styles.tileBottomFade}
      />
      <View>
        <ThemedText
          type="subtitle"
          style={[
            styles.tileTitle,
            isDarkTile ? styles.tileTitleDark : styles.tileTitleLight,
          ]}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            style={[
              styles.tileSubtitle,
              isDarkTile ? styles.tileSubtitleDark : styles.tileSubtitleLight,
            ]}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {!hideChevron && (
        <View style={styles.chevron}>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            color={isDarkTile ? "#FFFFFF" : "#000000"}
            strokeWidth={2.5}
          />
        </View>
      )}
    </Pressable>
  );
}

export default function ExploreResourcesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 45 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <Tile title={""} style={styles.fullWidthTile} hideChevron={true} />
          <Tile title={""} />
          <Tile title={""} />
          <Tile title={""} />
          <Tile title={""} />
          <Tile title={""} />
          <Tile title={""} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    minHeight: 180,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  tileBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tileGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tileBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  tileLight: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  tileDark: {
    backgroundColor: "rgba(16,16,16,0.55)",
  },
  tileBorderDark: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tileBorderLight: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  tileTitle: {
    fontSize: 26,
    lineHeight: 28,
  },
  tileTitleDark: {
    color: "#FFFFFF",
  },
  tileTitleLight: {
    color: "#000000",
  },
  tileSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  tileSubtitleDark: {
    color: "rgba(255,255,255,0.7)",
  },
  tileSubtitleLight: {
    color: "rgba(0,0,0,0.7)",
  },
  chevron: {
    position: "absolute",
    right: 14,
    bottom: 14,
  },
  fullWidthTile: {
    width: "100%",
    marginBottom: 16,
  },
});
