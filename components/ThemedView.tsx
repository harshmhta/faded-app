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
  // The hook must run on every render, so resolve the themed color
  // unconditionally and only then decide whether to use it. Calling it inside
  // the ternary changed the hook count between renders whenever a caller
  // started or stopped passing an explicit color.
  const themedBackground = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const hasExplicitColors = lightColor !== undefined || darkColor !== undefined;
  const backgroundColor = hasExplicitColors ? themedBackground : "transparent";

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
