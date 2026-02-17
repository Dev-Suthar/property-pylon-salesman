/**
 * Upload API Service
 */

import {API_BASE_URL} from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UploadResponse {
  id: string;
  url: string;
  type: string;
  size: number;
  thumbnail_url?: string;
}

export interface BulkUploadResponse {
  uploaded: UploadResponse[];
  failed: Array<{file: string; error: string}>;
}

export interface UploadFile {
  uri: string;
  type?: string;
  fileName?: string;
  name?: string;
}

export type UploadExtraFields = Record<string, string | number | boolean | null | undefined>;

class UploadServiceImpl {
  /**
   * Upload single file
   */
  async uploadSingle(
    file: UploadFile,
    type: 'image' | 'video' | 'document',
    companyId?: string,
    extraFields?: UploadExtraFields,
  ): Promise<UploadResponse | null> {
    try {
      const endpoint = companyId 
        ? `/companies/${companyId}/upload`
        : `/admin/upload`; // For salesman, we might need a special endpoint

      const formData = new FormData();
      
      // Add file
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.fileName || file.name || 'file',
      } as any);

      // Add type
      formData.append('type', type);

      // Add extra fields (e.g., document_type)
      if (extraFields) {
        Object.entries(extraFields).forEach(([key, value]) => {
          if (value === undefined) return;
          formData.append(key, value === null ? '' : String(value));
        });
      }

      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let fetch set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data || null;
    } catch (error: any) {
      console.error('Upload single file error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files (bulk)
   */
  async uploadBulk(
    files: UploadFile[],
    type: 'image' | 'video' | 'document',
    companyId?: string,
    extraFields?: UploadExtraFields,
  ): Promise<BulkUploadResponse | null> {
    try {
      const uploaded: UploadResponse[] = [];
      const failed: Array<{file: string; error: string}> = [];

      for (const file of files) {
        try {
          const result = await this.uploadSingle(file, type, companyId, extraFields);
          if (result) {
            uploaded.push(result);
          }
        } catch (error: any) {
          failed.push({
            file: file.fileName || file.name || file.uri,
            error: error.message || 'Upload failed',
          });
        }
      }

      return {
        uploaded,
        failed,
      };
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async deleteCompanyFile(companyId: string, fileId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error?.message || 'Delete failed');
      }
      return true;
    } catch (error) {
      console.error('Delete company file error:', error);
      throw error;
    }
  }

  /**
   * Update metadata for an already uploaded company file (e.g. document_type)
   */
  async updateCompanyFile(
    companyId: string,
    fileId: string,
    fields: UploadExtraFields,
  ): Promise<any | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/upload/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error?.message || 'Update file failed');
      }
      return data || null;
    } catch (error) {
      console.error('Update company file error:', error);
      throw error;
    }
  }
}

export const uploadApi = new UploadServiceImpl();

