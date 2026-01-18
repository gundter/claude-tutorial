import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as dataService from './dataService.js';
import { createMockChore } from '../__fixtures__/chores.js';
import { createMockTeamMember } from '../__fixtures__/teamMembers.js';

// Mock the fs/promises module
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

import { readFile, writeFile } from 'fs/promises';

describe('dataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllChores', () => {
    it('should return all chores from file', async () => {
      const mockChores = [
        createMockChore({ id: 'chore-1', title: 'Chore 1' }),
        createMockChore({ id: 'chore-2', title: 'Chore 2' }),
      ];

      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: mockChores }));

      const result = await dataService.getAllChores();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Chore 1');
      expect(result[1].title).toBe('Chore 2');
    });
  });

  describe('getChoreById', () => {
    it('should return chore by id', async () => {
      const mockChores = [
        createMockChore({ id: 'chore-1', title: 'Chore 1' }),
        createMockChore({ id: 'chore-2', title: 'Chore 2' }),
      ];

      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: mockChores }));

      const result = await dataService.getChoreById('chore-1');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Chore 1');
    });

    it('should return null for non-existent id', async () => {
      const mockChores = [createMockChore({ id: 'chore-1' })];

      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: mockChores }));

      const result = await dataService.getChoreById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getChoresByFilter', () => {
    const mockChores = [
      createMockChore({ id: 'c1', assigneeId: 'tm-1', status: 'pending', dueDate: '2026-01-20' }),
      createMockChore({ id: 'c2', assigneeId: 'tm-1', status: 'completed', dueDate: '2026-01-21' }),
      createMockChore({ id: 'c3', assigneeId: 'tm-2', status: 'pending', dueDate: '2026-01-22' }),
      createMockChore({ id: 'c4', assigneeId: null, status: 'in_progress', dueDate: '2026-01-23' }),
    ];

    beforeEach(() => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: mockChores }));
    });

    it('should filter by assigneeId', async () => {
      const result = await dataService.getChoresByFilter({ assigneeId: 'tm-1' });

      expect(result).toHaveLength(2);
      expect(result.every(c => c.assigneeId === 'tm-1')).toBe(true);
    });

    it('should filter by status', async () => {
      const result = await dataService.getChoresByFilter({ status: ['pending'] });

      expect(result).toHaveLength(2);
      expect(result.every(c => c.status === 'pending')).toBe(true);
    });

    it('should filter by multiple statuses', async () => {
      const result = await dataService.getChoresByFilter({ status: ['pending', 'in_progress'] });

      expect(result).toHaveLength(3);
    });

    it('should filter by date range', async () => {
      const result = await dataService.getChoresByFilter({
        startDate: '2026-01-21',
        endDate: '2026-01-22',
      });

      expect(result).toHaveLength(2);
      expect(result[0].dueDate).toBe('2026-01-21');
      expect(result[1].dueDate).toBe('2026-01-22');
    });

    it('should combine multiple filters', async () => {
      const result = await dataService.getChoresByFilter({
        assigneeId: 'tm-1',
        status: ['pending'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
    });

    it('should return empty array when no matches', async () => {
      const result = await dataService.getChoresByFilter({
        assigneeId: 'non-existent',
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('createChore', () => {
    it('should add chore to file', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: [] }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const newChore = createMockChore({ id: 'new-chore', title: 'New Chore' });
      const result = await dataService.createChore(newChore);

      expect(result).toEqual(newChore);
      expect(writeFile).toHaveBeenCalledTimes(1);

      const writeCall = vi.mocked(writeFile).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData.chores).toHaveLength(1);
      expect(writtenData.chores[0].id).toBe('new-chore');
    });
  });

  describe('updateChore', () => {
    it('should update existing chore', async () => {
      const existingChore = createMockChore({ id: 'chore-1', title: 'Old Title', status: 'pending' });
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: [existingChore] }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await dataService.updateChore('chore-1', { title: 'New Title' });

      expect(result).not.toBeNull();
      expect(result?.title).toBe('New Title');
      expect(result?.status).toBe('pending'); // Unchanged
    });

    it('should return null for non-existent chore', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: [] }));

      const result = await dataService.updateChore('non-existent', { title: 'New Title' });

      expect(result).toBeNull();
    });
  });

  describe('deleteChore', () => {
    it('should delete existing chore', async () => {
      const chores = [
        createMockChore({ id: 'chore-1' }),
        createMockChore({ id: 'chore-2' }),
      ];
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await dataService.deleteChore('chore-1');

      expect(result).toBe(true);

      const writeCall = vi.mocked(writeFile).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData.chores).toHaveLength(1);
      expect(writtenData.chores[0].id).toBe('chore-2');
    });

    it('should return false for non-existent chore', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores: [] }));

      const result = await dataService.deleteChore('non-existent');

      expect(result).toBe(false);
    });

    it('should delete instances when deleteInstances is true', async () => {
      const chores = [
        createMockChore({ id: 'parent', isRecurrenceInstance: false }),
        createMockChore({ id: 'instance-1', parentChoreId: 'parent', isRecurrenceInstance: true }),
        createMockChore({ id: 'instance-2', parentChoreId: 'parent', isRecurrenceInstance: true }),
        createMockChore({ id: 'other', isRecurrenceInstance: false }),
      ];
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ chores }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await dataService.deleteChore('parent', true);

      expect(result).toBe(true);

      const writeCall = vi.mocked(writeFile).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData.chores).toHaveLength(1);
      expect(writtenData.chores[0].id).toBe('other');
    });
  });

  describe('getAllTeamMembers', () => {
    it('should return all team members from file', async () => {
      const mockMembers = [
        createMockTeamMember({ id: 'tm-1', name: 'Alice' }),
        createMockTeamMember({ id: 'tm-2', name: 'Bob' }),
      ];

      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: mockMembers }));

      const result = await dataService.getAllTeamMembers();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
    });
  });

  describe('getTeamMemberById', () => {
    it('should return member by id', async () => {
      const mockMembers = [
        createMockTeamMember({ id: 'tm-1', name: 'Alice' }),
      ];

      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: mockMembers }));

      const result = await dataService.getTeamMemberById('tm-1');

      expect(result?.name).toBe('Alice');
    });

    it('should return null for non-existent id', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: [] }));

      const result = await dataService.getTeamMemberById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createTeamMember', () => {
    it('should add team member to file', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: [] }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const newMember = createMockTeamMember({ id: 'new-tm', name: 'Charlie' });
      const result = await dataService.createTeamMember(newMember);

      expect(result).toEqual(newMember);
      expect(writeFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTeamMember', () => {
    it('should update existing member', async () => {
      const existingMember = createMockTeamMember({ id: 'tm-1', name: 'Alice' });
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: [existingMember] }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await dataService.updateTeamMember('tm-1', { name: 'Alicia' });

      expect(result?.name).toBe('Alicia');
    });

    it('should return null for non-existent member', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: [] }));

      const result = await dataService.updateTeamMember('non-existent', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('deleteTeamMember', () => {
    it('should delete existing member', async () => {
      const members = [
        createMockTeamMember({ id: 'tm-1' }),
        createMockTeamMember({ id: 'tm-2' }),
      ];
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: members }));
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await dataService.deleteTeamMember('tm-1');

      expect(result).toBe(true);
    });

    it('should return false for non-existent member', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ teamMembers: [] }));

      const result = await dataService.deleteTeamMember('non-existent');

      expect(result).toBe(false);
    });
  });
});
