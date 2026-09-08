import apiClient from '../../../lib/axios';
import { IApiResponse } from '../../../types/auth.types';
import {
  FocusSession,
  FocusSessionsListResponse,
  StartFocusSessionPayload,
  EndFocusSessionPayload,
} from '../../../types/focus.types';

export const focusApiService = {
  async getSessions(params?: {
    taskId?: string;
    completed?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<IApiResponse<FocusSessionsListResponse>> {
    const response = await apiClient.get<IApiResponse<FocusSessionsListResponse>>('/focus', {
      params,
    });
    return response.data;
  },

  async getCurrentSession(): Promise<IApiResponse<FocusSession | null>> {
    const response = await apiClient.get<IApiResponse<FocusSession | null>>('/focus/current');
    return response.data;
  },

  async startSession(payload: StartFocusSessionPayload): Promise<IApiResponse<FocusSession>> {
    const response = await apiClient.post<IApiResponse<FocusSession>>('/focus/start', payload);
    return response.data;
  },

  async endSession(payload: EndFocusSessionPayload): Promise<IApiResponse<FocusSession>> {
    const response = await apiClient.post<IApiResponse<FocusSession>>('/focus/end', payload);
    return response.data;
  },

  async deleteSession(sessionId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/focus/${sessionId}`);
    return response.data;
  },
};
