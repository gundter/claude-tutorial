<script setup lang="ts">
import { computed, ref } from 'vue';
import { format } from 'date-fns';
import { useChoreStore } from '@/stores/choreStore';
import { useTeamStore } from '@/stores/teamStore';
import type { Chore, ChoreStatus } from '@/types';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  chore: Chore;
}>();

const emit = defineEmits<{
  close: [];
  edit: [chore: Chore];
  deleted: [];
}>();

const choreStore = useChoreStore();
const teamStore = useTeamStore();

const loading = ref(false);
const showDeleteConfirm = ref(false);

const assignee = computed(() => {
  if (!props.chore.assigneeId) return null;
  return teamStore.getById(props.chore.assigneeId);
});

const formattedDueDate = computed(() => {
  return format(new Date(props.chore.dueDate), 'EEEE, MMMM d, yyyy');
});

const recurrenceText = computed(() => {
  if (!props.chore.recurrence) return null;
  const r = props.chore.recurrence;
  let text = `Every ${r.interval > 1 ? r.interval + ' ' : ''}`;

  switch (r.type) {
    case 'daily':
      text += r.interval === 1 ? 'day' : 'days';
      break;
    case 'weekly':
      text += r.interval === 1 ? 'week' : 'weeks';
      if (r.byWeekDay && r.byWeekDay.length > 0) {
        const dayNames: Record<string, string> = {
          MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday',
          TH: 'Thursday', FR: 'Friday', SA: 'Saturday', SU: 'Sunday'
        };
        const days = r.byWeekDay.map(d => dayNames[d]).join(', ');
        text += ` on ${days}`;
      }
      break;
    case 'monthly':
      text += r.interval === 1 ? 'month' : 'months';
      if (r.byMonthDay && r.byMonthDay.length > 0) {
        text += ` on day ${r.byMonthDay[0]}`;
      } else if (r.bySetPos && r.byWeekDay) {
        const posNames: Record<number, string> = {
          1: '1st', 2: '2nd', 3: '3rd', 4: '4th', '-1': 'last'
        };
        const dayNames: Record<string, string> = {
          MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday',
          TH: 'Thursday', FR: 'Friday', SA: 'Saturday', SU: 'Sunday'
        };
        text += ` on the ${posNames[r.bySetPos]} ${dayNames[r.byWeekDay[0]]}`;
      }
      break;
  }

  return text;
});

async function updateStatus(status: ChoreStatus) {
  loading.value = true;
  try {
    await choreStore.updateStatus(props.chore.id, status);
  } finally {
    loading.value = false;
  }
}

async function handleDelete() {
  loading.value = true;
  try {
    const deleteInstances = props.chore.recurrence !== null && !props.chore.isRecurrenceInstance;
    await choreStore.remove(props.chore.id, deleteInstances);
    emit('deleted');
  } finally {
    loading.value = false;
    showDeleteConfirm.value = false;
  }
}

const statusOptions: { value: ChoreStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];
</script>

<template>
  <div class="detail-panel">
    <div class="detail-panel__header">
      <h3>Chore Details</h3>
      <button class="btn-icon" @click="emit('close')">&times;</button>
    </div>

    <div class="detail-panel__body">
      <div class="detail-section">
        <h4>{{ chore.title }}</h4>
        <StatusBadge :status="chore.status" />
      </div>

      <div v-if="chore.description" class="detail-section">
        <label>Description</label>
        <p>{{ chore.description }}</p>
      </div>

      <div class="detail-section">
        <label>Due Date</label>
        <p>{{ formattedDueDate }}</p>
      </div>

      <div class="detail-section">
        <label>Assigned To</label>
        <p v-if="assignee" class="assignee">
          <span class="avatar" :style="{ backgroundColor: assignee.avatar }">
            {{ assignee.name.charAt(0) }}
          </span>
          {{ assignee.name }}
        </p>
        <p v-else class="text-muted">Unassigned</p>
      </div>

      <div v-if="recurrenceText" class="detail-section">
        <label>Recurrence</label>
        <p>{{ recurrenceText }}</p>
      </div>

      <div class="detail-section">
        <label>Update Status</label>
        <div class="status-buttons">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            :class="['btn', 'btn-secondary', { 'btn-active': chore.status === option.value }]"
            :disabled="loading || chore.status === option.value"
            @click="updateStatus(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="detail-panel__footer">
      <button class="btn btn-secondary" @click="emit('edit', chore)">
        Edit
      </button>
      <button
        v-if="!showDeleteConfirm"
        class="btn btn-danger"
        @click="showDeleteConfirm = true"
      >
        Delete
      </button>
      <template v-else>
        <span class="delete-confirm-text">Are you sure?</span>
        <button class="btn btn-danger" :disabled="loading" @click="handleDelete">
          {{ loading ? 'Deleting...' : 'Yes, Delete' }}
        </button>
        <button class="btn btn-secondary" @click="showDeleteConfirm = false">
          Cancel
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.detail-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.detail-panel__header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.detail-panel__body {
  padding: var(--spacing-md);
}

.detail-section {
  margin-bottom: var(--spacing-lg);
}

.detail-section h4 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}

.detail-section label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.detail-section p {
  margin: 0;
}

.assignee {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.btn-active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.detail-panel__footer {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.delete-confirm-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  align-self: center;
}
</style>
