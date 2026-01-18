import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: () => import('@/views/CalendarPage.vue'),
    },
    {
      path: '/chores',
      name: 'chores',
      component: () => import('@/views/ChoresListPage.vue'),
    },
    {
      path: '/team',
      name: 'team',
      component: () => import('@/views/TeamPage.vue'),
    },
  ],
});

export default router;
