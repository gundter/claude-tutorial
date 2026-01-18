<script setup lang="ts">
import type { CalendarDay, Chore } from '@/types';
import CalendarDayCell from './CalendarDayCell.vue';

defineProps<{
  days: CalendarDay[];
}>();

const emit = defineEmits<{
  'day-click': [dateStr: string];
  'chore-click': [chore: Chore];
}>();

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<template>
  <div class="calendar-body">
    <div class="calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="calendar-weekday">
        {{ day }}
      </div>
    </div>
    <div class="calendar-grid">
      <CalendarDayCell
        v-for="day in days"
        :key="day.dateStr"
        :day="day"
        @click="emit('day-click', day.dateStr)"
        @chore-click="emit('chore-click', $event)"
      />
    </div>
  </div>
</template>
