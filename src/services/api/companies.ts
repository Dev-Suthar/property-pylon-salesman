/**
 * Companies API Service
 */

import {apiClient} from './client';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  propertiesCount?: number;
  customersCount?: number;
  usersCount?: number;
}

export interface InitialUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  password: string; // Plain password for sharing
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  salesman_id?: string; // Optional: will be validated against authenticated user
  initial_user: {
    name: string;
    email: string;
    phone?: string;
    password: string; // Required password
  };
}

export interface CreateCompanyResponse {
  company: Company & {
    created_by?: string; // Salesman ID who created the company
  };
  initial_user: InitialUser;
  salesman_id: string; // Salesman ID who created the company
}

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  user_id?: string; // Optional: will be validated against logged-in user
}

export interface GetCompaniesResponse {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  salesman_id?: string; // The salesman ID used for filtering
}

class CompaniesServiceImpl {
  async create(data: CreateCompanyRequest): Promise<CreateCompanyResponse | null> {
    try {
      const response = await apiClient.post<CreateCompanyResponse>(
        '/companies',
        data,
        true, // Requires auth
      );

      if (response.error) {
        // Create an error object that preserves the error structure
        const error: any = new Error(response.error.message);
        error.error = response.error;
        error.response = {
          data: {
            error: response.error,
          },
        };
        throw error;
      }

      return response.data || null;
    } catch (error: any) {
      console.error('Create company error:', error);
      // Re-throw to preserve error structure for proper handling in the component
      throw error;
    }
  }

  async getAll(params?: GetCompaniesParams): Promise<GetCompaniesResponse | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }
      if (params?.status) queryParams.append('status', params.status);
      // Optional: pass user_id to explicitly identify which salesman's companies to fetch
      // Backend will validate it matches the logged-in user from JWT token
      if (params?.user_id) queryParams.append('user_id', params.user_id);

      const queryString = queryParams.toString();
      // Use /companies endpoint for salesmen (returns only companies created by the logged-in salesman)
      // Endpoint: GET /api/v1/companies?page=1&limit=20&search=...&status=...
      const endpoint = `/companies${queryString ? `?${queryString}` : ''}`;

      if (__DEV__) {
        console.log('[Companies API] Fetching companies:', endpoint);
      }

      const response = await apiClient.get<GetCompaniesResponse>(endpoint, true);

      if (response.error) {
        const error: any = new Error(response.error.message);
        error.error = response.error;
        error.code = response.error.code;
        throw error;
      }

      if (!response.data) {
        if (__DEV__) {
          console.warn('[Companies API] No data in response');
        }
        return null;
      }

      return response.data;
    } catch (error: any) {
      console.error('[Companies API] Get companies error:', error);
      // Re-throw to preserve error structure for proper handling in the component
      throw error;
    }
  }
}

export const companiesApi = new CompaniesServiceImpl();

