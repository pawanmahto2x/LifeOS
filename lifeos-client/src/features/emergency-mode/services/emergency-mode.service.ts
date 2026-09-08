import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IEmergencyModeStatus } from '@/types/emergency-mode.types';

export const emergencyModeApiService = {
  async getStatus(): Promise<IApiResponse<IEmergencyModeStatus>> {
    const response =
      await apiClient.get<IApiResponse<IEmergencyModeStatus>>('/emergency-mode/status');
    return response.data;
  },

  async enable(): Promise<IApiResponse<IEmergencyModeStatus>> {
    const response =
      await apiClient.post<IApiResponse<IEmergencyModeStatus>>('/emergency-mode/enable');
    return response.data;
  },

  async disable(): Promise<IApiResponse<IEmergencyModeStatus>> {
    const response =
      await apiClient.post<IApiResponse<IEmergencyModeStatus>>('/emergency-mode/disable');
    return response.data;
  },
};
