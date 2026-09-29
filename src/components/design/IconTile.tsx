import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "../../theme/colors";
import { radius } from "../../theme/layout";

export type IconTileTone =
  | "glass"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "indigo";

/** Icon colour per tone. Monochrome except for status tones. */
export const iconToneColor: Record<IconTileTone, string> = {
  glass: theme.foreground,
  brand: "#0D0D0D",
  success: theme.success,
  warning: theme.warning,
  danger: theme.destructive,
  primary: theme.foreground,
  indigo: theme.foreground,
};

interface IconTileProps {
  children: React.ReactNode;
  tone?: IconTileTone;
  size?: number;
  style?: ViewStyle;
}

/** Square hairline tile; "brand" is a filled cream tile. */
export default function IconTile({ children, tone = "glass", size = 40, style }: IconTileProps) {
  const filled = tone === "brand";
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size },
        filled && { backgroundColor: theme.cream, borderColor: theme.cream },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: theme.hairline,
    backgroundColor: theme.surfaceRaised,
  },
});
