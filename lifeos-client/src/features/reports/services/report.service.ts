import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IReport, IDashboardSummary, ReportType } from '@/types/report.types';

export const reportApiService = {
  async getDashboard(): Promise<IApiResponse<IDashboardSummary>> {
    const response = await apiClient.get<IApiResponse<IDashboardSummary>>('/reports/dashboard');
    return response.data;
  },

  async getReport(type: ReportType, date?: string): Promise<IApiResponse<IReport | null>> {
    const response = await apiClient.get<IApiResponse<IReport | null>>(`/reports/${type}`, {
      params: date ? { date } : undefined,
    });
    return response.data;
  },
};
