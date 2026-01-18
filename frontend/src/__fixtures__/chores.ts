import type { Chore, RecurrenceRule } from '@/types';

export function createMockChore(overrides: Partial<Chore> = {}): Chore {
  const now = '2026-01-18T00:00:00.000Z';
  return {
    id: 'chore-test-123',
    title: 'Test Chore',
    description: null,
    assigneeId: null,
    status: 'pending',
    dueDate: '2026-01-18',
    recurrence: null,
    parentChoreId: null,
    isRecurrenceInstance: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createMockRecurrence(overrides: Partial<RecurrenceRule> = {}): RecurrenceRule {
  return {
    type: 'weekly',
    interval: 1,
    byWeekDay: ['MO', 'WE', 'FR'],
    byMonthDay: null,
    bySetPos: null,
    endType: 'never',
    endDate: null,
    endAfterOccurrences: null,
    rruleString: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR',
    ...overrides,
  };
}

export const mockChores = {
  simple: createMockChore({
    id: 'chore-simple-001',
    title: 'Clean Kitchen',
    description: 'Wipe counters and do dishes',
    dueDate: '2026-01-20',
  }),
  assigned: createMockChore({
    id: 'chore-assigned-002',
    title: 'Water Plants',
    assigneeId: 'tm-alice-001',
    dueDate: '2026-01-21',
  }),
  inProgress: createMockChore({
    id: 'chore-progress-003',
    title: 'Organize Files',
    status: 'in_progress',
    dueDate: '2026-01-19',
  }),
  completed: createMockChore({
    id: 'chore-done-004',
    title: 'Empty Trash',
    status: 'completed',
    dueDate: '2026-01-17',
  }),
};
