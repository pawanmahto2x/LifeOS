import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import {
  IChallenge,
  IChallengeListItem,
  IChallengeDetails,
  ICreateChallengeDto,
} from '@/types/challenge.types';

export const challengeApiService = {
  async getChallenges(params?: {
    category?: string;
    difficulty?: string;
    status?: 'active' | 'upcoming' | 'ended' | 'all';
  }): Promise<IApiResponse<IChallengeListItem[]>> {
    const response = await apiClient.get<IApiResponse<IChallengeListItem[]>>('/challenges', {
      params,
    });
    return response.data;
  },

  async getChallengeDetails(challengeId: string): Promise<IApiResponse<IChallengeDetails>> {
    const response = await apiClient.get<IApiResponse<IChallengeDetails>>(
      `/challenges/${challengeId}`,
    );
    return response.data;
  },

  async createChallenge(data: ICreateChallengeDto): Promise<IApiResponse<IChallenge>> {
    const response = await apiClient.post<IApiResponse<IChallenge>>('/challenges', data);
    return response.data;
  },

  async deleteChallenge(challengeId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/challenges/${challengeId}`);
    return response.data;
  },

  async joinChallenge(challengeId: string): Promise<IApiResponse<unknown>> {
    const response = await apiClient.post<IApiResponse<unknown>>(`/challenges/${challengeId}/join`);
    return response.data;
  },

  async leaveChallenge(challengeId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>(`/challenges/${challengeId}/leave`);
    return response.data;
  },

  async updateProgress(challengeId: string, progress: number): Promise<IApiResponse<unknown>> {
    const response = await apiClient.patch<IApiResponse<unknown>>(
      `/challenges/${challengeId}/progress`,
      { progress },
    );
    return response.data;
  },
};
