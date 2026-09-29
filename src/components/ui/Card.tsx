import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/layout';

type CardVariant =
  | 'default'
  | 'glass'
  | 'flat'
  | 'gradient-primary'
  | 'gradient-success'
  | 'gradient-warning';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: CardVariant;
}

// CRED cards: flat surface, hairline border, near-square corners.
const FILLED: Partial<Record<CardVariant, string>> = {
  'gradient-primary': theme.cream,
  'gradient-success': theme.success,
  'gradient-warning': theme.warning,
};

export function Card({ children, style, variant = 'default' }: CardProps) {
  const fill = FILLED[variant];
  return (
    <View
      style={[
        styles.base,
        variant === 'flat' ? styles.flat : styles.surface,
        fill ? { backgroundColor: fill, borderColor: fill } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ padding: 0 }, style]}>{children}</View>;
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ marginBottom: 16 }, style]}>{children}</View>;
}

export function CardTitle({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={style}>
      {typeof children === 'string' ? (
        <Text style={styles.title}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ marginTop: 16 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  surface: {
    backgroundColor: theme.surface,
    borderColor: theme.glassBorder,
  },
  flat: {
    backgroundColor: 'transparent',
    borderColor: theme.hairline,
  },
  // Section titles read as CRED overlines: small, spaced, uppercase.
  title: {
    ...typography.overline,
    color: theme.textSecondary,
  },
});
