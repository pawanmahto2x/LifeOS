import apiClient from '../../../lib/axios';
import { IApiResponse } from '../../../types/auth.types';
import {
  HealthSummary,
  WaterLog,
  WaterLogsResponse,
  WaterUnit,
  SleepLog,
  SleepLogsResponse,
  SleepQuality,
  MoodLog,
  MoodLogsResponse,
  MoodType,
} from '../../../types/health.types';

export const healthApiService = {
  // Summary
  async getSummary(): Promise<IApiResponse<HealthSummary>> {
    const response = await apiClient.get<IApiResponse<HealthSummary>>('/health/summary');
    return response.data;
  },

  // Water
  async getWaterLogs(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<IApiResponse<WaterLogsResponse>> {
    const response = await apiClient.get<IApiResponse<WaterLogsResponse>>('/health/water', {
      params,
    });
    return response.data;
  },

  async logWater(payload: {
    amount: number;
    unit?: WaterUnit;
    loggedAt?: string;
  }): Promise<IApiResponse<WaterLog>> {
    const response = await apiClient.post<IApiResponse<WaterLog>>('/health/water', payload);
    return response.data;
  },

  async updateWaterLog(
    id: string,
    payload: { amount?: number; unit?: WaterUnit; loggedAt?: string },
  ): Promise<IApiResponse<WaterLog>> {
    const response = await apiClient.patch<IApiResponse<WaterLog>>(`/health/water/${id}`, payload);
    return response.data;
  },

  async deleteWaterLog(id: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/health/water/${id}`);
    return response.data;
  },

  // Sleep
  async getSleepLogs(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<IApiResponse<SleepLogsResponse>> {
    const response = await apiClient.get<IApiResponse<SleepLogsResponse>>('/health/sleep', {
      params,
    });
    return response.data;
  },

  async logSleep(payload: {
    sleepTime: string;
    wakeTime: string;
    quality: SleepQuality;
    notes?: string;
  }): Promise<IApiResponse<SleepLog>> {
    const response = await apiClient.post<IApiResponse<SleepLog>>('/health/sleep', payload);
    return response.data;
  },

  async updateSleepLog(
    id: string,
    payload: {
      sleepTime?: string;
      wakeTime?: string;
      quality?: SleepQuality;
      notes?: string;
    },
  ): Promise<IApiResponse<SleepLog>> {
    const response = await apiClient.patch<IApiResponse<SleepLog>>(`/health/sleep/${id}`, payload);
    return response.data;
  },

  async deleteSleepLog(id: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/health/sleep/${id}`);
    return response.data;
  },

  // Mood
  async getMoodLogs(params?: {
    startDate?: string;
    endDate?: string;
    mood?: MoodType;
    page?: number;
    limit?: number;
  }): Promise<IApiResponse<MoodLogsResponse>> {
    const response = await apiClient.get<IApiResponse<MoodLogsResponse>>('/health/mood', {
      params,
    });
    return response.data;
  },

  async logMood(payload: {
    mood: MoodType;
    moodScore: number;
    note?: string;
    loggedAt?: string;
  }): Promise<IApiResponse<MoodLog>> {
    const response = await apiClient.post<IApiResponse<MoodLog>>('/health/mood', payload);
    return response.data;
  },

  async updateMoodLog(
    id: string,
    payload: {
      mood?: MoodType;
      moodScore?: number;
      note?: string;
      loggedAt?: string;
    },
  ): Promise<IApiResponse<MoodLog>> {
    const response = await apiClient.patch<IApiResponse<MoodLog>>(`/health/mood/${id}`, payload);
    return response.data;
  },

  async deleteMoodLog(id: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/health/mood/${id}`);
    return response.data;
  },
};
