import React from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

interface GradientViewProps extends ViewProps {
  colors: (string | number)[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * The CRED language has no gradients: this renders a flat View filled with
 * the first colour. Kept as a drop-in so existing call sites keep working.
 */
export default function GradientView({
  colors,
  start: _start,
  end: _end,
  locations: _locations,
  style,
  children,
  ...rest
}: GradientViewProps) {
  const fill = typeof colors[0] === "string" ? (colors[0] as string) : undefined;
  // The gradient colour is the fill; it wins over any base backgroundColor.
  return (
    <View {...rest} style={[style, fill ? { backgroundColor: fill } : null]}>
      {children}
    </View>
  );
}
