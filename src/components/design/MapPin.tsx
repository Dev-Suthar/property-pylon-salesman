import React from "react";
import { StyleSheet, View } from "react-native";
import { Home } from "lucide-react-native";
import { theme } from "../../theme/colors";

/** Square cream pin with a pointer, used on every map. */
export default function MapPin({ size = 40 }: { size?: number }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.head, { width: size, height: size }]}>
        <Home size={size * 0.46} color="#0D0D0D" strokeWidth={2.4} />
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  head: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.cream,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#0D0D0D",
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: theme.cream,
  },
});
