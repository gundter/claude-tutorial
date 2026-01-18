import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import * as dataService from '../services/dataService.js';
import { createRecurrenceRule, generateChoreInstances } from '../services/recurrenceService.js';
import {
  createChoreSchema,
  updateChoreSchema,
  updateChoreStatusSchema,
  choreQuerySchema,
  calendarParamsSchema,
} from '../schemas/index.js';
import type { Chore, ChoreStatus } from '../types/index.js';

// GET /api/chores
export async function getAllChores(req: Request, res: Response): Promise<void> {
  const parseResult = choreQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid query parameters', details: parseResult.error.errors });
    return;
  }

  const { assigneeId, status, startDate, endDate } = parseResult.data;
  const statusArray = status ? status.split(',') as ChoreStatus[] : undefined;

  const chores = await dataService.getChoresByFilter({
    assigneeId,
    status: statusArray,
    startDate,
    endDate,
  });

  res.json({ chores });
}

// GET /api/chores/:id
export async function getChoreById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const chore = await dataService.getChoreById(id);

  if (!chore) {
    res.status(404).json({ error: 'Chore not found' });
    return;
  }

  res.json({ chore });
}

// GET /api/chores/calendar/:year/:month
export async function getChoresForCalendar(req: Request, res: Response): Promise<void> {
  const parseResult = calendarParamsSchema.safeParse(req.params);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.errors });
    return;
  }

  const { year, month } = parseResult.data;
  const { assigneeId, status } = req.query;

  // Calculate date range for the month (include overflow days for calendar grid)
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(monthEnd, 'yyyy-MM-dd');

  // Get all chores
  const allChores = await dataService.getAllChores();

  // Filter by assignee and status if provided
  let filteredChores = allChores;
  if (assigneeId) {
    filteredChores = filteredChores.filter(c => c.assigneeId === assigneeId);
  }
  if (status) {
    const statusArray = (status as string).split(',');
    filteredChores = filteredChores.filter(c => statusArray.includes(c.status));
  }

  // Get non-recurring chores in the date range
  const regularChores = filteredChores.filter(chore => {
    return chore.dueDate >= startDateStr && chore.dueDate <= endDateStr && !chore.recurrence;
  });

  // Get recurring parent chores and generate instances
  const recurringParents = filteredChores.filter(chore => {
    return chore.recurrence && !chore.isRecurrenceInstance;
  });

  // Get persisted instances
  const persistedInstances = filteredChores.filter(chore => {
    return chore.isRecurrenceInstance && chore.dueDate >= startDateStr && chore.dueDate <= endDateStr;
  });

  // Generate virtual instances for recurring chores
  const virtualInstances: Chore[] = [];
  for (const parent of recurringParents) {
    const instances = generateChoreInstances(parent, startDateStr, endDateStr);

    // Filter out instances that already exist as persisted
    const persistedDates = new Set(
      persistedInstances
        .filter(inst => inst.parentChoreId === parent.id)
        .map(inst => inst.dueDate)
    );

    const newVirtual = instances.filter(inst => !persistedDates.has(inst.dueDate));
    virtualInstances.push(...newVirtual);

    // Also include the parent if its due date is in the range
    if (parent.dueDate >= startDateStr && parent.dueDate <= endDateStr) {
      regularChores.push(parent);
    }
  }

  // Combine all chores
  const allCalendarChores = [...regularChores, ...persistedInstances, ...virtualInstances];

  // Sort by due date
  allCalendarChores.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  res.json({
    year,
    month,
    chores: allCalendarChores,
  });
}

// POST /api/chores
export async function createChore(req: Request, res: Response): Promise<void> {
  const parseResult = createChoreSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    return;
  }

  const { title, description, assigneeId, dueDate, recurrence } = parseResult.data;

  // Validate assignee exists if provided
  if (assigneeId) {
    const member = await dataService.getTeamMemberById(assigneeId);
    if (!member) {
      res.status(400).json({ error: 'Assignee not found' });
      return;
    }
  }

  const now = new Date().toISOString();
  const chore: Chore = {
    id: `chore-${uuidv4()}`,
    title,
    description: description ?? null,
    assigneeId: assigneeId ?? null,
    status: 'pending',
    dueDate,
    recurrence: recurrence ? createRecurrenceRule(recurrence, dueDate) : null,
    parentChoreId: null,
    isRecurrenceInstance: false,
    createdAt: now,
    updatedAt: now,
  };

  const created = await dataService.createChore(chore);
  res.status(201).json({ chore: created });
}

// PUT /api/chores/:id
export async function updateChore(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const parseResult = updateChoreSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    return;
  }

  const existing = await dataService.getChoreById(id);
  if (!existing) {
    res.status(404).json({ error: 'Chore not found' });
    return;
  }

  // Destructure to separate recurrence from other fields
  const { recurrence: recurrenceInput, ...otherUpdates } = parseResult.data;
  const updates: Partial<Chore> = { ...otherUpdates };

  // Handle recurrence update
  if (recurrenceInput !== undefined) {
    const dueDate = parseResult.data.dueDate || existing.dueDate;
    updates.recurrence = recurrenceInput
      ? createRecurrenceRule(recurrenceInput, dueDate)
      : null;
  }

  // Validate assignee if changing
  if (updates.assigneeId) {
    const member = await dataService.getTeamMemberById(updates.assigneeId);
    if (!member) {
      res.status(400).json({ error: 'Assignee not found' });
      return;
    }
  }

  const updated = await dataService.updateChore(id, updates);
  res.json({ chore: updated });
}

// PATCH /api/chores/:id/status
export async function updateChoreStatus(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const parseResult = updateChoreStatusSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    return;
  }

  const { status } = parseResult.data;

  // Check if this is a virtual instance ID (parentId::instance::date format)
  // Using :: delimiter since colons don't appear in UUIDs
  if (id.includes('::instance::')) {
    const parts = id.split('::instance::');
    if (parts.length !== 2) {
      res.status(400).json({ error: 'Invalid virtual instance ID format' });
      return;
    }
    const [parentId, dueDate] = parts;
    const dateMatch = dueDate.match(/^\d{4}-\d{2}-\d{2}$/);

    if (dateMatch) {
      const parent = await dataService.getChoreById(parentId);

      if (!parent) {
        res.status(404).json({ error: 'Parent chore not found' });
        return;
      }

      // Create a persisted instance from the virtual one
      const now = new Date().toISOString();
      const newInstance: Chore = {
        id: `chore-${uuidv4()}`,
        title: parent.title,
        description: parent.description,
        assigneeId: parent.assigneeId,
        status,
        dueDate,
        recurrence: null,
        parentChoreId: parent.id,
        isRecurrenceInstance: true,
        createdAt: now,
        updatedAt: now,
      };

      const created = await dataService.createChore(newInstance);
      res.json({ chore: created });
      return;
    }
  }

  // Regular chore update
  const existing = await dataService.getChoreById(id);
  if (!existing) {
    res.status(404).json({ error: 'Chore not found' });
    return;
  }

  const updated = await dataService.updateChore(id, { status });
  res.json({ chore: updated });
}

// DELETE /api/chores/:id
export async function deleteChore(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const deleteInstances = req.query.deleteInstances === 'true';

  const deleted = await dataService.deleteChore(id, deleteInstances);

  if (!deleted) {
    res.status(404).json({ error: 'Chore not found' });
    return;
  }

  res.json({ success: true });
}
