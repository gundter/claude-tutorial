import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TeamMember, Chore, DataStore } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, 'teamMembers.json');
const CHORES_FILE = path.join(DATA_DIR, 'chores.json');

// Initialize data directory and files
async function initializeDataFiles(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  if (!existsSync(TEAM_MEMBERS_FILE)) {
    await writeFile(TEAM_MEMBERS_FILE, JSON.stringify({ teamMembers: [] }, null, 2));
  }

  if (!existsSync(CHORES_FILE)) {
    await writeFile(CHORES_FILE, JSON.stringify({ chores: [] }, null, 2));
  }
}

// Generic read function
async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

// Generic write function
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

// Team Members Operations
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  await initializeDataFiles();
  const data = await readJsonFile<{ teamMembers: TeamMember[] }>(TEAM_MEMBERS_FILE);
  return data.teamMembers;
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const members = await getAllTeamMembers();
  return members.find(m => m.id === id) || null;
}

export async function createTeamMember(member: TeamMember): Promise<TeamMember> {
  const members = await getAllTeamMembers();
  members.push(member);
  await writeJsonFile(TEAM_MEMBERS_FILE, { teamMembers: members });
  return member;
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
  const members = await getAllTeamMembers();
  const index = members.findIndex(m => m.id === id);

  if (index === -1) return null;

  members[index] = { ...members[index], ...updates, updatedAt: new Date().toISOString() };
  await writeJsonFile(TEAM_MEMBERS_FILE, { teamMembers: members });
  return members[index];
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const members = await getAllTeamMembers();
  const filteredMembers = members.filter(m => m.id !== id);

  if (filteredMembers.length === members.length) return false;

  await writeJsonFile(TEAM_MEMBERS_FILE, { teamMembers: filteredMembers });
  return true;
}

// Chores Operations
export async function getAllChores(): Promise<Chore[]> {
  await initializeDataFiles();
  const data = await readJsonFile<{ chores: Chore[] }>(CHORES_FILE);
  return data.chores;
}

export async function getChoreById(id: string): Promise<Chore | null> {
  const chores = await getAllChores();
  return chores.find(c => c.id === id) || null;
}

export async function getChoresByFilter(filter: {
  assigneeId?: string;
  status?: string[];
  startDate?: string;
  endDate?: string;
}): Promise<Chore[]> {
  let chores = await getAllChores();

  if (filter.assigneeId) {
    chores = chores.filter(c => c.assigneeId === filter.assigneeId);
  }

  if (filter.status && filter.status.length > 0) {
    chores = chores.filter(c => filter.status!.includes(c.status));
  }

  if (filter.startDate) {
    chores = chores.filter(c => c.dueDate >= filter.startDate!);
  }

  if (filter.endDate) {
    chores = chores.filter(c => c.dueDate <= filter.endDate!);
  }

  return chores;
}

export async function createChore(chore: Chore): Promise<Chore> {
  const chores = await getAllChores();
  chores.push(chore);
  await writeJsonFile(CHORES_FILE, { chores });
  return chore;
}

export async function updateChore(id: string, updates: Partial<Chore>): Promise<Chore | null> {
  const chores = await getAllChores();
  const index = chores.findIndex(c => c.id === id);

  if (index === -1) return null;

  chores[index] = { ...chores[index], ...updates, updatedAt: new Date().toISOString() };
  await writeJsonFile(CHORES_FILE, { chores });
  return chores[index];
}

export async function deleteChore(id: string, deleteInstances: boolean = false): Promise<boolean> {
  let chores = await getAllChores();
  const chore = chores.find(c => c.id === id);

  if (!chore) return false;

  if (deleteInstances && !chore.isRecurrenceInstance) {
    // Delete the parent chore and all its instances
    chores = chores.filter(c => c.id !== id && c.parentChoreId !== id);
  } else {
    // Delete just this chore
    chores = chores.filter(c => c.id !== id);
  }

  await writeJsonFile(CHORES_FILE, { chores });
  return true;
}

export async function getChoresByParentId(parentId: string): Promise<Chore[]> {
  const chores = await getAllChores();
  return chores.filter(c => c.parentChoreId === parentId);
}

// Bulk operations for recurrence instances
export async function createChores(newChores: Chore[]): Promise<Chore[]> {
  const chores = await getAllChores();
  chores.push(...newChores);
  await writeJsonFile(CHORES_FILE, { chores });
  return newChores;
}
