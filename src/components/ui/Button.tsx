import React, { useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { tap } from '../../utils/haptics';

type Variant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'text'
  | 'destructive'
  | 'white';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const DEPTH = 3;

const SIZES = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: 11 },
  default: { height: 48, paddingHorizontal: 20, fontSize: 12.5 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 13.5 },
};

// NeoPOP palettes: face + bottom edge + right edge.
const POP = {
  primary: { face: theme.cream, bottom: '#8A8578', right: '#C4BFB0', text: '#0D0D0D', border: undefined },
  secondary: { face: '#000000', bottom: '#8C8C8C', right: '#FFFFFF', text: '#FFFFFF', border: '#FFFFFF' },
  destructive: { face: '#EE4D37', bottom: '#8F2E21', right: '#B53B2A', text: '#FFFFFF', border: undefined },
};

const normalise = (v: Variant): 'primary' | 'secondary' | 'destructive' | 'ghost' | 'text' => {
  switch (v) {
    case 'default':
    case 'primary':
    case 'white':
      return 'primary';
    case 'outline':
    case 'secondary':
      return 'secondary';
    case 'destructive':
      return 'destructive';
    case 'text':
      return 'text';
    default:
      return 'ghost';
  }
};

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
  rightIcon,
}: ButtonProps) {
  const kind = normalise(variant);
  const inactive = disabled || loading;
  const dims = SIZES[size];
  const pressed = useSharedValue(0);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const faceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * DEPTH },
      { translateY: pressed.value * DEPTH },
    ],
  }));

  const {
    flex,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    alignSelf,
    width,
    ...innerStyle
  } = StyleSheet.flatten(style) || {};

  const outer: ViewStyle = {
    flex,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    alignSelf: fullWidth ? 'stretch' : alignSelf,
    width: fullWidth ? '100%' : width,
    opacity: inactive ? 0.45 : 1,
  };

  const handlePress = () => {
    if (inactive) return;
    tap();
    onPress?.();
  };

  const springIn = () => {
    pressed.value = withSpring(1, { damping: 20, stiffness: 600 });
  };
  const springOut = () => {
    pressed.value = withSpring(0, { damping: 14, stiffness: 400 });
  };

  // ---- text / ghost: no 3D body --------------------------------------
  if (kind === 'text' || kind === 'ghost') {
    const color = (textStyle?.color as string) || theme.foreground;
    return (
      <Pressable
        onPress={handlePress}
        disabled={inactive}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed: p }) => [
          outer,
          styles.flatRow,
          { height: dims.height, paddingHorizontal: kind === 'ghost' ? dims.paddingHorizontal : 0 },
          innerStyle as ViewStyle,
          p && { opacity: 0.6 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <>
            {leftIcon ? <View style={title ? styles.leftIcon : undefined}>{leftIcon}</View> : null}
            {title ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { fontSize: dims.fontSize, color },
                  kind === 'text' && styles.underline,
                  textStyle,
                ]}
              >
                {title}
                {kind === 'text' && !rightIcon ? '  →' : ''}
              </Text>
            ) : null}
            {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
          </>
        )}
      </Pressable>
    );
  }

  // ---- NeoPOP 3D button ----------------------------------------------
  const pop = POP[kind];
  const textColor = (textStyle?.color as string) || pop.text;
  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w !== box.w || h !== box.h) setBox({ w, h });
  };
  const { w, h } = box;

  return (
    <View style={[outer, { paddingRight: DEPTH, paddingBottom: DEPTH }]}>
      {w > 0 && (
        <Svg
          style={StyleSheet.absoluteFill}
          width={w + DEPTH}
          height={h + DEPTH}
          pointerEvents="none"
        >
          {/* right edge */}
          <Polygon
            points={`${w},0 ${w + DEPTH},${DEPTH} ${w + DEPTH},${h + DEPTH} ${w},${h}`}
            fill={pop.right}
          />
          {/* bottom edge */}
          <Polygon
            points={`0,${h} ${w},${h} ${w + DEPTH},${h + DEPTH} ${DEPTH},${h + DEPTH}`}
            fill={pop.bottom}
          />
        </Svg>
      )}
      <Pressable
        onPress={handlePress}
        onPressIn={springIn}
        onPressOut={springOut}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        onLayout={onLayout}
      >
        <Animated.View
          style={[
            styles.face,
            {
              height: dims.height,
              paddingHorizontal: dims.paddingHorizontal,
              backgroundColor: pop.face,
            },
            pop.border ? { borderWidth: 1, borderColor: pop.border } : null,
            innerStyle as ViewStyle,
            faceStyle,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={textColor} />
          ) : (
            <>
              {leftIcon ? <View style={title ? styles.leftIcon : undefined}>{leftIcon}</View> : null}
              {title ? (
                <Text
                  numberOfLines={1}
                  style={[styles.label, { fontSize: dims.fontSize, color: textColor }, textStyle]}
                >
                  {title}
                </Text>
              ) : null}
              {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
            </>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderRadius: 0,
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.sans,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  underline: {
    textDecorationLine: 'underline',
    letterSpacing: 1,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
