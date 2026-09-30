import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IUsageLog, IUsageSummary, IBudget, IUrgeLog } from '@/types/digital-wellbeing.types';

export const digitalWellbeingService = {
  async logUsage(data: Omit<IUsageLog, 'id' | 'createdAt'>): Promise<IApiResponse<IUsageLog>> {
    const response = await apiClient.post<IApiResponse<IUsageLog>>(
      '/api/v1/digital-wellbeing/usage',
      data,
    );
    return response.data;
  },

  async getUsageSummary(): Promise<IApiResponse<IUsageSummary>> {
    const response = await apiClient.get<IApiResponse<IUsageSummary>>(
      '/api/v1/digital-wellbeing/usage/summary',
    );
    return response.data;
  },

  async setBudget(data: Omit<IBudget, 'id'>): Promise<IApiResponse<IBudget>> {
    const response = await apiClient.post<IApiResponse<IBudget>>(
      '/api/v1/digital-wellbeing/budget',
      data,
    );
    return response.data;
  },

  async logUrgeIntervention(
    data: Omit<IUrgeLog, 'id' | 'createdAt'>,
  ): Promise<IApiResponse<IUrgeLog>> {
    const response = await apiClient.post<IApiResponse<IUrgeLog>>(
      '/api/v1/digital-wellbeing/urge',
      data,
    );
    return response.data;
  },
};
