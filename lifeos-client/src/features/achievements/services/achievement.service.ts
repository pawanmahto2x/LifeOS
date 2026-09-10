import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IAchievementsSummary } from '@/types/achievement.types';

export const achievementApiService = {
  async getAchievements(): Promise<IApiResponse<IAchievementsSummary>> {
    const response = await apiClient.get<IApiResponse<IAchievementsSummary>>('/achievements');
    return response.data;
  },
};
