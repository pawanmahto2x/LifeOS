import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IBodyMetric, IActivityLog, IMindfulnessSession } from '@/types/health-expansion.types';

export const healthExpansionService = {
  async getActivityLogs(): Promise<IApiResponse<IActivityLog[]>> {
    const response = await apiClient.get<IApiResponse<IActivityLog[]>>(
      '/health/expansion/activity',
    );
    return response.data;
  },

  async logActivity(data: Partial<IActivityLog>): Promise<IApiResponse<IActivityLog>> {
    const response = await apiClient.post<IApiResponse<IActivityLog>>(
      '/health/expansion/activity',
      data,
    );
    return response.data;
  },

  async getBodyMetrics(): Promise<IApiResponse<IBodyMetric[]>> {
    const response = await apiClient.get<IApiResponse<IBodyMetric[]>>(
      '/health/expansion/body-metrics',
    );
    return response.data;
  },

  async logBodyMetrics(data: Partial<IBodyMetric>): Promise<IApiResponse<IBodyMetric>> {
    const response = await apiClient.post<IApiResponse<IBodyMetric>>(
      '/health/expansion/body-metrics',
      data,
    );
    return response.data;
  },

  async getMindfulnessSessions(): Promise<IApiResponse<IMindfulnessSession[]>> {
    const response = await apiClient.get<IApiResponse<IMindfulnessSession[]>>(
      '/health/expansion/mindfulness',
    );
    return response.data;
  },

  async logMindfulnessSession(
    data: Partial<IMindfulnessSession>,
  ): Promise<IApiResponse<IMindfulnessSession>> {
    const response = await apiClient.post<IApiResponse<IMindfulnessSession>>(
      '/health/expansion/mindfulness',
      data,
    );
    return response.data;
  },
};
