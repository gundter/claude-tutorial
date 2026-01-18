<script setup lang="ts">
import { ref } from 'vue';
import { useTeamStore } from '@/stores/teamStore';
import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from '@/types';

const teamStore = useTeamStore();

const showModal = ref(false);
const editingMember = ref<TeamMember | null>(null);

// Form state
const formName = ref('');
const formEmail = ref('');
const formAvatar = ref('#3B82F6');

const loading = ref(false);
const error = ref<string | null>(null);

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

function openAddModal() {
  editingMember.value = null;
  formName.value = '';
  formEmail.value = '';
  formAvatar.value = '#3B82F6';
  showModal.value = true;
}

function openEditModal(member: TeamMember) {
  editingMember.value = member;
  formName.value = member.name;
  formEmail.value = member.email || '';
  formAvatar.value = member.avatar;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingMember.value = null;
  error.value = null;
}

async function handleSubmit() {
  if (!formName.value.trim()) {
    error.value = 'Name is required';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    if (editingMember.value) {
      const data: UpdateTeamMemberInput = {
        name: formName.value.trim(),
        email: formEmail.value.trim() || null,
        avatar: formAvatar.value,
      };
      await teamStore.update(editingMember.value.id, data);
    } else {
      const data: CreateTeamMemberInput = {
        name: formName.value.trim(),
        email: formEmail.value.trim() || undefined,
        avatar: formAvatar.value,
      };
      await teamStore.create(data);
    }
    closeModal();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save team member';
  } finally {
    loading.value = false;
  }
}

async function handleDelete(member: TeamMember) {
  if (!confirm(`Are you sure you want to delete ${member.name}?`)) {
    return;
  }

  try {
    await teamStore.remove(member.id);
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete team member');
  }
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}
</script>

<template>
  <div class="team-page">
    <div class="page-header">
      <h2>Team Members</h2>
      <button class="btn btn-primary" @click="openAddModal">
        + Add Member
      </button>
    </div>

    <div v-if="teamStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="teamStore.teamMembers.length === 0" class="empty-state">
      <div class="empty-state__icon">👥</div>
      <p>No team members yet</p>
      <button class="btn btn-primary" @click="openAddModal">
        Add your first team member
      </button>
    </div>

    <div v-else class="team-grid">
      <div
        v-for="member in teamStore.sortedByName"
        :key="member.id"
        class="team-card"
      >
        <div class="team-card__avatar" :style="{ backgroundColor: member.avatar }">
          {{ getInitials(member.name) }}
        </div>
        <div class="team-card__info">
          <h3>{{ member.name }}</h3>
          <p v-if="member.email">{{ member.email }}</p>
        </div>
        <div class="team-card__actions">
          <button class="btn btn-secondary" @click="openEditModal(member)">
            Edit
          </button>
          <button class="btn btn-danger" @click="handleDelete(member)">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingMember ? 'Edit Team Member' : 'Add Team Member' }}</h3>
          <button class="btn-icon" @click="closeModal">&times;</button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="form-label" for="name">Name *</label>
            <input
              id="name"
              v-model="formName"
              type="text"
              class="form-input"
              placeholder="Enter name"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              v-model="formEmail"
              type="email"
              class="form-input"
              placeholder="Enter email (optional)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Avatar Color</label>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                class="color-option"
                :class="{ 'color-option--selected': formAvatar === color }"
                :style="{ backgroundColor: color }"
                @click="formAvatar = color"
              ></button>
            </div>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
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
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.page-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.team-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.team-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.team-card__info {
  flex: 1;
  min-width: 0;
}

.team-card__info h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.team-card__info p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-card__actions {
  display: flex;
  gap: var(--spacing-xs);
}

.error-message {
  padding: var(--spacing-sm);
  background-color: var(--color-overdue);
  border: 1px solid var(--color-overdue-border);
  border-radius: var(--radius-md);
  color: #991b1b;
  margin-bottom: var(--spacing-md);
}
</style>
