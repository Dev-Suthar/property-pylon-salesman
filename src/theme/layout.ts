import { ViewStyle } from "react-native";

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20, // horizontal screen gutter
};

// CRED shapes are nearly square.
export const radius = {
  none: 0,
  xs: 2,
  sm: 4, // buttons, chips, tiles
  md: 8, // cards, inputs
  lg: 8,
  xl: 8,
  card: 8,
  band: 8,
  pill: 999, // avatars only
};

// Flat design: no shadows or glows. Kept as empty styles for existing callers.
export const shadows = {
  glowPrimary: {} as ViewStyle,
  glowIndigo: {} as ViewStyle,
  card: {} as ViewStyle,
  floating: {} as ViewStyle,
  none: {} as ViewStyle,
};

// CRED-style underline field: no box, just a bottom rule.
export const field = {
  backgroundColor: "transparent",
  borderWidth: 0,
  borderBottomWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  borderRadius: 0,
} satisfies ViewStyle;

export const fieldFocused = {
  borderColor: "#FFFFFF",
} satisfies ViewStyle;
