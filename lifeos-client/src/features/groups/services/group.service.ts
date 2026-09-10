import apiClient from '@/lib/axios';
import { IApiResponse } from '@/types/auth.types';
import { IGroup, IGroupDetails, ICreateGroupDto, IUpdateGroupDto } from '@/types/group.types';

export const groupApiService = {
  async getUserGroups(): Promise<IApiResponse<IGroup[]>> {
    const response = await apiClient.get<IApiResponse<IGroup[]>>('/groups');
    return response.data;
  },

  async getGroupDetails(groupId: string): Promise<IApiResponse<IGroupDetails>> {
    const response = await apiClient.get<IApiResponse<IGroupDetails>>(`/groups/${groupId}`);
    return response.data;
  },

  async createGroup(data: ICreateGroupDto): Promise<IApiResponse<IGroup>> {
    const response = await apiClient.post<IApiResponse<IGroup>>('/groups', data);
    return response.data;
  },

  async updateGroup(groupId: string, data: IUpdateGroupDto): Promise<IApiResponse<IGroup>> {
    const response = await apiClient.patch<IApiResponse<IGroup>>(`/groups/${groupId}`, data);
    return response.data;
  },

  async deleteGroup(groupId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(`/groups/${groupId}`);
    return response.data;
  },

  async joinGroupByCode(inviteCode: string): Promise<IApiResponse<unknown>> {
    const response = await apiClient.post<IApiResponse<unknown>>('/groups/join', { inviteCode });
    return response.data;
  },

  async leaveGroup(groupId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>(`/groups/${groupId}/leave`);
    return response.data;
  },

  async removeMember(groupId: string, userId: string): Promise<IApiResponse<null>> {
    const response = await apiClient.delete<IApiResponse<null>>(
      `/groups/${groupId}/members/${userId}`,
    );
    return response.data;
  },

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: 'Admin' | 'Moderator' | 'Member',
  ): Promise<IApiResponse<unknown>> {
    const response = await apiClient.patch<IApiResponse<unknown>>(
      `/groups/${groupId}/members/${userId}`,
      { role },
    );
    return response.data;
  },

  async voteGoal(groupId: string, optionId: string): Promise<IApiResponse<unknown>> {
    const response = await apiClient.post<IApiResponse<unknown>>(`/groups/${groupId}/goals/vote`, {
      optionId,
    });
    return response.data;
  },
};
