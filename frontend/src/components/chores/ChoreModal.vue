<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useChoreStore } from '@/stores/choreStore';
import { useTeamStore } from '@/stores/teamStore';
import type { Chore, CreateChoreInput, UpdateChoreInput, RecurrenceInput } from '@/types';
import RecurrenceSelector from './RecurrenceSelector.vue';

const props = defineProps<{
  chore?: Chore | null;
  initialDate?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const choreStore = useChoreStore();
const teamStore = useTeamStore();

const isEditing = computed(() => !!props.chore);
const modalTitle = computed(() => (isEditing.value ? 'Edit Chore' : 'Add Chore'));

// Form state
const title = ref('');
const description = ref('');
const assigneeId = ref<string | null>(null);
const dueDate = ref('');
const recurrence = ref<RecurrenceInput | null>(null);
const hasRecurrence = ref(false);

const loading = ref(false);
const error = ref<string | null>(null);

// Initialize form
onMounted(() => {
  if (props.chore) {
    title.value = props.chore.title;
    description.value = props.chore.description || '';
    assigneeId.value = props.chore.assigneeId;
    dueDate.value = props.chore.dueDate;
    if (props.chore.recurrence) {
      hasRecurrence.value = true;
      recurrence.value = {
        type: props.chore.recurrence.type,
        interval: props.chore.recurrence.interval,
        byWeekDay: props.chore.recurrence.byWeekDay,
        byMonthDay: props.chore.recurrence.byMonthDay,
        bySetPos: props.chore.recurrence.bySetPos,
        endType: props.chore.recurrence.endType,
        endDate: props.chore.recurrence.endDate,
        endAfterOccurrences: props.chore.recurrence.endAfterOccurrences,
      };
    }
  } else if (props.initialDate) {
    dueDate.value = props.initialDate;
  }
});

async function handleSubmit() {
  if (!title.value.trim() || !dueDate.value) {
    error.value = 'Please fill in required fields';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    if (isEditing.value && props.chore) {
      const data: UpdateChoreInput = {
        title: title.value.trim(),
        description: description.value.trim() || null,
        assigneeId: assigneeId.value,
        dueDate: dueDate.value,
        recurrence: hasRecurrence.value ? recurrence.value : null,
      };
      await choreStore.update(props.chore.id, data);
    } else {
      const data: CreateChoreInput = {
        title: title.value.trim(),
        description: description.value.trim() || null,
        assigneeId: assigneeId.value,
        dueDate: dueDate.value,
        recurrence: hasRecurrence.value ? recurrence.value : null,
      };
      await choreStore.create(data);
    }
    emit('saved');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save chore';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="btn-icon" @click="emit('close')">&times;</button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="form-group">
          <label class="form-label" for="title">Title *</label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="form-input"
            placeholder="Enter chore title"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="description">Description</label>
          <textarea
            id="description"
            v-model="description"
            class="form-textarea"
            placeholder="Enter description (optional)"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="dueDate">Due Date *</label>
          <input
            id="dueDate"
            v-model="dueDate"
            type="date"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="assignee">Assignee</label>
          <select id="assignee" v-model="assigneeId" class="form-select">
            <option :value="null">Unassigned</option>
            <option
              v-for="member in teamStore.sortedByName"
              :key="member.id"
              :value="member.id"
            >
              {{ member.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="hasRecurrence" type="checkbox" />
            <span>Make this a recurring chore</span>
          </label>
        </div>

        <RecurrenceSelector
          v-if="hasRecurrence"
          v-model="recurrence"
        />
      </form>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('close')">
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  padding: var(--spacing-sm);
  background-color: var(--color-overdue);
  border: 1px solid var(--color-overdue-border);
  border-radius: var(--radius-md);
  color: #991b1b;
  margin-bottom: var(--spacing-md);
}
</style>
