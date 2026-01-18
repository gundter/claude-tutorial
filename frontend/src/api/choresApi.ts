import api from './index';
import type { Chore, CreateChoreInput, UpdateChoreInput, ChoreStatus } from '@/types';

export interface ChoreQueryParams {
  assigneeId?: string;
  status?: string; // comma-separated
  startDate?: string;
  endDate?: string;
}

export const choresApi = {
  async getAll(params?: ChoreQueryParams): Promise<Chore[]> {
    const response = await api.get<{ chores: Chore[] }>('/chores', { params });
    return response.data.chores;
  },

  async getById(id: string): Promise<Chore> {
    const response = await api.get<{ chore: Chore }>(`/chores/${id}`);
    return response.data.chore;
  },

  async getForCalendar(
    year: number,
    month: number,
    params?: { assigneeId?: string; status?: string }
  ): Promise<Chore[]> {
    const response = await api.get<{ chores: Chore[] }>(
      `/chores/calendar/${year}/${month}`,
      { params }
    );
    return response.data.chores;
  },

  async create(data: CreateChoreInput): Promise<Chore> {
    const response = await api.post<{ chore: Chore }>('/chores', data);
    return response.data.chore;
  },

  async update(id: string, data: UpdateChoreInput): Promise<Chore> {
    const response = await api.put<{ chore: Chore }>(`/chores/${id}`, data);
    return response.data.chore;
  },

  async updateStatus(id: string, status: ChoreStatus): Promise<Chore> {
    const response = await api.patch<{ chore: Chore }>(`/chores/${id}/status`, { status });
    return response.data.chore;
  },

  async delete(id: string, deleteInstances: boolean = false): Promise<void> {
    await api.delete(`/chores/${id}`, {
      params: deleteInstances ? { deleteInstances: 'true' } : undefined,
    });
  },
};
