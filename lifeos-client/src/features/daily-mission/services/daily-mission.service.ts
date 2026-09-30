import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IDailyMission, ISubmitReviewInput } from '@/types/daily-mission.types';

export const dailyMissionApiService = {
  async generateMission(): Promise<IApiResponse<IDailyMission>> {
    const response = await apiClient.post<IApiResponse<IDailyMission>>('/daily-mission/generate');
    return response.data;
  },
  async getTodayMission(): Promise<IApiResponse<IDailyMission>> {
    const response = await apiClient.get<IApiResponse<IDailyMission>>('/daily-mission/today');
    return response.data;
  },
  async submitReview(id: string, data: ISubmitReviewInput): Promise<IApiResponse<IDailyMission>> {
    const response = await apiClient.put<IApiResponse<IDailyMission>>(
      `/daily-mission/${id}/review`,
      data,
    );
    return response.data;
  },
  async getHistory(limit?: number): Promise<IApiResponse<IDailyMission[]>> {
    const response = await apiClient.get<IApiResponse<IDailyMission[]>>('/daily-mission/history', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },
};
