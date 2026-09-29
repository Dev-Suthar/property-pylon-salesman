import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { theme } from "../../theme/colors";
import { fonts } from "../../theme/typography";

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
}

export const initialsOf = (name?: string | null) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .filter((part) => /[\p{L}\p{N}]/u.test(part[0] ?? ""))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** Monochrome initials in a hairline ring. */
export default function Avatar({ name, uri, size = 40, style }: AvatarProps) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={[box, style as any]} />;
  }
  return (
    <View style={[styles.center, box, style]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceRaised,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  text: {
    fontFamily: fonts.display,
    fontWeight: "600",
    color: theme.foreground,
  },
});
