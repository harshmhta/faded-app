import { useColorScheme } from "@/hooks/useColorScheme";
import { MeshGradientView } from "expo-mesh-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

export function GlobalMeshBackground() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // Slightly darker palette in dark mode to avoid bright wash
  const colors = isDark
    ? [
        "#1E4A8A26",
        "#33531226",
        "#7AA31E26",
        "#1E4A8A14",
        "#0B0B0B",
        "#7AA31E14",
        "#1E4A8A0D",
        "#3353120D",
        "#7AA31E0D",
      ]
    : [
        "#297FE21A",
        "#577D141A",
        "#9ECA501A",
        "#297FE20D",
        "#FFFFFF",
        "#9ECA500D",
        "#297FE206",
        "#577D1406",
        "#9ECA5006",
      ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <MeshGradientView
        style={StyleSheet.absoluteFill}
        rows={3}
        columns={3}
        colors={colors}
        points={[
          [0.0, 0.0],
          [0.5, 0.0],
          [1.0, 0.0],
          [0.0, 0.5],
          [0.5, 0.5],
          [1.0, 0.5],
          [0.0, 1.0],
          [0.5, 1.0],
          [1.0, 1.0],
        ]}
        smoothsColors={true}
        ignoresSafeArea={true}
      />
    </View>
  );
}
