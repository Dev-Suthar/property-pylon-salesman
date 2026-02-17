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
  team_members?: number;
  years_of_experience?: number;
  office_photo_url?: string;
  // Optional extended details (available via /companies/:id/details)
  users?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    age?: number;
    gender?: string;
    role: string;
    is_active: boolean;
  }>;
  documents?: Array<{
    id: string;
    url: string;
    thumbnail_url?: string;
    type: string;
    mime_type: string;
    size: number;
    document_type?: string;
    created_at: string;
  }>;
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
  address?: string;
  age?: number;
  gender?: string;
  role: string;
  password: string; // Plain password for sharing
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  team_members?: number;
  years_of_experience?: number;
  office_photo_url?: string;
  salesman_id?: string; // Optional: will be validated against authenticated user
  initial_user: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    age?: number;
    gender?: string;
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

export interface UpdateCompanyRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  team_members?: number;
  years_of_experience?: number;
  office_photo_url?: string;
  is_active?: boolean;
}

export interface UpdateCompanyResponse {
  company: Company;
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

  async update(companyId: string, data: UpdateCompanyRequest): Promise<UpdateCompanyResponse | null> {
    try {
      const response = await apiClient.put<UpdateCompanyResponse>(
        `/companies/${companyId}`,
        data,
        true, // Requires auth
      );

      if (response.error) {
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
      console.error('Update company error:', error);
      throw error;
    }
  }

  async updateCompanyUser(
    companyId: string,
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      age?: number;
      gender?: string;
      is_active?: boolean;
    },
  ): Promise<any | null> {
    try {
      const response = await apiClient.put<{ user: any }>(
        `/companies/${companyId}/users/${userId}`,
        data,
        true,
      );

      if (response.error) {
        const error: any = new Error(response.error.message);
        error.error = response.error;
        error.response = { data: { error: response.error } };
        throw error;
      }

      return response.data?.user || null;
    } catch (error: any) {
      console.error('Update company user error:', error);
      throw error;
    }
  }

  async getById(companyId: string): Promise<Company | null> {
    try {
      const response = await apiClient.get<{ company: Company }>(
        `/companies/${companyId}`,
        true, // Requires auth
      );

      if (response.error) {
        const error: any = new Error(response.error.message);
        error.error = response.error;
        error.code = response.error.code;
        throw error;
      }

      return response.data?.company || null;
    } catch (error: any) {
      console.error('Get company by ID error:', error);
      throw error;
    }
  }

  async getDetails(companyId: string): Promise<Company | null> {
    try {
      const response = await apiClient.get<{ company: Company }>(
        `/companies/${companyId}/details`,
        true,
      );

      if (response.error) {
        // If backend doesn't support the /details route (404 with NOT_FOUND), fall back to basic getById
        const isRouteNotFound = 
          response.error.code === 'NOT_FOUND' ||
          response.error.code === 'HTTP_404' ||
          (response.error.message?.includes('Route GET') && response.error.message?.includes('/details')) ||
          (response.error.message?.includes('not found') && response.error.message?.includes('/details'));

        if (isRouteNotFound) {
          if (__DEV__) {
            console.warn('[Companies API] /companies/:id/details not found, falling back to /companies/:id');
          }
          return this.getById(companyId);
        }

        const error: any = new Error(response.error.message);
        error.error = response.error;
        error.code = response.error.code;
        throw error;
      }

      return response.data?.company || null;
    } catch (error: any) {
      // If error indicates route missing, fall back gracefully
      const isRouteNotFound = 
        error?.error?.code === 'NOT_FOUND' ||
        error?.code === 'NOT_FOUND' ||
        error?.code === 'HTTP_404' ||
        (error?.message?.includes('Route GET') && error.message.includes('/details')) ||
        (error?.message?.includes('not found') && error.message.includes('/details'));

      if (isRouteNotFound) {
        if (__DEV__) {
          console.warn('[Companies API] /companies/:id/details route missing, using basic getById().');
        }
        return this.getById(companyId);
      }

      console.error('Get company details error:', error);
      throw error;
    }
  }
}

export const companiesApi = new CompaniesServiceImpl();

