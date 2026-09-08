import apiClient from '../../../lib/axios';
import { IApiResponse } from '../../../types/auth.types';
import {
  ITask,
  ICreateTaskPayload,
  IUpdateTaskPayload,
  ITasksListResponse,
} from '../../../types/task.types';

export const taskApiService = {
  async getTasks(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IApiResponse<ITasksListResponse>> {
    const response = await apiClient.get<IApiResponse<ITasksListResponse>>('/tasks', {
      params,
    });
    return response.data;
  },

  async getTaskById(taskId: string): Promise<IApiResponse<ITask>> {
    const response = await apiClient.get<IApiResponse<ITask>>(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(payload: ICreateTaskPayload): Promise<IApiResponse<ITask>> {
    const response = await apiClient.post<IApiResponse<ITask>>('/tasks', payload);
    return response.data;
  },

  async updateTask(taskId: string, payload: IUpdateTaskPayload): Promise<IApiResponse<ITask>> {
    const response = await apiClient.patch<IApiResponse<ITask>>(`/tasks/${taskId}`, payload);
    return response.data;
  },

  async completeTask(taskId: string): Promise<IApiResponse<ITask>> {
    const response = await apiClient.patch<IApiResponse<ITask>>(`/tasks/${taskId}/complete`);
    return response.data;
  },

  async deleteTask(taskId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/tasks/${taskId}`);
    return response.data;
  },
};
