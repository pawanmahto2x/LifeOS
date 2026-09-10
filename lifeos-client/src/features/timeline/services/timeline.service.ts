import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { ITimelineEntry, ITimelineQueryParams, ITimelineResponse } from '@/types/timeline.types';

export const timelineApiService = {
  async getTimeline(params?: ITimelineQueryParams): Promise<IApiResponse<ITimelineResponse>> {
    const response = await apiClient.get<IApiResponse<ITimelineResponse>>('/life-timeline', {
      params,
    });
    return response.data;
  },

  async getTimelineEntry(entryId: string): Promise<IApiResponse<ITimelineEntry>> {
    const response = await apiClient.get<IApiResponse<ITimelineEntry>>(`/life-timeline/${entryId}`);
    return response.data;
  },
};
