import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IJournalAnalysis, IRecurringThemesResponse } from '@/types/journal-analysis.types';

export const journalAnalysisApiService = {
  async analyzeEntry(journalId: string): Promise<IApiResponse<IJournalAnalysis>> {
    const response = await apiClient.post<IApiResponse<IJournalAnalysis>>(
      `/journal-analysis/${journalId}/analyze`,
    );
    return response.data;
  },
  async getAnalysis(journalId: string): Promise<IApiResponse<IJournalAnalysis>> {
    const response = await apiClient.get<IApiResponse<IJournalAnalysis>>(
      `/journal-analysis/${journalId}/analysis`,
    );
    return response.data;
  },
  async getRecurringThemes(): Promise<IApiResponse<IRecurringThemesResponse>> {
    const response = await apiClient.get<IApiResponse<IRecurringThemesResponse>>(
      '/journal-analysis/themes',
    );
    return response.data;
  },
};
