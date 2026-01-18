import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as dataService from '../services/dataService.js';
import { createTeamMemberSchema, updateTeamMemberSchema } from '../schemas/index.js';
import type { TeamMember } from '../types/index.js';

// GET /api/team-members
export async function getAllTeamMembers(_req: Request, res: Response): Promise<void> {
  const teamMembers = await dataService.getAllTeamMembers();
  res.json({ teamMembers });
}

// GET /api/team-members/:id
export async function getTeamMemberById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const teamMember = await dataService.getTeamMemberById(id);

  if (!teamMember) {
    res.status(404).json({ error: 'Team member not found' });
    return;
  }

  res.json({ teamMember });
}

// POST /api/team-members
export async function createTeamMember(req: Request, res: Response): Promise<void> {
  const parseResult = createTeamMemberSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    return;
  }

  const now = new Date().toISOString();
  const teamMember: TeamMember = {
    id: `tm-${uuidv4()}`,
    name: parseResult.data.name,
    email: parseResult.data.email ?? null,
    avatar: parseResult.data.avatar ?? '#3B82F6',
    createdAt: now,
    updatedAt: now,
  };

  const created = await dataService.createTeamMember(teamMember);
  res.status(201).json({ teamMember: created });
}

// PUT /api/team-members/:id
export async function updateTeamMember(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const parseResult = updateTeamMemberSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    return;
  }

  const updated = await dataService.updateTeamMember(id, parseResult.data);

  if (!updated) {
    res.status(404).json({ error: 'Team member not found' });
    return;
  }

  res.json({ teamMember: updated });
}

// DELETE /api/team-members/:id
export async function deleteTeamMember(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  // Check if any chores are assigned to this member
  const chores = await dataService.getChoresByFilter({ assigneeId: id });
  if (chores.length > 0) {
    res.status(400).json({
      error: 'Cannot delete team member with assigned chores',
      assignedChoreCount: chores.length,
    });
    return;
  }

  const deleted = await dataService.deleteTeamMember(id);

  if (!deleted) {
    res.status(404).json({ error: 'Team member not found' });
    return;
  }

  res.json({ success: true });
}
