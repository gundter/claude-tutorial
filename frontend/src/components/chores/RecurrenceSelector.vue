<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { RecurrenceInput, RecurrenceType, WeekDay, EndType } from '@/types';

const props = defineProps<{
  modelValue: RecurrenceInput | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: RecurrenceInput];
}>();

// Internal state
const recurrenceType = ref<RecurrenceType>('weekly');
const interval = ref(1);
const selectedDays = ref<WeekDay[]>([]);
const monthlyType = ref<'date' | 'weekday'>('date');
const monthDay = ref(1);
const weekdayPosition = ref(1);
const weekday = ref<WeekDay>('MO');
const endType = ref<EndType>('never');
const endDate = ref('');
const endAfterCount = ref(10);

// Flag to prevent emit during initialization
const isInitialized = ref(false);

const weekdays: { value: WeekDay; label: string }[] = [
  { value: 'MO', label: 'Mon' },
  { value: 'TU', label: 'Tue' },
  { value: 'WE', label: 'Wed' },
  { value: 'TH', label: 'Thu' },
  { value: 'FR', label: 'Fri' },
  { value: 'SA', label: 'Sat' },
  { value: 'SU', label: 'Sun' },
];

const positions = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: -1, label: 'Last' },
];

// Initialize from props
if (props.modelValue) {
  recurrenceType.value = props.modelValue.type;
  interval.value = props.modelValue.interval;
  if (props.modelValue.byWeekDay) {
    selectedDays.value = [...props.modelValue.byWeekDay];
  }
  if (props.modelValue.byMonthDay && props.modelValue.byMonthDay.length > 0) {
    monthlyType.value = 'date';
    monthDay.value = props.modelValue.byMonthDay[0];
  }
  if (props.modelValue.bySetPos !== null && props.modelValue.bySetPos !== undefined) {
    monthlyType.value = 'weekday';
    weekdayPosition.value = props.modelValue.bySetPos;
    if (props.modelValue.byWeekDay && props.modelValue.byWeekDay.length > 0) {
      weekday.value = props.modelValue.byWeekDay[0];
    }
  }
  endType.value = props.modelValue.endType;
  if (props.modelValue.endDate) {
    endDate.value = props.modelValue.endDate;
  }
  if (props.modelValue.endAfterOccurrences) {
    endAfterCount.value = props.modelValue.endAfterOccurrences;
  }
}

// Mark as initialized after props are processed
// Using nextTick equivalent with setTimeout to ensure watch doesn't trigger on initial setup
setTimeout(() => {
  isInitialized.value = true;
}, 0);

const intervalLabel = computed(() => {
  switch (recurrenceType.value) {
    case 'daily':
      return interval.value === 1 ? 'day' : 'days';
    case 'weekly':
      return interval.value === 1 ? 'week' : 'weeks';
    case 'monthly':
      return interval.value === 1 ? 'month' : 'months';
    default:
      return '';
  }
});

// Emit updates only after initialization
function emitUpdate() {
  if (!isInitialized.value) {
    return;
  }

  const value: RecurrenceInput = {
    type: recurrenceType.value,
    interval: interval.value,
    byWeekDay: null,
    byMonthDay: null,
    bySetPos: null,
    endType: endType.value,
    endDate: endType.value === 'date' ? endDate.value : null,
    endAfterOccurrences: endType.value === 'after' ? endAfterCount.value : null,
  };

  if (recurrenceType.value === 'weekly' && selectedDays.value.length > 0) {
    value.byWeekDay = [...selectedDays.value];
  }

  if (recurrenceType.value === 'monthly') {
    if (monthlyType.value === 'date') {
      value.byMonthDay = [monthDay.value];
    } else {
      value.byWeekDay = [weekday.value];
      value.bySetPos = weekdayPosition.value;
    }
  }

  emit('update:modelValue', value);
}

// Watch for changes and emit
watch(
  [recurrenceType, interval, selectedDays, monthlyType, monthDay, weekdayPosition, weekday, endType, endDate, endAfterCount],
  emitUpdate,
  { deep: true }
);

function toggleDay(day: WeekDay) {
  const index = selectedDays.value.indexOf(day);
  if (index === -1) {
    selectedDays.value.push(day);
  } else {
    selectedDays.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="recurrence-selector">
    <div class="form-group">
      <label class="form-label">Repeat</label>
      <div class="recurrence-row">
        <span>Every</span>
        <input
          v-model.number="interval"
          type="number"
          min="1"
          max="99"
          class="form-input interval-input"
        />
        <select v-model="recurrenceType" class="form-select type-select">
          <option value="daily">{{ intervalLabel }}</option>
          <option value="weekly">{{ intervalLabel }}</option>
          <option value="monthly">{{ intervalLabel }}</option>
        </select>
      </div>
    </div>

    <!-- Weekly: Day selection -->
    <div v-if="recurrenceType === 'weekly'" class="form-group">
      <label class="form-label">On these days</label>
      <div class="day-buttons">
        <button
          v-for="day in weekdays"
          :key="day.value"
          type="button"
          :class="['day-button', { 'day-button--selected': selectedDays.includes(day.value) }]"
          @click="toggleDay(day.value)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <!-- Monthly options -->
    <div v-if="recurrenceType === 'monthly'" class="form-group">
      <label class="form-label">On</label>
      <div class="radio-group">
        <label class="radio-label">
          <input v-model="monthlyType" type="radio" value="date" />
          <span>Day</span>
          <input
            v-model.number="monthDay"
            type="number"
            min="1"
            max="31"
            class="form-input day-input"
            :disabled="monthlyType !== 'date'"
          />
          <span>of the month</span>
        </label>
        <label class="radio-label">
          <input v-model="monthlyType" type="radio" value="weekday" />
          <span>The</span>
          <select
            v-model.number="weekdayPosition"
            class="form-select position-select"
            :disabled="monthlyType !== 'weekday'"
          >
            <option v-for="pos in positions" :key="pos.value" :value="pos.value">
              {{ pos.label }}
            </option>
          </select>
          <select
            v-model="weekday"
            class="form-select weekday-select"
            :disabled="monthlyType !== 'weekday'"
          >
            <option v-for="day in weekdays" :key="day.value" :value="day.value">
              {{ day.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <!-- End options -->
    <div class="form-group">
      <label class="form-label">Ends</label>
      <div class="radio-group">
        <label class="radio-label">
          <input v-model="endType" type="radio" value="never" />
          <span>Never</span>
        </label>
        <label class="radio-label">
          <input v-model="endType" type="radio" value="date" />
          <span>On date</span>
          <input
            v-model="endDate"
            type="date"
            class="form-input date-input"
            :disabled="endType !== 'date'"
          />
        </label>
        <label class="radio-label">
          <input v-model="endType" type="radio" value="after" />
          <span>After</span>
          <input
            v-model.number="endAfterCount"
            type="number"
            min="1"
            max="999"
            class="form-input count-input"
            :disabled="endType !== 'after'"
          />
          <span>occurrences</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recurrence-selector {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-top: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
}

.recurrence-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.interval-input {
  width: 60px;
  text-align: center;
}

.type-select {
  width: 120px;
}

.day-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.day-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;
}

.day-button:hover {
  border-color: var(--color-primary);
}

.day-button--selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.day-input {
  width: 60px;
  text-align: center;
}

.position-select,
.weekday-select {
  width: 80px;
}

.date-input {
  width: 150px;
}

.count-input {
  width: 60px;
  text-align: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}
</style>
