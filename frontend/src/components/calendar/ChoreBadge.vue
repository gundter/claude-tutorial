<script setup lang="ts">
import { computed } from 'vue';
import type { Chore } from '@/types';

const props = defineProps<{
  chore: Chore;
  isOverdue?: boolean;
}>();

defineEmits<{
  click: [event: Event];
}>();

const badgeClass = computed(() => {
  if (props.isOverdue && props.chore.status !== 'completed') {
    return 'chore-badge chore-badge--overdue';
  }
  return `chore-badge chore-badge--${props.chore.status}`;
});
</script>

<template>
  <div :class="badgeClass" :title="chore.title" @click="$emit('click', $event)">
    {{ chore.title }}
  </div>
</template>
