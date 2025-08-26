/**
 * Font family constants for consistent typography throughout the app.
 * Uses the LeavvesSans font family with various weights and styles.
 */

export const FontFamily = {
  thin: "LeavvesSans-Thin",
  thinItalic: "LeavvesSans-ThinItalic",
  light: "LeavvesSans-Light",
  lightItalic: "LeavvesSans-LightItalic",
  regular: "LeavvesSans-Regular",
  italic: "LeavvesSans-Italic",
  medium: "LeavvesSans-Medium",
  mediumItalic: "LeavvesSans-MediumItalic",
  bold: "LeavvesSans-Bold",
  boldItalic: "LeavvesSans-BoldItalic",
  black: "LeavvesSans-Black",
  blackItalic: "LeavvesSans-BlackItalic",
} as const;

/**
 * Default font family for the app
 */
export const DEFAULT_FONT_FAMILY = FontFamily.regular;

/**
 * Font weights mapped to corresponding LeavvesSans variants
 */
export const getFontFamily = (
  weight: string | number = "normal",
  italic = false,
): string => {
  const weightMap: Record<string | number, string> = {
    "100": italic ? FontFamily.thinItalic : FontFamily.thin,
    "200": italic ? FontFamily.lightItalic : FontFamily.light,
    "300": italic ? FontFamily.lightItalic : FontFamily.light,
    normal: italic ? FontFamily.italic : FontFamily.regular,
    "400": italic ? FontFamily.italic : FontFamily.regular,
    "500": italic ? FontFamily.mediumItalic : FontFamily.medium,
    "600": italic ? FontFamily.mediumItalic : FontFamily.medium,
    bold: italic ? FontFamily.boldItalic : FontFamily.bold,
    "700": italic ? FontFamily.boldItalic : FontFamily.bold,
    "800": italic ? FontFamily.blackItalic : FontFamily.black,
    "900": italic ? FontFamily.blackItalic : FontFamily.black,
  };

  return weightMap[weight] || FontFamily.regular;
};
