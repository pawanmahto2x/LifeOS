import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import {
  IAISettings,
  ISaveAISettingsDto,
  IUpdateAISettingsDto,
  IWeeklyAIReport,
  IAICoachResponse,
  IAIHealthAnalysis,
} from '@/types/ai.types';

export const aiApiService = {
  async getSettings(): Promise<IApiResponse<IAISettings>> {
    const response = await apiClient.get<IApiResponse<IAISettings>>('/ai/settings');
    return response.data;
  },

  async saveSettings(data: ISaveAISettingsDto): Promise<IApiResponse<IAISettings>> {
    const response = await apiClient.post<IApiResponse<IAISettings>>('/ai/settings', data);
    return response.data;
  },

  async updateSettings(data: IUpdateAISettingsDto): Promise<IApiResponse<IAISettings>> {
    const response = await apiClient.patch<IApiResponse<IAISettings>>('/ai/settings', data);
    return response.data;
  },

  async deleteSettings(): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>('/ai/settings');
    return response.data;
  },

  async generateWeeklyReport(): Promise<IApiResponse<IWeeklyAIReport>> {
    const response = await apiClient.post<IApiResponse<IWeeklyAIReport>>('/ai/reports/weekly');
    return response.data;
  },

  async askCoach(question: string): Promise<IApiResponse<IAICoachResponse>> {
    const response = await apiClient.post<IApiResponse<IAICoachResponse>>('/ai/coach', {
      question,
    });
    return response.data;
  },

  async getHealthAnalysis(): Promise<IApiResponse<IAIHealthAnalysis>> {
    const response = await apiClient.post<IApiResponse<IAIHealthAnalysis>>('/ai/health-analysis');
    return response.data;
  },
};
