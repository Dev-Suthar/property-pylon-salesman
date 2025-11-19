/**
 * Network Logger Floating Button
 * Shows a floating button in development mode to open network logger modal
 * Draggable floating button
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text, Dimensions, Animated } from 'react-native';
import { PanGestureHandler, TapGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const BUTTON_MARGIN = 20;

// Network Logger - Only in development
let NetworkLogger: any = null;
let startNetworkLogging: (() => void) | null = null;
let networkLoggerLoaded = false;

if (__DEV__) {
  try {
    const networkLoggerModule = require('react-native-network-logger');
    NetworkLogger = networkLoggerModule.NetworkLogger || networkLoggerModule.default;
    startNetworkLogging = networkLoggerModule.startNetworkLogging;
    // Start network logging to intercept requests
    if (startNetworkLogging) {
      startNetworkLogging();
    }
    networkLoggerLoaded = true;
    console.log('Network Logger loaded successfully');
  } catch (e) {
    // Network logger not available
    console.warn('Network logger not available:', e);
    networkLoggerLoaded = false;
  }
} else {
  console.log('Network Logger: Not in development mode (__DEV__ is false)');
}

export default function NetworkLoggerButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Initial position (bottom right, accounting for safe area)
  const initialX = SCREEN_WIDTH - BUTTON_SIZE - BUTTON_MARGIN;
  const initialY = SCREEN_HEIGHT - BUTTON_SIZE - 100 - BUTTON_MARGIN;
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: initialX, y: initialY });
  const hasMoved = useRef(false);
  const tapRef = useRef(null);
  const panRef = useRef(null);

  // Debug: Log component render state
  useEffect(() => {
    console.log('NetworkLoggerButton: Component mounted');
    console.log('__DEV__:', __DEV__);
    console.log('NetworkLogger available:', !!NetworkLogger);
    console.log('networkLoggerLoaded:', networkLoggerLoaded);
  }, []);

  // Don't render in production
  if (!__DEV__) {
    console.log('NetworkLoggerButton: Not rendering - not in dev mode');
    return null;
  }
  
  // Show button even if NetworkLogger isn't loaded yet (for debugging)
  // The modal will show an error if NetworkLogger is null
  if (!NetworkLogger) {
    console.warn('NetworkLoggerButton: NetworkLogger component not available. Module loaded:', networkLoggerLoaded);
    // Still show the button for debugging - user will see error in modal
  }

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.BEGAN) {
      // Gesture started (BEGAN -> ACTIVE)
      translateX.setValue(0);
      translateY.setValue(0);
      hasMoved.current = false;
    } else if (event.nativeEvent.oldState === State.ACTIVE) {
      // Gesture ended (ACTIVE -> END)
      const translationX = event.nativeEvent.translationX;
      const translationY = event.nativeEvent.translationY;
      
      // Check if it was a significant movement (drag) or just a tap
      const movementDistance = Math.sqrt(translationX * translationX + translationY * translationY);
      hasMoved.current = movementDistance > 10;

      if (hasMoved.current) {
        // It was a drag - update position
        lastOffset.current.x += translationX;
        lastOffset.current.y += translationY;

        // Constrain to screen bounds
        const maxX = SCREEN_WIDTH - BUTTON_SIZE - BUTTON_MARGIN;
        const maxY = SCREEN_HEIGHT - BUTTON_SIZE - BUTTON_MARGIN;
        const minX = BUTTON_MARGIN;
        const minY = BUTTON_MARGIN;

        const constrainedX = Math.max(minX, Math.min(maxX, lastOffset.current.x));
        const constrainedY = Math.max(minY, Math.min(maxY, lastOffset.current.y));

        lastOffset.current.x = constrainedX;
        lastOffset.current.y = constrainedY;

        // Animate to constrained position
        Animated.spring(translateX, {
          toValue: constrainedX - initialX,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();

        Animated.spring(translateY, {
          toValue: constrainedY - initialY,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else {
        // It was a tap - open modal
        setIsModalVisible(true);
        // Reset position
        translateX.setValue(0);
        translateY.setValue(0);
      }
    }
  };

  const onTapHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Fallback: if tap handler fires and pan didn't move, open modal
      if (!hasMoved.current) {
        setIsModalVisible(true);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    // Reset gesture state when modal closes
    hasMoved.current = false;
  };

  return (
    <>
      {/* Draggable Floating Button - Only show when modal is closed */}
      {!isModalVisible && (
        <View style={styles.buttonWrapper} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.gestureWrapper,
              {
                left: initialX - 20,
                top: initialY - 20,
                transform: [
                  { translateX },
                  { translateY },
                ],
              },
            ]}
          >
            <GestureHandlerRootView style={{ width: '100%', height: '100%' }}>
              <PanGestureHandler
                ref={panRef}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onPanHandlerStateChange}
                activeOffsetX={[-15, 15]}
                activeOffsetY={[-15, 15]}
                failOffsetX={[-50, 50]}
                failOffsetY={[-50, 50]}
                minPointers={1}
                maxPointers={1}
              >
                <Animated.View style={styles.floatingButton}>
                  <TapGestureHandler
                    ref={tapRef}
                    onHandlerStateChange={onTapHandlerStateChange}
                    maxDurationMs={300}
                    numberOfTaps={1}
                  >
                    <View style={styles.buttonContent}>
                      <Icon name="network" size={24} color={theme.primaryForeground} />
                    </View>
                  </TapGestureHandler>
                </Animated.View>
              </PanGestureHandler>
            </GestureHandlerRootView>
          </Animated.View>
        </View>
      )}

      {/* Modal with Network Logger */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
        transparent={false}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Network Logger</Text>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color={theme.foreground} />
            </TouchableOpacity>
          </View>

          {/* Network Logger Component */}
          <View style={styles.loggerContainer}>
            {NetworkLogger ? (
              <NetworkLogger />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: theme.foreground, textAlign: 'center' }}>
                  Network Logger module not loaded.{'\n'}
                  Please check console for errors.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  gestureWrapper: {
    position: 'absolute',
    width: BUTTON_SIZE + 40,
    height: BUTTON_SIZE + 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  closeButton: {
    padding: 4,
  },
  loggerContainer: {
    flex: 1,
  },
});

