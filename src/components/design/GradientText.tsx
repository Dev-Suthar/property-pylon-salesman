import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { theme } from "../../theme/colors";

interface GradientTextProps extends TextProps {
  colors?: string[];
  style?: TextStyle | TextStyle[];
  /** "brand" = primary headline colour; "soft" = secondary line. */
  variant?: "brand" | "soft";
}

/** Plain headline text (no gradients in the CRED language). */
export default function GradientText({
  colors: _colors,
  variant = "brand",
  style,
  children,
  ...props
}: GradientTextProps) {
  return (
    <Text
      {...props}
      style={[{ color: variant === "soft" ? theme.textSecondary : theme.foreground }, style]}
    >
      {children}
    </Text>
  );
}
