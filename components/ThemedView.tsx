import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const hasExplicitColors = lightColor !== undefined || darkColor !== undefined;
  const backgroundColor = hasExplicitColors
    ? useThemeColor({ light: lightColor, dark: darkColor }, "background")
    : "transparent";

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
