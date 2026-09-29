import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false,
};

const trigger = (type: HapticFeedbackTypes) => {
  try {
    ReactNativeHapticFeedback.trigger(type, options);
  } catch {
    // Haptics are best-effort; never break an interaction over them.
  }
};

/** Button presses, card taps. */
export const tap = () => trigger(HapticFeedbackTypes.impactLight);
/** Tab switches, chip / option selection. */
export const select = () => trigger(HapticFeedbackTypes.selection);
/** Successful save / submit. */
export const success = () => trigger(HapticFeedbackTypes.notificationSuccess);
/** Validation problems, destructive confirmations. */
export const warning = () => trigger(HapticFeedbackTypes.notificationWarning);

export const haptics = { tap, select, success, warning };
