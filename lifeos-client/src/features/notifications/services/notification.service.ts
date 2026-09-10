import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import {
  INotification,
  INotificationPreferences,
  IUpdateNotificationPreferencesDto,
} from '@/types/notification.types';

export const notificationApiService = {
  async getNotifications(): Promise<IApiResponse<INotification[]>> {
    const response = await apiClient.get<IApiResponse<INotification[]>>('/notifications');
    return response.data;
  },

  async getUnreadCount(): Promise<IApiResponse<{ count: number }>> {
    const response = await apiClient.get<IApiResponse<{ count: number }>>(
      '/notifications/unread-count',
    );
    return response.data;
  },

  async markAsRead(id: string): Promise<IApiResponse<INotification>> {
    const response = await apiClient.patch<IApiResponse<INotification>>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  async markAllAsRead(): Promise<IApiResponse<{ markedCount: number }>> {
    const response =
      await apiClient.patch<IApiResponse<{ markedCount: number }>>('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id: string): Promise<IApiResponse<INotification>> {
    const response = await apiClient.delete<IApiResponse<INotification>>(`/notifications/${id}`);
    return response.data;
  },

  async getPreferences(): Promise<IApiResponse<INotificationPreferences>> {
    const response = await apiClient.get<IApiResponse<INotificationPreferences>>(
      '/notifications/preferences',
    );
    return response.data;
  },

  async updatePreferences(
    data: IUpdateNotificationPreferencesDto,
  ): Promise<IApiResponse<INotificationPreferences>> {
    const response = await apiClient.patch<IApiResponse<INotificationPreferences>>(
      '/notifications/preferences',
      data,
    );
    return response.data;
  },
};
