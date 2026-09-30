import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { ILifeReplay, IUserReflection, ReplayPeriod } from '@/types/life-replay.types';

export const lifeReplayApiService = {
  async getReplay(period: ReplayPeriod, date?: string): Promise<IApiResponse<ILifeReplay>> {
    const query = date ? `?date=${date}` : '';
    const response = await apiClient.get<IApiResponse<ILifeReplay>>(
      `/life-replay/${period}${query}`,
    );
    return response.data;
  },

  async saveReflection(
    id: string,
    reflectionData: Partial<IUserReflection>,
  ): Promise<IApiResponse<ILifeReplay>> {
    const response = await apiClient.post<IApiResponse<ILifeReplay>>(
      `/life-replay/${id}/reflection`,
      reflectionData,
    );
    return response.data;
  },

  async getHistory(period: ReplayPeriod, limit: number = 5): Promise<IApiResponse<ILifeReplay[]>> {
    const response = await apiClient.get<IApiResponse<ILifeReplay[]>>(
      `/life-replay/history/${period}?limit=${limit}`,
    );
    return response.data;
  },
};
