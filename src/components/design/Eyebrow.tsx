import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { theme } from "../../theme/colors";
import { typography } from "../../theme/typography";

/** CRED overline: a short rule followed by spaced uppercase text. */
export default function Eyebrow({ label, style }: { label: string; style?: ViewStyle }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.rule} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
  },
  rule: { width: 18, height: 1, backgroundColor: theme.textTertiary },
  text: { ...typography.overline },
});
