import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { teamApi } from '@/api/teamApi';
import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from '@/types';

export const useTeamStore = defineStore('team', () => {
  // State
  const teamMembers = ref<TeamMember[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getById = computed(() => {
    return (id: string) => teamMembers.value.find((m) => m.id === id);
  });

  const sortedByName = computed(() => {
    return [...teamMembers.value].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Actions
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      teamMembers.value = await teamApi.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch team members';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function create(data: CreateTeamMemberInput) {
    loading.value = true;
    error.value = null;
    try {
      const member = await teamApi.create(data);
      teamMembers.value.push(member);
      return member;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create team member';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, data: UpdateTeamMemberInput) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await teamApi.update(id, data);
      const index = teamMembers.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        teamMembers.value[index] = updated;
      }
      return updated;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update team member';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await teamApi.delete(id);
      teamMembers.value = teamMembers.value.filter((m) => m.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete team member';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    teamMembers,
    loading,
    error,
    // Getters
    getById,
    sortedByName,
    // Actions
    fetchAll,
    create,
    update,
    remove,
  };
});
