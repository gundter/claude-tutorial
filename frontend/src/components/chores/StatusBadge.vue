<script setup lang="ts">
import type { ChoreStatus } from '@/types';

defineProps<{
  status: ChoreStatus;
}>();

const statusLabels: Record<ChoreStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};
</script>

<template>
  <span :class="['status-badge', `status-badge--${status}`]">
    {{ statusLabels[status] }}
  </span>
</template>
