/**
 * API Configuration
 * Base URL and API settings
 */

import { Platform } from 'react-native';

// Get the correct localhost URL based on platform
const getLocalhostUrl = () => {
  if (Platform.OS === 'android') {
    const url = 'http://98.92.75.163:3000/api/v1';
    if (__DEV__) {
      console.log('📱 Android detected - Using API URL:', url);
    }
    return url;
  }
  const url = 'http://98.92.75.163:3000/api/v1';
  if (__DEV__) {
    console.log('📱 iOS detected - Using API URL:', url);
  }
  return url;
};

export const API_BASE_URL = __DEV__
  ? getLocalhostUrl()
  : 'http://98.92.75.163:3000/api/v1';

export const API_TIMEOUT = 30000; // 30 seconds

export const API_VERSION = 'v1';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
  COMPANY_ID: 'companyId',
  REFRESH_TOKEN: 'refreshToken',
} as const;

