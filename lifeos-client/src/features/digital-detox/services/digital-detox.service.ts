import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import {
  IDigitalDetoxSettings,
  IDigitalDetoxUsageSummary,
  IOpportunityCostSummary,
  IUpdateDigitalDetoxSettingsPayload,
  ILogScreenTimePayload,
  IScreenTimeLog,
} from '@/types/digital-detox.types';

export const digitalDetoxApiService = {
  async getSettings(): Promise<IApiResponse<IDigitalDetoxSettings>> {
    const response =
      await apiClient.get<IApiResponse<IDigitalDetoxSettings>>('/digital-detox/settings');
    return response.data;
  },

  async updateSettings(
    payload: IUpdateDigitalDetoxSettingsPayload,
  ): Promise<IApiResponse<IDigitalDetoxSettings>> {
    const response = await apiClient.patch<IApiResponse<IDigitalDetoxSettings>>(
      '/digital-detox/settings',
      payload,
    );
    return response.data;
  },

  async getUsage(date?: string): Promise<IApiResponse<IDigitalDetoxUsageSummary>> {
    const response = await apiClient.get<IApiResponse<IDigitalDetoxUsageSummary>>(
      '/digital-detox/usage',
      {
        params: date ? { date } : undefined,
      },
    );
    return response.data;
  },

  async logScreenTime(payload: ILogScreenTimePayload): Promise<IApiResponse<IScreenTimeLog>> {
    const response = await apiClient.post<IApiResponse<IScreenTimeLog>>(
      '/digital-detox/usage',
      payload,
    );
    return response.data;
  },

  async getOpportunityCost(date?: string): Promise<IApiResponse<IOpportunityCostSummary>> {
    const response = await apiClient.get<IApiResponse<IOpportunityCostSummary>>(
      '/digital-detox/opportunity-cost',
      {
        params: date ? { date } : undefined,
      },
    );
    return response.data;
  },
};
