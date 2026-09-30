import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IGoal, IAIGoalPlan, IGoalReport } from '@/types/goal.types';

export const goalService = {
  async getAll(): Promise<IApiResponse<IGoal[]>> {
    const response = await apiClient.get<IApiResponse<IGoal[]>>('/goals');
    return response.data;
  },

  async getById(id: string): Promise<IApiResponse<IGoal>> {
    const response = await apiClient.get<IApiResponse<IGoal>>(`/goals/${id}`);
    return response.data;
  },

  async create(data: Partial<IGoal>): Promise<IApiResponse<IGoal>> {
    const response = await apiClient.post<IApiResponse<IGoal>>('/goals', data);
    return response.data;
  },

  async update(id: string, data: Partial<IGoal>): Promise<IApiResponse<IGoal>> {
    const response = await apiClient.put<IApiResponse<IGoal>>(`/goals/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/goals/${id}`);
    return response.data;
  },

  async generateAIPlan(id: string): Promise<IApiResponse<IAIGoalPlan>> {
    const response = await apiClient.post<IApiResponse<IAIGoalPlan>>(`/goals/${id}/ai-plan`);
    return response.data;
  },

  async applyAIPlan(id: string, plan: Partial<IAIGoalPlan>): Promise<IApiResponse<IGoal>> {
    const response = await apiClient.post<IApiResponse<IGoal>>(`/goals/${id}/apply-plan`, plan);
    return response.data;
  },

  async getReport(id: string): Promise<IApiResponse<IGoalReport>> {
    const response = await apiClient.get<IApiResponse<IGoalReport>>(`/goals/${id}/report`);
    return response.data;
  },
};
