<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useReminderStore } from '@/stores/reminderStore';
import type { Chore } from '@/types';

const reminderStore = useReminderStore();

const showDropdown = ref(false);
const toastQueue = ref<{ id: string; chore: Chore; type: 'upcoming' | 'overdue' }[]>([]);

let pollingInterval: ReturnType<typeof setInterval> | null = null;

const totalCount = computed(() => reminderStore.totalReminders);
const hasOverdue = computed(() => reminderStore.hasOverdue);

async function checkAndNotify() {
  const newReminders = await reminderStore.checkReminders();

  // Show toasts for new reminders
  for (const chore of newReminders) {
    if (!reminderStore.isNotified(chore.id)) {
      const type = reminderStore.overdue.some(c => c.id === chore.id) ? 'overdue' : 'upcoming';
      const toast = {
        id: `${chore.id}-${Date.now()}`,
        chore,
        type: type as 'upcoming' | 'overdue',
      };
      toastQueue.value.push(toast);
      reminderStore.markNotified(chore.id);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissToast(toast.id);
      }, 5000);
    }
  }
}

function dismissToast(toastId: string) {
  const index = toastQueue.value.findIndex(t => t.id === toastId);
  if (index > -1) {
    toastQueue.value.splice(index, 1);
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  } else {
    checkAndNotify();
    pollingInterval = setInterval(checkAndNotify, 60000);
  }
}

onMounted(() => {
  checkAndNotify();
  pollingInterval = setInterval(checkAndNotify, 60000);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="reminder-bell">
    <button
      class="bell-button"
      :class="{ 'bell-button--has-reminders': totalCount > 0, 'bell-button--has-overdue': hasOverdue }"
      @click="showDropdown = !showDropdown"
    >
      <span class="bell-icon">🔔</span>
      <span v-if="totalCount > 0" class="badge">{{ totalCount }}</span>
    </button>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="reminder-dropdown" @click.stop>
      <div class="reminder-dropdown__header">
        <h4>Reminders</h4>
        <button class="btn-icon" @click="showDropdown = false">&times;</button>
      </div>
      <div class="reminder-dropdown__body">
        <div v-if="reminderStore.overdue.length > 0" class="reminder-section">
          <h5>Overdue</h5>
          <div
            v-for="chore in reminderStore.overdue"
            :key="chore.id"
            class="reminder-item reminder-item--overdue"
          >
            <span class="reminder-item__title">{{ chore.title }}</span>
            <span class="reminder-item__date">{{ chore.dueDate }}</span>
          </div>
        </div>

        <div v-if="reminderStore.upcoming.length > 0" class="reminder-section">
          <h5>Upcoming</h5>
          <div
            v-for="chore in reminderStore.upcoming"
            :key="chore.id"
            class="reminder-item reminder-item--upcoming"
          >
            <span class="reminder-item__title">{{ chore.title }}</span>
            <span class="reminder-item__date">{{ chore.dueDate }}</span>
          </div>
        </div>

        <div v-if="totalCount === 0" class="empty-state">
          <p>No reminders</p>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toastQueue"
            :key="toast.id"
            :class="['toast', `toast--${toast.type}`]"
          >
            <div class="toast__icon">
              {{ toast.type === 'overdue' ? '⚠️' : '⏰' }}
            </div>
            <div class="toast__content">
              <strong>{{ toast.type === 'overdue' ? 'Overdue!' : 'Upcoming' }}</strong>
              <p>{{ toast.chore.title }}</p>
              <small>Due: {{ toast.chore.dueDate }}</small>
            </div>
            <button class="toast__close" @click="dismissToast(toast.id)">&times;</button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.reminder-bell {
  position: relative;
}

.bell-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  position: relative;
  transition: background-color 0.2s;
}

.bell-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.bell-icon {
  font-size: 1.25rem;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.bell-button--has-overdue .badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.reminder-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: var(--spacing-sm);
}

.reminder-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.reminder-dropdown__header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.reminder-dropdown__body {
  max-height: 400px;
  overflow-y: auto;
}

.reminder-section {
  padding: var(--spacing-sm) var(--spacing-md);
}

.reminder-section h5 {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-sm);
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xs);
}

.reminder-item--overdue {
  background-color: var(--color-overdue);
}

.reminder-item--upcoming {
  background-color: var(--color-pending);
}

.reminder-item__title {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.reminder-item__date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.toast__content p {
  margin: var(--spacing-xs) 0;
}

.toast__content small {
  color: var(--color-text-secondary);
}

.toast__close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  padding: 0;
  margin-left: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
