<script setup lang="ts">
defineProps<{
  monthLabel: string;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  today: [];
  add: [];
}>();
</script>

<template>
  <div class="calendar-header">
    <div class="calendar-nav">
      <button class="btn btn-secondary" @click="emit('prev')">
        &larr; Prev
      </button>
      <button class="btn btn-secondary" @click="emit('today')">
        Today
      </button>
      <button class="btn btn-secondary" @click="emit('next')">
        Next &rarr;
      </button>
    </div>

    <h2>{{ monthLabel }}</h2>

    <button class="btn btn-primary" @click="emit('add')">
      + Add Chore
    </button>
  </div>
</template>
