/**
 * API Client
 * Centralized HTTP client with interceptors
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, API_TIMEOUT, STORAGE_KEYS} from './config';

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (requiresAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      if (__DEV__) {
        console.log(`[API Client] ${options.method || 'GET'} ${url}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          return {
            error: {
              code: 'PARSE_ERROR',
              message: 'Failed to parse response as JSON',
            },
          };
        }
      } else {
        data = { message: text || 'No content' };
      }

      if (!response.ok) {
        return {
          error: data.error || {
            code: `HTTP_${response.status}`,
            message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      return {data};
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          error: {
            code: 'TIMEOUT',
            message: 'Request timeout. Please try again.',
          },
        };
      }

      if (error.message === 'Network request failed' || error.message?.includes('Network')) {
        return {
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection.',
          },
        };
      }

      return {
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
        },
      };
    }
  }

  async get<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {method: 'GET'}, requiresAuth);
  }

  async post<T>(
    endpoint: string,
    body?: any,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      requiresAuth,
    );
  }

  async put<T>(
    endpoint: string,
    body?: any,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      requiresAuth,
    );
  }

  async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {method: 'DELETE'}, requiresAuth);
  }
}

export const apiClient = new ApiClient();

