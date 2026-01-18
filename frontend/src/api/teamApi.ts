import api from './index';
import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from '@/types';

export const teamApi = {
  async getAll(): Promise<TeamMember[]> {
    const response = await api.get<{ teamMembers: TeamMember[] }>('/team-members');
    return response.data.teamMembers;
  },

  async getById(id: string): Promise<TeamMember> {
    const response = await api.get<{ teamMember: TeamMember }>(`/team-members/${id}`);
    return response.data.teamMember;
  },

  async create(data: CreateTeamMemberInput): Promise<TeamMember> {
    const response = await api.post<{ teamMember: TeamMember }>('/team-members', data);
    return response.data.teamMember;
  },

  async update(id: string, data: UpdateTeamMemberInput): Promise<TeamMember> {
    const response = await api.put<{ teamMember: TeamMember }>(`/team-members/${id}`, data);
    return response.data.teamMember;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/team-members/${id}`);
  },
};
