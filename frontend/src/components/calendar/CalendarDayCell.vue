<script setup lang="ts">
import { computed } from 'vue';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';
import type { CalendarDay, Chore } from '@/types';
import ChoreBadge from './ChoreBadge.vue';

const props = defineProps<{
  day: CalendarDay;
}>();

const emit = defineEmits<{
  click: [];
  'chore-click': [chore: Chore];
}>();

const dayNumber = computed(() => format(props.day.date, 'd'));

const dayClasses = computed(() => ({
  'calendar-day': true,
  'calendar-day--other-month': !props.day.isCurrentMonth,
  'calendar-day--today': props.day.isToday,
  'calendar-day--weekend': props.day.isWeekend && props.day.isCurrentMonth,
}));

const visibleChores = computed(() => {
  // Show max 3 chores, with "+N more" indicator
  return props.day.chores.slice(0, 3);
});

const moreCount = computed(() => {
  return Math.max(0, props.day.chores.length - 3);
});

function isOverdue(chore: Chore): boolean {
  if (chore.status === 'completed') return false;
  return isBefore(startOfDay(parseISO(chore.dueDate)), startOfDay(new Date()));
}

function handleChoreClick(event: Event, chore: Chore) {
  event.stopPropagation();
  emit('chore-click', chore);
}
</script>

<template>
  <div :class="dayClasses" @click="emit('click')">
    <div class="calendar-day__number">
      {{ dayNumber }}
    </div>
    <div class="calendar-day__chores">
      <ChoreBadge
        v-for="chore in visibleChores"
        :key="chore.id"
        :chore="chore"
        :is-overdue="isOverdue(chore)"
        @click="handleChoreClick($event, chore)"
      />
      <div v-if="moreCount > 0" class="calendar-day__more">
        +{{ moreCount }} more
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-day__more {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding: 2px 6px;
}
</style>
