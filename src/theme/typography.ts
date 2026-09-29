import { TextStyle } from "react-native";
import { theme } from "./colors";

// Font families. iOS resolves weights by family name; Android uses the
// res/font XML families registered in MainApplication.kt.
// Fraunces (serif) stands in for CRED's Cirka; Manrope for Gilroy.
export const fonts = {
  sans: "Manrope",
  display: "Fraunces",
};

const w = (family: string, fontWeight: TextStyle["fontWeight"]) =>
  ({ fontFamily: family, fontWeight } as const);

export const typography = {
  hero: {
    ...w(fonts.display, "600"),
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.8,
    color: theme.foreground,
  },
  display: {
    ...w(fonts.display, "600"),
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: theme.foreground,
  },
  h1: {
    ...w(fonts.display, "600"),
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: theme.foreground,
  },
  h2: {
    ...w(fonts.display, "600"),
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.3,
    color: theme.foreground,
  },
  h3: {
    ...w(fonts.sans, "700"),
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
    color: theme.foreground,
  },
  title: {
    ...w(fonts.sans, "600"),
    fontSize: 15,
    lineHeight: 20,
    color: theme.foreground,
  },
  body: {
    ...w(fonts.sans, "500"),
    fontSize: 15,
    lineHeight: 22,
    color: theme.foreground,
  },
  bodyMuted: {
    ...w(fonts.sans, "500"),
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
  },
  bodySm: {
    ...w(fonts.sans, "500"),
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
  },
  label: {
    ...w(fonts.sans, "600"),
    fontSize: 13,
    lineHeight: 18,
    color: theme.foreground,
  },
  caption: {
    ...w(fonts.sans, "600"),
    fontSize: 11,
    lineHeight: 14,
    color: theme.textTertiary,
  },
  // CRED's spaced-out uppercase section labels
  overline: {
    ...w(fonts.sans, "700"),
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: theme.textTertiary,
  },
  eyebrow: {
    ...w(fonts.sans, "700"),
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: theme.textTertiary,
  },
  button: {
    ...w(fonts.sans, "800"),
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  number: {
    ...w(fonts.display, "600"),
    fontSize: 28,
    letterSpacing: -0.5,
    color: theme.foreground,
  },
} satisfies Record<string, TextStyle>;
