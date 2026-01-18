<script setup lang="ts">
import { computed } from 'vue';
import { useChoreStore } from '@/stores/choreStore';
import { useTeamStore } from '@/stores/teamStore';
import type { ChoreStatus } from '@/types';

const choreStore = useChoreStore();
const teamStore = useTeamStore();

const selectedAssignee = computed({
  get: () => choreStore.filters.assigneeId,
  set: (value) => choreStore.setFilters({ assigneeId: value }),
});

const selectedStatuses = computed({
  get: () => choreStore.filters.status || [],
  set: (value) => choreStore.setFilters({ status: value.length > 0 ? value : null }),
});

const hasFilters = computed(() => {
  return choreStore.filters.assigneeId !== null ||
         (choreStore.filters.status && choreStore.filters.status.length > 0);
});

const statusOptions: { value: ChoreStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

function toggleStatus(status: ChoreStatus) {
  const current = selectedStatuses.value;
  if (current.includes(status)) {
    selectedStatuses.value = current.filter(s => s !== status);
  } else {
    selectedStatuses.value = [...current, status];
  }
}

function clearFilters() {
  choreStore.clearFilters();
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-group">
      <label class="filter-label">Assignee:</label>
      <select v-model="selectedAssignee" class="form-select filter-select">
        <option :value="null">All Members</option>
        <option
          v-for="member in teamStore.sortedByName"
          :key="member.id"
          :value="member.id"
        >
          {{ member.name }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Status:</label>
      <div class="status-toggles">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          :class="['status-toggle', { 'status-toggle--active': selectedStatuses.includes(option.value) }]"
          @click="toggleStatus(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <button
      v-if="hasFilters"
      class="btn btn-secondary clear-btn"
      @click="clearFilters"
    >
      Clear Filters
    </button>
  </div>
</template>

<style scoped>
.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.filter-select {
  width: auto;
  min-width: 150px;
}

.status-toggles {
  display: flex;
  gap: var(--spacing-xs);
}

.status-toggle {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.status-toggle:hover {
  border-color: var(--color-primary);
}

.status-toggle--active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.clear-btn {
  margin-left: auto;
}
</style>
