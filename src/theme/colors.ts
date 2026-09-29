// Theme colors — CRED-style NeoPOP palette (monochrome + cream CTA)
export const colors = {
  // Light theme (fallback, unused — the app is dark only)
  light: {
    background: "#FFFFFF",
    foreground: "#0F172A",
    card: "#FFFFFF",
    cardForeground: "#0F172A",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    secondary: "#F1F5F9",
    secondaryForeground: "#1E293B",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    accent: "#F1F5F9",
    accentForeground: "#1E293B",
    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",
    success: "#10B981",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#FFFFFF",
    border: "#E2E8F0",
    input: "#E2E8F0",
    ring: "#2563EB",
    white: "#FFFFFF",
  },
  // CRED / NeoPOP dark theme (primary theme).
  // Tokens that screens suffix with a hex alpha (card, accent, primary,
  // destructive, warning) must stay 6-digit hex.
  // Legacy key names (blue*, indigo*, glass*) are kept so existing screens
  // compile; they now resolve to the monochrome palette.
  dark: {
    background: "#000000",
    foreground: "#FFFFFF",
    card: "#0F0F0F",
    cardForeground: "#FFFFFF",
    primary: "#FFFBF0",
    primaryForeground: "#0D0D0D",
    secondary: "#161616",
    secondaryForeground: "#E6E6E6",
    muted: "#161616",
    mutedForeground: "#8C8C8C",
    accent: "#1C1C1C",
    accentForeground: "#FFFFFF",
    indigo: "#FFFBF0",
    destructive: "#EE4D37",
    destructiveForeground: "#FFFFFF",
    success: "#06C270",
    successForeground: "#FFFFFF",
    warning: "#F08D32",
    warningForeground: "#0D0D0D",
    border: "rgba(255,255,255,0.10)",
    input: "rgba(255,255,255,0.18)",
    ring: "#FFFFFF",
    white: "#FFFFFF",

    // NeoPOP extras
    cream: "#FFFBF0",
    creamEdge: "#8A8578",
    surface: "#0F0F0F",
    surfaceRaised: "#161616",
    textSecondary: "rgba(255,255,255,0.6)",
    textTertiary: "rgba(255,255,255,0.38)",

    // Legacy names → monochrome
    backgroundDeep: "#000000",
    surfaceSoft: "#0A0A0A",
    glassBorder: "rgba(255,255,255,0.08)",
    glassBorderActive: "rgba(255,255,255,0.6)",
    hairline: "rgba(255,255,255,0.10)",
    divider: "rgba(255,255,255,0.06)",
    fill: "rgba(255,255,255,0.03)",
    fillStrong: "rgba(255,255,255,0.07)",
    blue200: "rgba(255,255,255,0.6)",
    blue300: "#FFFFFF",
    blue400: "#FFFFFF",
    indigo400: "#FFFFFF",
    emerald300: "#06C270",
    emerald400: "#06C270",
    amber300: "#F08D32",
    amber400: "#F08D32",
    rose300: "#EE4D37",
    successTint: "rgba(6,194,112,0.12)",
    warningTint: "rgba(240,141,50,0.12)",
    destructiveTint: "rgba(238,77,55,0.12)",
    primaryTint: "rgba(255,255,255,0.06)",
    accentTint: "rgba(255,255,255,0.06)",
    overlay: "rgba(0,0,0,0.75)",
  },
};

export const theme = colors.dark;

// No gradients in the CRED language: every pair is solid so any leftover
// gradient renders flat.
export const gradients = {
  primary: ["#FFFBF0", "#FFFBF0"],
  brand: ["#FFFBF0", "#FFFBF0"],
  text: ["#FFFFFF", "#FFFFFF"],
  textSoft: ["#FFFFFF", "#FFFFFF"],
  glass: ["#0F0F0F", "#0F0F0F"],
  secondary: ["#161616", "#161616"],
  success: ["#06C270", "#06C270"],
  warning: ["#F08D32", "#F08D32"],
  danger: ["#EE4D37", "#EE4D37"],
  fadeBottom: ["rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"],
};

export const gradientDirection = {
  brand: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
};
