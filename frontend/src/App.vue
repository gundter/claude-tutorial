<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useTeamStore } from '@/stores/teamStore';
import ReminderBell from '@/components/reminders/ReminderBell.vue';

const teamStore = useTeamStore();

onMounted(async () => {
  // Load team members on app start
  await teamStore.fetchAll();
});
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <h1>Office Chore Manager</h1>
      <nav>
        <RouterLink to="/">Calendar</RouterLink>
        <RouterLink to="/chores">Chores</RouterLink>
        <RouterLink to="/team">Team</RouterLink>
      </nav>
      <ReminderBell />
    </header>
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>
