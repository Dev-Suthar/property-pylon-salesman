/**
 * Toast utility
 */

import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string) => {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      position: 'top',
    });
  },
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      position: 'top',
    });
  },
  info: (message: string) => {
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      position: 'top',
    });
  },
  warning: (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Warning',
      text2: message,
      position: 'top',
    });
  },
};

