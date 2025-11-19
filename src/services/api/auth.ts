/**
 * Authentication Service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiClient} from './client';
import {STORAGE_KEYS} from './config';

export interface LoginCredentials {
  username: string;
  password: string;
  role?: string; // Optional role to filter login (e.g., 'salesman' for salesman app)
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company_id: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

class AuthServiceImpl {
  async login(credentials: LoginCredentials): Promise<LoginResponse | null> {
    try {
      // Normalize username to lowercase if it's an email to avoid case sensitivity issues
      const trimmedUsername = credentials.username.trim();
      const normalizedUsername = trimmedUsername.includes('@') 
        ? trimmedUsername.toLowerCase() 
        : trimmedUsername;

      // Ensure we're sending the correct format
      // Always include role='salesman' for salesman app to ensure only salesmen can login
      const loginPayload = {
        username: normalizedUsername,
        password: credentials.password,
        role: credentials.role || 'salesman', // Default to 'salesman' for this app
      };

      if (__DEV__) {
        console.log('[Auth Service] Login request:', {
          originalUsername: credentials.username,
          normalizedUsername: loginPayload.username,
          password: '***', // Don't log password
        });
      }

      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        loginPayload,
        false, // No auth required for login
      );

      if (response.error) {
        if (__DEV__) {
          console.error('[Auth Service] Login error:', response.error);
        }
        throw new Error(response.error.message);
      }

      if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(STORAGE_KEYS.COMPANY_ID, response.data.user.company_id);

        if (__DEV__) {
          console.log('[Auth Service] Login successful:', {
            userId: response.data.user.id,
            email: response.data.user.email,
            role: response.data.user.role,
          });
        }

        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('[Auth Service] Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.COMPANY_ID,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthServiceImpl();

