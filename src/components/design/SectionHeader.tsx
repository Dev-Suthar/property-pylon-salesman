import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { theme } from "../../theme/colors";
import { typography } from "../../theme/typography";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        <Text style={typography.h3}>{title}</Text>
        {subtitle ? <Text style={[typography.bodySm, { marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <ArrowRight size={14} color={theme.blue300} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12 },
  action: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { ...typography.label, fontWeight: "600", color: theme.blue300 },
});
