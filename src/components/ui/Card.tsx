import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../theme/colors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[{ padding: 0 }, style]}>{children}</View>;
}

export function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[{ marginBottom: 12 }, style]}>{children}</View>;
}

export function CardTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {typeof children === "string" ? (
        <Text style={styles.title}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.foreground,
  },
});
