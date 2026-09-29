import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "../../theme/colors";

interface ScreenBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Kept for API compatibility; the CRED look is flat black. */
  glow?: "strong" | "soft" | "none";
}

/** Legacy glow layer — renders nothing in the flat CRED look. */
export function GlowBackdrop(_props: { glow?: "strong" | "soft" }) {
  return null;
}

export default function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
});
