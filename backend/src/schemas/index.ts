import { z } from 'zod';

// Enums
export const choreStatusSchema = z.enum(['pending', 'in_progress', 'completed']);
export const recurrenceTypeSchema = z.enum(['daily', 'weekly', 'monthly']);
export const weekDaySchema = z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']);
export const endTypeSchema = z.enum(['never', 'date', 'after']);

// Recurrence Rule Schema (for input - rruleString is generated)
export const recurrenceRuleInputSchema = z.object({
  type: recurrenceTypeSchema,
  interval: z.number().int().min(1).default(1),
  byWeekDay: z.array(weekDaySchema).nullable().default(null),
  byMonthDay: z.array(z.number().int().min(1).max(31)).nullable().default(null),
  bySetPos: z.number().int().min(-1).max(5).nullable().default(null),
  endType: endTypeSchema.default('never'),
  endDate: z.string().nullable().default(null),
  endAfterOccurrences: z.number().int().min(1).nullable().default(null),
});

// Team Member Schemas
export const createTeamMemberSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().nullable().optional(),
  avatar: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#3B82F6'),
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().nullable().optional(),
  avatar: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Chore Schemas
export const createChoreSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurrence: recurrenceRuleInputSchema.nullable().optional(),
});

export const updateChoreSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: choreStatusSchema.optional(),
  recurrence: recurrenceRuleInputSchema.nullable().optional(),
});

export const updateChoreStatusSchema = z.object({
  status: choreStatusSchema,
});

// Query Schemas
export const choreQuerySchema = z.object({
  assigneeId: z.string().optional(),
  status: z.string().optional(), // comma-separated statuses
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const calendarParamsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

// Type exports
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type CreateChoreInput = z.infer<typeof createChoreSchema>;
export type UpdateChoreInput = z.infer<typeof updateChoreSchema>;
export type UpdateChoreStatusInput = z.infer<typeof updateChoreStatusSchema>;
export type RecurrenceRuleInput = z.infer<typeof recurrenceRuleInputSchema>;
export type ChoreQuery = z.infer<typeof choreQuerySchema>;
export type CalendarParams = z.infer<typeof calendarParamsSchema>;
