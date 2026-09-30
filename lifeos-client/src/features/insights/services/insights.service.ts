import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import {
  BaselinePeriod,
  IPersonalBaseline,
  IBehaviourInsight,
  ITrendItem,
  IAttentionArea,
  IFullInsightsResponse,
} from '@/types/insights.types';

export const insightsApiService = {
  async getFullInsights(): Promise<IApiResponse<IFullInsightsResponse>> {
    const response = await apiClient.get<IApiResponse<IFullInsightsResponse>>('/insights');
    return response.data;
  },

  async getBaseline(period: BaselinePeriod): Promise<IApiResponse<IPersonalBaseline>> {
    const response = await apiClient.get<IApiResponse<IPersonalBaseline>>(
      `/insights/baseline?period=${period}`,
    );
    return response.data;
  },

  async refreshBaseline(period: BaselinePeriod): Promise<IApiResponse<IPersonalBaseline>> {
    const response = await apiClient.post<IApiResponse<IPersonalBaseline>>(
      `/insights/baseline?period=${period}`,
    );
    return response.data;
  },

  async getPatterns(): Promise<IApiResponse<IBehaviourInsight[]>> {
    const response = await apiClient.get<IApiResponse<IBehaviourInsight[]>>('/insights/patterns');
    return response.data;
  },

  async getTrends(): Promise<IApiResponse<ITrendItem[]>> {
    const response = await apiClient.get<IApiResponse<ITrendItem[]>>('/insights/trends');
    return response.data;
  },

  async getAttentionAreas(): Promise<IApiResponse<IAttentionArea[]>> {
    const response = await apiClient.get<IApiResponse<IAttentionArea[]>>('/insights/attention');
    return response.data;
  },
};
