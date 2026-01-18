<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isWeekend, addMonths, subMonths } from 'date-fns';
import { useChoreStore } from '@/stores/choreStore';
import { useTeamStore } from '@/stores/teamStore';
import type { Chore, CalendarDay } from '@/types';
import CalendarHeader from '@/components/calendar/CalendarHeader.vue';
import CalendarGrid from '@/components/calendar/CalendarGrid.vue';
import ChoreModal from '@/components/chores/ChoreModal.vue';
import ChoreDetailPanel from '@/components/chores/ChoreDetailPanel.vue';
import FilterBar from '@/components/filters/FilterBar.vue';

const choreStore = useChoreStore();
const teamStore = useTeamStore();

// Current month
const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);
const monthLabel = computed(() => format(currentDate.value, 'MMMM yyyy'));

// Modal state
const showChoreModal = ref(false);
const editingChore = ref<Chore | null>(null);
const selectedDate = ref<string | null>(null);

// Detail panel state
const showDetailPanel = ref(false);
const selectedChore = ref<Chore | null>(null);

// Generate calendar days
const calendarDays = computed<CalendarDay[]>(() => {
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayChores = choreStore.choresByDate[dateStr] || [];

    return {
      date,
      dateStr,
      isCurrentMonth: isSameMonth(date, currentDate.value),
      isToday: isToday(date),
      isWeekend: isWeekend(date),
      chores: dayChores,
    };
  });
});

// Navigation
function goToPrevMonth() {
  currentDate.value = subMonths(currentDate.value, 1);
}

function goToNextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
}

function goToToday() {
  currentDate.value = new Date();
}

// Chore interactions
function handleDayClick(dateStr: string) {
  selectedDate.value = dateStr;
  editingChore.value = null;
  showChoreModal.value = true;
}

function handleChoreClick(chore: Chore) {
  selectedChore.value = chore;
  showDetailPanel.value = true;
}

function handleAddChore() {
  selectedDate.value = format(new Date(), 'yyyy-MM-dd');
  editingChore.value = null;
  showChoreModal.value = true;
}

function handleEditChore(chore: Chore) {
  editingChore.value = chore;
  selectedDate.value = chore.dueDate;
  showChoreModal.value = true;
  showDetailPanel.value = false;
}

function closeModal() {
  showChoreModal.value = false;
  editingChore.value = null;
  selectedDate.value = null;
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

// Load chores when month changes
async function loadChores() {
  await choreStore.fetchForCalendar(currentYear.value, currentMonth.value);
}

watch([currentYear, currentMonth], loadChores);

onMounted(async () => {
  await Promise.all([
    loadChores(),
    teamStore.fetchAll(),
  ]);
});
</script>

<template>
  <div class="calendar-page">
    <FilterBar />

    <div class="calendar-container">
      <div class="calendar">
        <CalendarHeader
          :month-label="monthLabel"
          @prev="goToPrevMonth"
          @next="goToNextMonth"
          @today="goToToday"
          @add="handleAddChore"
        />
        <CalendarGrid
          :days="calendarDays"
          @day-click="handleDayClick"
          @chore-click="handleChoreClick"
        />
      </div>
    </div>

    <!-- Chore Modal -->
    <ChoreModal
      v-if="showChoreModal"
      :chore="editingChore"
      :initial-date="selectedDate"
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
.calendar-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.calendar-container {
  flex: 1;
}
</style>
