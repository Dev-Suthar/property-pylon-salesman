import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/colors';
import { fonts, typography } from '../../theme/typography';
import { field, fieldFocused } from '../../theme/layout';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: TextInputProps['style'];
}

export function Input({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const isMultiline = Boolean(props.multiline);
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            focused && fieldFocused,
            isMultiline ? styles.textArea : undefined,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            error ? styles.inputError : undefined,
            style,
          ]}
          placeholderTextColor={theme.textTertiary}
          selectionColor={theme.blue400}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.overline,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 48,
    ...field,
    paddingHorizontal: 0,
    fontFamily: fonts.sans,
    fontWeight: '600',
    fontSize: 16,
    color: theme.foreground,
  },
  textArea: {
    height: undefined,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    minHeight: 96,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: 30,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputError: {
    borderColor: theme.destructive,
  },
  leftIcon: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: theme.rose300,
    marginTop: 4,
  },
});

export default Input;

