import api from './index';
import type { Chore } from '@/types';

export interface ReminderCheckResponse {
  upcoming: Chore[];
  overdue: Chore[];
}

export const remindersApi = {
  async check(): Promise<ReminderCheckResponse> {
    const response = await api.get<ReminderCheckResponse>('/reminders/check');
    return response.data;
  },

  async getUpcoming(hours: number = 24): Promise<Chore[]> {
    const response = await api.get<{ chores: Chore[] }>('/reminders/upcoming', {
      params: { hours },
    });
    return response.data.chores;
  },

  async getOverdue(): Promise<Chore[]> {
    const response = await api.get<{ chores: Chore[] }>('/reminders/overdue');
    return response.data.chores;
  },
};
