import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { choresApi } from '@/api/choresApi';
import type { Chore, CreateChoreInput, UpdateChoreInput, ChoreStatus, ChoreFilters } from '@/types';

export const useChoreStore = defineStore('chores', () => {
  // State
  const chores = ref<Chore[]>([]);
  const currentChore = ref<Chore | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<ChoreFilters>({
    assigneeId: null,
    status: null,
  });

  // Getters
  const getById = computed(() => {
    return (id: string) => chores.value.find((c) => c.id === id);
  });

  const filteredChores = computed(() => {
    let result = [...chores.value];

    if (filters.value.assigneeId) {
      result = result.filter((c) => c.assigneeId === filters.value.assigneeId);
    }

    if (filters.value.status && filters.value.status.length > 0) {
      result = result.filter((c) => filters.value.status!.includes(c.status));
    }

    return result;
  });

  const choresByDate = computed(() => {
    const grouped: Record<string, Chore[]> = {};
    for (const chore of filteredChores.value) {
      if (!grouped[chore.dueDate]) {
        grouped[chore.dueDate] = [];
      }
      grouped[chore.dueDate].push(chore);
    }
    return grouped;
  });

  const pendingChores = computed(() => chores.value.filter((c) => c.status === 'pending'));
  const inProgressChores = computed(() => chores.value.filter((c) => c.status === 'in_progress'));
  const completedChores = computed(() => chores.value.filter((c) => c.status === 'completed'));

  // Actions
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      chores.value = await choresApi.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch chores';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchForCalendar(year: number, month: number) {
    loading.value = true;
    error.value = null;
    try {
      const params: { assigneeId?: string; status?: string } = {};
      if (filters.value.assigneeId) {
        params.assigneeId = filters.value.assigneeId;
      }
      if (filters.value.status && filters.value.status.length > 0) {
        params.status = filters.value.status.join(',');
      }
      chores.value = await choresApi.getForCalendar(year, month, params);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch calendar chores';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentChore.value = await choresApi.getById(id);
      return currentChore.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch chore';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function create(data: CreateChoreInput) {
    loading.value = true;
    error.value = null;
    try {
      const chore = await choresApi.create(data);
      chores.value.push(chore);
      return chore;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create chore';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, data: UpdateChoreInput) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await choresApi.update(id, data);
      const index = chores.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        chores.value[index] = updated;
      }
      if (currentChore.value?.id === id) {
        currentChore.value = updated;
      }
      return updated;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update chore';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateStatus(id: string, status: ChoreStatus) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await choresApi.updateStatus(id, status);
      // The API might return a new chore (for virtual instances), so handle both cases
      const index = chores.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        chores.value[index] = updated;
      } else {
        // This was a virtual instance that got persisted
        chores.value.push(updated);
      }
      return updated;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update status';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string, deleteInstances: boolean = false) {
    loading.value = true;
    error.value = null;
    try {
      await choresApi.delete(id, deleteInstances);
      chores.value = chores.value.filter((c) => {
        if (c.id === id) return false;
        if (deleteInstances && c.parentChoreId === id) return false;
        return true;
      });
      if (currentChore.value?.id === id) {
        currentChore.value = null;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete chore';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function setFilters(newFilters: Partial<ChoreFilters>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters() {
    filters.value = { assigneeId: null, status: null };
  }

  function setCurrentChore(chore: Chore | null) {
    currentChore.value = chore;
  }

  return {
    // State
    chores,
    currentChore,
    loading,
    error,
    filters,
    // Getters
    getById,
    filteredChores,
    choresByDate,
    pendingChores,
    inProgressChores,
    completedChores,
    // Actions
    fetchAll,
    fetchForCalendar,
    fetchById,
    create,
    update,
    updateStatus,
    remove,
    setFilters,
    clearFilters,
    setCurrentChore,
  };
});
