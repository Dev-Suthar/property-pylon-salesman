/**
 * API Configuration
 * Base URL and API settings
 */

import { Platform } from 'react-native';

const REMOTE_API_URL = 'https://api.dreamtobuy.com/api/v1';

/** Dev builds only: talk to the backend running on this machine (:3000). */
export const USE_LOCAL_API = true;

// Android emulator reaches the host machine via 10.0.2.2.
const LOCAL_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';

export const API_BASE_URL = __DEV__ && USE_LOCAL_API ? LOCAL_API_URL : REMOTE_API_URL;

if (__DEV__) {
  console.log(`📱 ${Platform.OS} - Using API URL:`, API_BASE_URL);
}

export const API_TIMEOUT = 30000; // 30 seconds

export const API_VERSION = 'v1';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
  COMPANY_ID: 'companyId',
  REFRESH_TOKEN: 'refreshToken',
} as const;

