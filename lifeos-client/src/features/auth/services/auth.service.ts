import apiClient from '../../../lib/axios';
import { IApiResponse, ILoginResponse, IUser } from '../../../types/auth.types';

export interface IRegisterPayload {
  fullName: string;
  email: string;
  password?: string;
}

export interface ILoginPayload {
  email: string;
  password?: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword?: string;
}

export const authApiService = {
  async register(payload: IRegisterPayload): Promise<IApiResponse<IUser>> {
    const response = await apiClient.post<IApiResponse<IUser>>('/auth/register', payload);
    return response.data;
  },

  async login(payload: ILoginPayload): Promise<IApiResponse<ILoginResponse>> {
    const response = await apiClient.post<IApiResponse<ILoginResponse>>('/auth/login', payload);
    return response.data;
  },

  async logout(): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>('/auth/logout');
    return response.data;
  },

  async forgotPassword(payload: IForgotPasswordPayload): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>('/auth/forgot-password', payload);
    return response.data;
  },

  async resetPassword(payload: IResetPasswordPayload): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>('/auth/reset-password', payload);
    return response.data;
  },

  async getMe(): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get<IApiResponse<IUser>>('/users/me');
    return response.data;
  },

  async updateProfile(payload: Partial<IUser>): Promise<IApiResponse<IUser>> {
    const response = await apiClient.patch<IApiResponse<IUser>>('/users/me', payload);
    return response.data;
  },
};
