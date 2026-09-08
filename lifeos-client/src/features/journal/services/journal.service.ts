import apiClient from '../../../lib/axios';
import { IApiResponse } from '../../../types/auth.types';
import {
  IJournal,
  ICreateJournalPayload,
  IUpdateJournalPayload,
  IJournalsListResponse,
} from '../../../types/journal.types';

export const journalApiService = {
  async getJournals(params?: {
    mood?: string;
    tag?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IApiResponse<IJournalsListResponse>> {
    const response = await apiClient.get<IApiResponse<IJournalsListResponse>>('/journals', {
      params,
    });
    return response.data;
  },

  async searchJournals(
    q: string,
    page = 1,
    limit = 20,
  ): Promise<IApiResponse<IJournalsListResponse>> {
    const response = await apiClient.get<IApiResponse<IJournalsListResponse>>('/journals/search', {
      params: { q, page, limit },
    });
    return response.data;
  },

  async getJournalById(journalId: string): Promise<IApiResponse<IJournal>> {
    const response = await apiClient.get<IApiResponse<IJournal>>(`/journals/${journalId}`);
    return response.data;
  },

  async createJournal(payload: ICreateJournalPayload): Promise<IApiResponse<IJournal>> {
    const response = await apiClient.post<IApiResponse<IJournal>>('/journals', payload);
    return response.data;
  },

  async updateJournal(
    journalId: string,
    payload: IUpdateJournalPayload,
  ): Promise<IApiResponse<IJournal>> {
    const response = await apiClient.patch<IApiResponse<IJournal>>(
      `/journals/${journalId}`,
      payload,
    );
    return response.data;
  },

  async deleteJournal(journalId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/journals/${journalId}`);
    return response.data;
  },
};
