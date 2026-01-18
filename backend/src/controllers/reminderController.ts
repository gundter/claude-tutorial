import type { Request, Response } from 'express';
import * as reminderService from '../services/reminderService.js';

// GET /api/reminders/check
export async function checkReminders(_req: Request, res: Response): Promise<void> {
  const result = await reminderService.checkReminders();
  res.json(result);
}

// GET /api/reminders/upcoming
export async function getUpcoming(req: Request, res: Response): Promise<void> {
  const hoursAhead = parseInt(req.query.hours as string) || 24;
  const chores = await reminderService.getUpcomingChores(hoursAhead);
  res.json({ chores });
}

// GET /api/reminders/overdue
export async function getOverdue(_req: Request, res: Response): Promise<void> {
  const chores = await reminderService.getOverdueChores();
  res.json({ chores });
}
