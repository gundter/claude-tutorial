import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { remindersApi } from '@/api/remindersApi';
import type { Chore } from '@/types';

export const useReminderStore = defineStore('reminders', () => {
  // State
  const upcoming = ref<Chore[]>([]);
  const overdue = ref<Chore[]>([]);
  const lastChecked = ref<Date | null>(null);
  const notifiedChoreIds = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const totalReminders = computed(() => upcoming.value.length + overdue.value.length);
  const hasOverdue = computed(() => overdue.value.length > 0);
  const hasUpcoming = computed(() => upcoming.value.length > 0);

  // Actions
  async function checkReminders(): Promise<Chore[]> {
    loading.value = true;
    error.value = null;
    try {
      const previousIds = new Set([
        ...upcoming.value.map((c) => c.id),
        ...overdue.value.map((c) => c.id),
      ]);

      const result = await remindersApi.check();
      upcoming.value = result.upcoming;
      overdue.value = result.overdue;
      lastChecked.value = new Date();

      // Find new reminders that weren't in the previous check
      const newReminders = [
        ...result.upcoming.filter((c) => !previousIds.has(c.id)),
        ...result.overdue.filter((c) => !previousIds.has(c.id)),
      ];

      return newReminders;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check reminders';
      return [];
    } finally {
      loading.value = false;
    }
  }

  function markNotified(choreId: string) {
    notifiedChoreIds.value.add(choreId);
  }

  function clearNotified() {
    notifiedChoreIds.value.clear();
  }

  function isNotified(choreId: string): boolean {
    return notifiedChoreIds.value.has(choreId);
  }

  return {
    // State
    upcoming,
    overdue,
    lastChecked,
    loading,
    error,
    // Getters
    totalReminders,
    hasOverdue,
    hasUpcoming,
    // Actions
    checkReminders,
    markNotified,
    clearNotified,
    isNotified,
  };
});
