import { describe, it, expect } from 'vitest';
import { buildRRule, createRecurrenceRule, getOccurrencesInRange, generateChoreInstances } from './recurrenceService.js';
import { createMockChore, createMockRecurrence } from '../__fixtures__/chores.js';
import type { RecurrenceRuleInput } from '../schemas/index.js';

describe('recurrenceService', () => {
  describe('buildRRule', () => {
    it('should create daily recurrence rule', () => {
      const input: RecurrenceRuleInput = {
        type: 'daily',
        interval: 1,
        byWeekDay: null,
        byMonthDay: null,
        bySetPos: null,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const rule = buildRRule(input, '2026-01-20');
      expect(rule.toString()).toContain('FREQ=DAILY');
      expect(rule.toString()).toContain('INTERVAL=1');
    });

    it('should create daily recurrence with interval', () => {
      const input: RecurrenceRuleInput = {
        type: 'daily',
        interval: 3,
        byWeekDay: null,
        byMonthDay: null,
        bySetPos: null,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const rule = buildRRule(input, '2026-01-20');
      expect(rule.toString()).toContain('INTERVAL=3');
    });

    it('should create weekly recurrence with specific days', () => {
      const input: RecurrenceRuleInput = {
        type: 'weekly',
        interval: 1,
        byWeekDay: ['MO', 'WE', 'FR'],
        byMonthDay: null,
        bySetPos: null,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const rule = buildRRule(input, '2026-01-20');
      const ruleStr = rule.toString();
      expect(ruleStr).toContain('FREQ=WEEKLY');
      expect(ruleStr).toContain('MO');
      expect(ruleStr).toContain('WE');
      expect(ruleStr).toContain('FR');
    });

    it('should create monthly recurrence by day of month', () => {
      const input: RecurrenceRuleInput = {
        type: 'monthly',
        interval: 1,
        byWeekDay: null,
        byMonthDay: [15],
        bySetPos: null,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const rule = buildRRule(input, '2026-01-15');
      const ruleStr = rule.toString();
      expect(ruleStr).toContain('FREQ=MONTHLY');
      expect(ruleStr).toContain('BYMONTHDAY=15');
    });

    it('should create monthly recurrence by nth weekday', () => {
      const input: RecurrenceRuleInput = {
        type: 'monthly',
        interval: 1,
        byWeekDay: ['MO'],
        byMonthDay: null,
        bySetPos: 1,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const rule = buildRRule(input, '2026-01-06');
      const ruleStr = rule.toString();
      expect(ruleStr).toContain('FREQ=MONTHLY');
      expect(ruleStr).toContain('MO');
      expect(ruleStr).toContain('BYSETPOS=1');
    });

    it('should create recurrence with end date', () => {
      const input: RecurrenceRuleInput = {
        type: 'weekly',
        interval: 1,
        byWeekDay: ['TU'],
        byMonthDay: null,
        bySetPos: null,
        endType: 'date',
        endDate: '2026-03-31',
        endAfterOccurrences: null,
      };

      const rule = buildRRule(input, '2026-01-20');
      const ruleStr = rule.toString();
      expect(ruleStr).toContain('UNTIL=');
    });

    it('should create recurrence with occurrence count', () => {
      const input: RecurrenceRuleInput = {
        type: 'daily',
        interval: 1,
        byWeekDay: null,
        byMonthDay: null,
        bySetPos: null,
        endType: 'after',
        endDate: null,
        endAfterOccurrences: 10,
      };

      const rule = buildRRule(input, '2026-01-20');
      const ruleStr = rule.toString();
      expect(ruleStr).toContain('COUNT=10');
    });
  });

  describe('createRecurrenceRule', () => {
    it('should return a complete RecurrenceRule object', () => {
      const input: RecurrenceRuleInput = {
        type: 'weekly',
        interval: 2,
        byWeekDay: ['TH'],
        byMonthDay: null,
        bySetPos: null,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const result = createRecurrenceRule(input, '2026-01-23');

      expect(result.type).toBe('weekly');
      expect(result.interval).toBe(2);
      expect(result.byWeekDay).toEqual(['TH']);
      expect(result.rruleString).toBeTruthy();
      expect(result.rruleString).toContain('FREQ=WEEKLY');
    });
  });

  describe('getOccurrencesInRange', () => {
    it('should return dates within the range', () => {
      const rruleString = 'DTSTART:20260120T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1';

      const dates = getOccurrencesInRange(rruleString, '2026-01-20', '2026-01-25');

      // RRule between() returns occurrences within the range
      expect(dates.length).toBeGreaterThanOrEqual(5);
      expect(dates.length).toBeLessThanOrEqual(6);
    });

    it('should respect weekly recurrence pattern', () => {
      const rruleString = 'DTSTART:20260120T000000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR';

      // Jan 20 is Monday, Jan 22 is Wednesday, Jan 24 is Friday
      const dates = getOccurrencesInRange(rruleString, '2026-01-20', '2026-01-31');

      // Should get at least MO, WE, FR occurrences
      expect(dates.length).toBeGreaterThanOrEqual(5);
    });

    it('should respect end date', () => {
      const rruleString = 'DTSTART:20260120T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;UNTIL=20260123T000000Z';

      const dates = getOccurrencesInRange(rruleString, '2026-01-20', '2026-01-31');

      // UNTIL limits the recurrence
      expect(dates.length).toBeGreaterThanOrEqual(3);
      expect(dates.length).toBeLessThanOrEqual(4);
    });

    it('should respect count limit', () => {
      const rruleString = 'DTSTART:20260120T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=3';

      const dates = getOccurrencesInRange(rruleString, '2026-01-20', '2026-01-31');

      // COUNT limits to 3 occurrences (or fewer based on range)
      expect(dates.length).toBeLessThanOrEqual(3);
    });
  });

  describe('generateChoreInstances', () => {
    it('should generate virtual instances for recurring chore', () => {
      const parentChore = createMockChore({
        id: 'chore-parent-123',
        title: 'Daily Task',
        dueDate: '2026-01-20',
        recurrence: {
          type: 'daily',
          interval: 1,
          byWeekDay: null,
          byMonthDay: null,
          bySetPos: null,
          endType: 'never',
          endDate: null,
          endAfterOccurrences: null,
          rruleString: 'DTSTART:20260120T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1',
        },
      });

      const instances = generateChoreInstances(parentChore, '2026-01-20', '2026-01-25');

      // Should skip the original due date (Jan 20) and generate instances
      expect(instances.length).toBeGreaterThanOrEqual(4);
      // First instance should be after the original due date
      expect(instances[0].dueDate).toBe('2026-01-21');
    });

    it('should generate virtual instances with correct ID format', () => {
      const parentChore = createMockChore({
        id: 'chore-parent-xyz',
        dueDate: '2026-01-15', // Set earlier so 21-22 are generated
        recurrence: {
          type: 'daily',
          interval: 1,
          byWeekDay: null,
          byMonthDay: null,
          bySetPos: null,
          endType: 'never',
          endDate: null,
          endAfterOccurrences: null,
          rruleString: 'DTSTART:20260115T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1',
        },
      });

      const instances = generateChoreInstances(parentChore, '2026-01-21', '2026-01-22');

      expect(instances.length).toBeGreaterThanOrEqual(1);
      // Verify ID format uses :: delimiter
      expect(instances[0].id).toContain('chore-parent-xyz::instance::');
    });

    it('should set parentChoreId and isRecurrenceInstance', () => {
      const parentChore = createMockChore({
        id: 'chore-parent-abc',
        dueDate: '2026-01-15', // Set earlier so 21-23 are generated
        recurrence: {
          type: 'daily',
          interval: 1,
          byWeekDay: null,
          byMonthDay: null,
          bySetPos: null,
          endType: 'never',
          endDate: null,
          endAfterOccurrences: null,
          rruleString: 'DTSTART:20260115T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1',
        },
      });

      // Use a range that definitely includes dates
      const instances = generateChoreInstances(parentChore, '2026-01-21', '2026-01-23');

      expect(instances.length).toBeGreaterThanOrEqual(1);
      expect(instances[0].parentChoreId).toBe('chore-parent-abc');
      expect(instances[0].isRecurrenceInstance).toBe(true);
      expect(instances[0].status).toBe('pending');
    });

    it('should inherit title, description, and assigneeId from parent', () => {
      const parentChore = createMockChore({
        id: 'chore-parent-def',
        title: 'Daily Task',
        description: 'Do the task',
        assigneeId: 'tm-alice-001',
        dueDate: '2026-01-15', // Set before the range
        recurrence: {
          type: 'daily',
          interval: 1,
          byWeekDay: null,
          byMonthDay: null,
          bySetPos: null,
          endType: 'never',
          endDate: null,
          endAfterOccurrences: null,
          rruleString: 'DTSTART:20260115T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1',
        },
      });

      // Range that will generate instances
      const instances = generateChoreInstances(parentChore, '2026-01-21', '2026-01-23');

      expect(instances.length).toBeGreaterThanOrEqual(1);
      expect(instances[0].title).toBe('Daily Task');
      expect(instances[0].description).toBe('Do the task');
      expect(instances[0].assigneeId).toBe('tm-alice-001');
    });

    it('should return empty array for non-recurring chore', () => {
      const regularChore = createMockChore({
        recurrence: null,
      });

      const instances = generateChoreInstances(regularChore, '2026-01-20', '2026-01-31');

      expect(instances).toEqual([]);
    });

    it('should return empty array if no rruleString', () => {
      const choreWithBadRecurrence = createMockChore({
        recurrence: {
          type: 'daily',
          interval: 1,
          byWeekDay: null,
          byMonthDay: null,
          bySetPos: null,
          endType: 'never',
          endDate: null,
          endAfterOccurrences: null,
          rruleString: '',
        },
      });

      const instances = generateChoreInstances(choreWithBadRecurrence, '2026-01-20', '2026-01-31');

      expect(instances).toEqual([]);
    });
  });
});
