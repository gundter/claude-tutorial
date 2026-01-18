import rruleLib from 'rrule';
import { parseISO, startOfDay, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { RecurrenceRule, Chore, WeekDay } from '../types/index.js';
import type { RecurrenceRuleInput } from '../schemas/index.js';

// Handle both ESM and CJS exports from rrule
const RRule = (rruleLib as any).RRule || rruleLib;
type RRuleType = typeof RRule;
type WeekdayType = InstanceType<RRuleType>['options']['byweekday'];

// Map string day codes to RRule weekday objects
const WEEKDAY_MAP: Record<WeekDay, any> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

// Map recurrence type to RRule frequency
const FREQ_MAP: Record<string, number> = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
};

/**
 * Build an RRule from the UI configuration
 */
export function buildRRule(config: RecurrenceRuleInput, dtstart: string): InstanceType<typeof RRule> {
  const options: Record<string, any> = {
    dtstart: startOfDay(parseISO(dtstart)),
    freq: FREQ_MAP[config.type],
    interval: config.interval,
  };

  // Weekly: specific days
  if (config.type === 'weekly' && config.byWeekDay && config.byWeekDay.length > 0) {
    options.byweekday = config.byWeekDay.map(day => WEEKDAY_MAP[day]);
  }

  // Monthly: specific day of month
  if (config.type === 'monthly' && config.byMonthDay && config.byMonthDay.length > 0) {
    options.bymonthday = config.byMonthDay;
  }

  // Monthly: nth weekday (e.g., 1st Monday)
  if (config.type === 'monthly' && config.byWeekDay && config.byWeekDay.length > 0 && config.bySetPos !== null) {
    options.byweekday = config.byWeekDay.map(day => WEEKDAY_MAP[day]);
    options.bysetpos = [config.bySetPos];
  }

  // End condition
  if (config.endType === 'date' && config.endDate) {
    options.until = parseISO(config.endDate);
  } else if (config.endType === 'after' && config.endAfterOccurrences) {
    options.count = config.endAfterOccurrences;
  }

  return new RRule(options);
}

/**
 * Convert UI input to full RecurrenceRule with generated rruleString
 */
export function createRecurrenceRule(input: RecurrenceRuleInput, dtstart: string): RecurrenceRule {
  const rule = buildRRule(input, dtstart);

  return {
    type: input.type,
    interval: input.interval,
    byWeekDay: input.byWeekDay,
    byMonthDay: input.byMonthDay,
    bySetPos: input.bySetPos,
    endType: input.endType,
    endDate: input.endDate,
    endAfterOccurrences: input.endAfterOccurrences,
    rruleString: rule.toString(),
  };
}

/**
 * Get occurrence dates within a date range
 */
export function getOccurrencesInRange(rruleString: string, startDate: string, endDate: string): Date[] {
  const rule = RRule.fromString(rruleString);
  return rule.between(
    startOfDay(parseISO(startDate)),
    startOfDay(parseISO(endDate)),
    true // inclusive
  );
}

/**
 * Get human-readable description of recurrence
 */
export function getHumanReadable(rruleString: string): string {
  const rule = RRule.fromString(rruleString);
  return rule.toText();
}

/**
 * Generate virtual chore instances for a date range
 * These are not persisted until the user interacts with them
 */
export function generateChoreInstances(parentChore: Chore, startDate: string, endDate: string): Chore[] {
  if (!parentChore.recurrence?.rruleString) {
    return [];
  }

  const dates = getOccurrencesInRange(parentChore.recurrence.rruleString, startDate, endDate);

  return dates
    .filter(date => {
      // Skip the original due date (it's already the parent)
      const dateStr = format(date, 'yyyy-MM-dd');
      return dateStr !== parentChore.dueDate;
    })
    .map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        id: `${parentChore.id}::instance::${dateStr}`,
        title: parentChore.title,
        description: parentChore.description,
        assigneeId: parentChore.assigneeId,
        status: 'pending' as const,
        dueDate: dateStr,
        recurrence: null,
        parentChoreId: parentChore.id,
        isRecurrenceInstance: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
}

/**
 * Persist a virtual instance when user changes its status
 */
export function createPersistedInstance(parentChore: Chore, dueDate: string): Chore {
  return {
    id: uuidv4(),
    title: parentChore.title,
    description: parentChore.description,
    assigneeId: parentChore.assigneeId,
    status: 'pending',
    dueDate,
    recurrence: null,
    parentChoreId: parentChore.id,
    isRecurrenceInstance: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get the next occurrence after a given date
 */
export function getNextOccurrence(rruleString: string, afterDate: string): Date | null {
  const rule = RRule.fromString(rruleString);
  const after = startOfDay(parseISO(afterDate));
  return rule.after(after, false) || null;
}
