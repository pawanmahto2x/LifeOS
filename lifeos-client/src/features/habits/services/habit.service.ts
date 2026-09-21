import apiClient from '../../../lib/axios';
import { IApiResponse } from '../../../types/auth.types';
import {
  IHabit,
  ICreateHabitPayload,
  IUpdateHabitPayload,
  IHabitsListResponse,
} from '../../../types/habit.types';

export const habitApiService = {
  async getHabits(params?: {
    frequency?: string;
    isPaused?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IApiResponse<IHabitsListResponse>> {
    const response = await apiClient.get<IApiResponse<IHabitsListResponse>>('/habits', {
      params,
    });
    return response.data;
  },

  async getHabitById(habitId: string): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.get<IApiResponse<IHabit>>(`/habits/${habitId}`);
    return response.data;
  },

  async createHabit(payload: ICreateHabitPayload): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.post<IApiResponse<IHabit>>('/habits', payload);
    return response.data;
  },

  async updateHabit(habitId: string, payload: IUpdateHabitPayload): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.patch<IApiResponse<IHabit>>(`/habits/${habitId}`, payload);
    return response.data;
  },

  async completeHabit(habitId: string): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.post<IApiResponse<IHabit>>(`/habits/${habitId}/complete`);
    return response.data;
  },

  async skipHabit(habitId: string): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.post<IApiResponse<IHabit>>(`/habits/${habitId}/skip`);
    return response.data;
  },

  async undoHabit(habitId: string): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.post<IApiResponse<IHabit>>(`/habits/${habitId}/undo`);
    return response.data;
  },

  async pauseHabit(habitId: string): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.patch<IApiResponse<IHabit>>(`/habits/${habitId}/pause`);
    return response.data;
  },

  async resumeHabit(habitId: string): Promise<IApiResponse<IHabit>> {
    const response = await apiClient.patch<IApiResponse<IHabit>>(`/habits/${habitId}/resume`);
    return response.data;
  },

  async deleteHabit(habitId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/habits/${habitId}`);
    return response.data;
  },
};
