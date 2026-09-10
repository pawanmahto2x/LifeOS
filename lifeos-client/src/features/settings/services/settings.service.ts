import apiClient from '@/lib/axios';
import { IApiResponse, IUser } from '@/types/auth.types';
import {
  IChangePasswordPayload,
  IProfileUpdatePayload,
  IUserDataExport,
} from '@/types/settings.types';

export const settingsApiService = {
  async getProfile(): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get<IApiResponse<IUser>>('/users/me');
    return response.data;
  },

  async updateProfile(data: IProfileUpdatePayload): Promise<IApiResponse<IUser>> {
    const response = await apiClient.patch<IApiResponse<IUser>>('/users/me', data);
    return response.data;
  },

  async changePassword(data: IChangePasswordPayload): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>('/users/change-password', data);
    return response.data;
  },

  async exportUserData(): Promise<IApiResponse<IUserDataExport>> {
    const response = await apiClient.get<IApiResponse<IUserDataExport>>('/users/export');
    return response.data;
  },

  async deleteAccount(): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>('/users/me');
    return response.data;
  },
};
