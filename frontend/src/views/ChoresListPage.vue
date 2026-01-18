<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';
import { useChoreStore } from '@/stores/choreStore';
import { useTeamStore } from '@/stores/teamStore';
import type { Chore } from '@/types';
import FilterBar from '@/components/filters/FilterBar.vue';
import ChoreModal from '@/components/chores/ChoreModal.vue';
import ChoreDetailPanel from '@/components/chores/ChoreDetailPanel.vue';
import StatusBadge from '@/components/chores/StatusBadge.vue';

const choreStore = useChoreStore();
const teamStore = useTeamStore();

const showModal = ref(false);
const editingChore = ref<Chore | null>(null);
const showDetailPanel = ref(false);
const selectedChore = ref<Chore | null>(null);

const sortedChores = computed(() => {
  return [...choreStore.filteredChores].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
});

function isOverdue(chore: Chore): boolean {
  if (chore.status === 'completed') return false;
  return isBefore(startOfDay(parseISO(chore.dueDate)), startOfDay(new Date()));
}

function getAssigneeName(assigneeId: string | null): string {
  if (!assigneeId) return 'Unassigned';
  const member = teamStore.getById(assigneeId);
  return member?.name || 'Unknown';
}

function getAssigneeAvatar(assigneeId: string | null): { color: string; initial: string } | null {
  if (!assigneeId) return null;
  const member = teamStore.getById(assigneeId);
  if (!member) return null;
  return {
    color: member.avatar,
    initial: member.name.charAt(0).toUpperCase(),
  };
}

function formatDueDate(date: string): string {
  return format(parseISO(date), 'MMM d, yyyy');
}

function handleAddChore() {
  editingChore.value = null;
  showModal.value = true;
}

function handleChoreClick(chore: Chore) {
  selectedChore.value = chore;
  showDetailPanel.value = true;
}

function handleEditChore(chore: Chore) {
  editingChore.value = chore;
  showModal.value = true;
  showDetailPanel.value = false;
}

function closeModal() {
  showModal.value = false;
  editingChore.value = null;
}

function closeDetailPanel() {
  showDetailPanel.value = false;
  selectedChore.value = null;
}

async function handleChoreSaved() {
  closeModal();
  await loadChores();
}

async function handleChoreDeleted() {
  closeDetailPanel();
  await loadChores();
}

async function loadChores() {
  await choreStore.fetchAll();
}

onMounted(loadChores);
</script>

<template>
  <div class="chores-page">
    <div class="page-header">
      <h2>All Chores</h2>
      <button class="btn btn-primary" @click="handleAddChore">
        + Add Chore
      </button>
    </div>

    <FilterBar />

    <div v-if="choreStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="sortedChores.length === 0" class="empty-state">
      <div class="empty-state__icon">📋</div>
      <p>No chores found</p>
      <button class="btn btn-primary" @click="handleAddChore">
        Add your first chore
      </button>
    </div>

    <div v-else class="chores-list">
      <div
        v-for="chore in sortedChores"
        :key="chore.id"
        class="chore-item"
        :class="{ 'chore-item--overdue': isOverdue(chore) }"
        @click="handleChoreClick(chore)"
      >
        <div class="chore-item__main">
          <h3 :class="{ 'completed': chore.status === 'completed' }">
            {{ chore.title }}
          </h3>
          <p v-if="chore.description" class="chore-item__description">
            {{ chore.description }}
          </p>
        </div>

        <div class="chore-item__meta">
          <div class="chore-item__date" :class="{ 'overdue': isOverdue(chore) }">
            {{ formatDueDate(chore.dueDate) }}
          </div>

          <StatusBadge :status="chore.status" />

          <div class="chore-item__assignee">
            <template v-if="getAssigneeAvatar(chore.assigneeId)">
              <span
                class="avatar avatar--sm"
                :style="{ backgroundColor: getAssigneeAvatar(chore.assigneeId)!.color }"
              >
                {{ getAssigneeAvatar(chore.assigneeId)!.initial }}
              </span>
            </template>
            <span class="assignee-name">{{ getAssigneeName(chore.assigneeId) }}</span>
          </div>

          <div v-if="chore.recurrence" class="chore-item__recurring" title="Recurring">
            🔄
          </div>
        </div>
      </div>
    </div>

    <!-- Chore Modal -->
    <ChoreModal
      v-if="showModal"
      :chore="editingChore"
      @close="closeModal"
      @saved="handleChoreSaved"
    />

    <!-- Detail Panel -->
    <ChoreDetailPanel
      v-if="showDetailPanel && selectedChore"
      :chore="selectedChore"
      @close="closeDetailPanel"
      @edit="handleEditChore"
      @deleted="handleChoreDeleted"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.page-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
}

.chores-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.chore-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.chore-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.chore-item--overdue {
  border-left: 4px solid var(--color-overdue-border);
  background-color: var(--color-overdue);
}

.chore-item__main {
  flex: 1;
  min-width: 0;
}

.chore-item__main h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.chore-item__main h3.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.chore-item__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chore-item__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.chore-item__date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.chore-item__date.overdue {
  color: var(--color-overdue-border);
  font-weight: 600;
}

.chore-item__assignee {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.avatar--sm {
  width: 24px;
  height: 24px;
  font-size: var(--font-size-xs);
}

.assignee-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.chore-item__recurring {
  font-size: var(--font-size-sm);
}
</style>
