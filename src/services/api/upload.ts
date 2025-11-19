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

class UploadServiceImpl {
  /**
   * Upload single file
   */
  async uploadSingle(
    file: UploadFile,
    type: 'image' | 'video' | 'document',
    companyId?: string,
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
  ): Promise<BulkUploadResponse | null> {
    try {
      const uploaded: UploadResponse[] = [];
      const failed: Array<{file: string; error: string}> = [];

      for (const file of files) {
        try {
          const result = await this.uploadSingle(file, type, companyId);
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
}

export const uploadApi = new UploadServiceImpl();

