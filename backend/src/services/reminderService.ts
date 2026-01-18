import { format, addHours, startOfDay, isBefore, parseISO } from 'date-fns';
import * as dataService from './dataService.js';
import { generateChoreInstances } from './recurrenceService.js';
import type { Chore } from '../types/index.js';

/**
 * Get chores that are due within the specified number of hours
 */
export async function getUpcomingChores(hoursAhead: number = 24): Promise<Chore[]> {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const futureDate = addHours(now, hoursAhead);
  const futureDateStr = format(futureDate, 'yyyy-MM-dd');

  // Get all non-completed chores
  const allChores = await dataService.getAllChores();
  const nonCompleted = allChores.filter(c => c.status !== 'completed');

  // Find regular chores due within the window
  const upcoming: Chore[] = [];

  for (const chore of nonCompleted) {
    const dueDate = chore.dueDate;

    // Check if due within the window (today to futureDate)
    if (dueDate >= todayStr && dueDate <= futureDateStr) {
      upcoming.push(chore);
    }

    // For recurring chores, check if any instances fall in the window
    if (chore.recurrence && !chore.isRecurrenceInstance) {
      const instances = generateChoreInstances(chore, todayStr, futureDateStr);

      // Filter out instances that already have persisted records
      const persistedIds = new Set(
        allChores
          .filter(c => c.parentChoreId === chore.id)
          .map(c => c.dueDate)
      );

      const virtualInstances = instances.filter(inst => !persistedIds.has(inst.dueDate));
      upcoming.push(...virtualInstances);
    }
  }

  // Sort by due date
  upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return upcoming;
}

/**
 * Get chores that are overdue (past due date and not completed)
 */
export async function getOverdueChores(): Promise<Chore[]> {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const allChores = await dataService.getAllChores();

  const overdue = allChores.filter(chore => {
    return chore.status !== 'completed' && chore.dueDate < todayStr;
  });

  // Sort by due date (oldest first)
  overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return overdue;
}

/**
 * Get both upcoming and overdue chores for the reminder check
 */
export async function checkReminders(): Promise<{
  upcoming: Chore[];
  overdue: Chore[];
}> {
  const [upcoming, overdue] = await Promise.all([
    getUpcomingChores(24),
    getOverdueChores(),
  ]);

  return { upcoming, overdue };
}
