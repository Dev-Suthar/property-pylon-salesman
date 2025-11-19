import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { theme } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  leftIcon,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (size === 'sm') {
      baseStyle.paddingVertical = 8;
      baseStyle.paddingHorizontal = 12;
    } else if (size === 'lg') {
      baseStyle.paddingVertical = 16;
      baseStyle.paddingHorizontal = 24;
    } else {
      baseStyle.paddingVertical = 12;
      baseStyle.paddingHorizontal = 16;
    }

    if (variant === 'default') {
      baseStyle.backgroundColor = theme.primary;
    } else if (variant === 'outline') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = theme.border;
    } else if (variant === 'ghost') {
      baseStyle.backgroundColor = 'transparent';
    } else if (variant === 'destructive') {
      baseStyle.backgroundColor = theme.destructive;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    if (size === 'sm') {
      baseStyle.fontSize = 14;
    } else if (size === 'lg') {
      baseStyle.fontSize = 18;
    } else {
      baseStyle.fontSize = 16;
    }

    if (variant === 'default' || variant === 'destructive') {
      baseStyle.color = theme.primaryForeground;
    } else {
      baseStyle.color = theme.foreground;
    }

    return baseStyle;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), disabled && styles.disabled, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'default' || variant === 'destructive' ? theme.primaryForeground : theme.foreground}
            size="small"
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  leftIcon: {
    marginRight: 8,
  },
});

