import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ViewStyle, useWindowDimensions } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { select } from "../../utils/haptics";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Wrap children in a scroll view (long lists / forms). */
  scrollable?: boolean;
  /** Fraction of screen height the sheet may grow to. */
  maxHeightRatio?: number;
  /** Rendered pinned under the content (e.g. Apply / Reset buttons). */
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Native-feeling bottom sheet (swipe to dismiss, backdrop, dynamic height).
 * Drop-in for the old `<Modal transparent animationType="slide">` pattern.
 */
export default function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  scrollable = false,
  maxHeightRatio = 0.88,
  footer,
  contentStyle,
  children,
}: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const presented = useRef(false);

  useEffect(() => {
    if (visible && !presented.current) {
      presented.current = true;
      select();
      ref.current?.present();
    } else if (!visible && presented.current) {
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    if (presented.current) {
      presented.current = false;
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.7}
        pressBehavior="close"
      />
    ),
    []
  );

  const Body = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={height * maxHeightRatio}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <Body
        style={scrollable ? undefined : styles.body}
        contentContainerStyle={scrollable ? [styles.body, contentStyle] : undefined}
        keyboardShouldPersistTaps="handled"
      >
        <View style={!scrollable ? contentStyle : undefined}>
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
        <View style={{ height: Math.max(insets.bottom, 16) }} />
      </Body>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#0D0D0D",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: theme.hairline,
  },
  handle: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 36,
    height: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
    gap: 12,
  },
});
