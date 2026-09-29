import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { theme } from "../../theme/colors";
import { fonts } from "../../theme/typography";

/** "Open-house" mark from the website navbar, on a cream square. */
export function BrandMark({ size = 36, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.tile, { width: size, height: size }, style]}>
      <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <Path
          d="M14.5 9.5 9.6 4.6a1.4 1.4 0 0 0-2 0L3.4 8.8a2 2 0 0 0-.6 1.4V18a2 2 0 0 0 2 2h7.7"
          stroke="#0D0D0D"
          strokeWidth={2.2}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <Path
          d="M11 13.5h9.5M11 16.5h6"
          stroke="#0D0D0D"
          strokeWidth={2.2}
          strokeLinecap="square"
        />
      </Svg>
    </View>
  );
}

export default function BrandLogo({ size = 36, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.row, style]}>
      <BrandMark size={size} />
      <Text style={[styles.word, { fontSize: size * 0.55 }]}>dreamtobuy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.cream,
    borderRadius: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  word: {
    fontFamily: fonts.display,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: theme.foreground,
  },
});
