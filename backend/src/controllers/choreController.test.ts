import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import * as dataService from '../services/dataService.js';
import { createMockChore } from '../__fixtures__/chores.js';
import { createMockTeamMember } from '../__fixtures__/teamMembers.js';

// Mock the data service
vi.mock('../services/dataService.js');

describe('Chore Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/chores', () => {
    it('should return all chores', async () => {
      const mockChores = [
        createMockChore({ id: 'chore-1', title: 'Chore 1' }),
        createMockChore({ id: 'chore-2', title: 'Chore 2' }),
      ];

      vi.mocked(dataService.getChoresByFilter).mockResolvedValue(mockChores);

      const response = await request(app)
        .get('/api/chores')
        .expect(200);

      expect(response.body.chores).toHaveLength(2);
      expect(response.body.chores[0].title).toBe('Chore 1');
    });

    it('should filter chores by assigneeId', async () => {
      const mockChores = [createMockChore({ assigneeId: 'tm-1' })];
      vi.mocked(dataService.getChoresByFilter).mockResolvedValue(mockChores);

      await request(app)
        .get('/api/chores?assigneeId=tm-1')
        .expect(200);

      expect(dataService.getChoresByFilter).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: 'tm-1' })
      );
    });

    it('should filter chores by status', async () => {
      vi.mocked(dataService.getChoresByFilter).mockResolvedValue([]);

      await request(app)
        .get('/api/chores?status=pending,completed')
        .expect(200);

      expect(dataService.getChoresByFilter).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['pending', 'completed'] })
      );
    });
  });

  describe('GET /api/chores/:id', () => {
    it('should return chore by id', async () => {
      const mockChore = createMockChore({ id: 'chore-1', title: 'Test Chore' });
      vi.mocked(dataService.getChoreById).mockResolvedValue(mockChore);

      const response = await request(app)
        .get('/api/chores/chore-1')
        .expect(200);

      expect(response.body.chore.title).toBe('Test Chore');
    });

    it('should return 404 for non-existent chore', async () => {
      vi.mocked(dataService.getChoreById).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/chores/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Chore not found');
    });
  });

  describe('POST /api/chores', () => {
    it('should create chore with valid data', async () => {
      const newChore = createMockChore({ title: 'New Chore', dueDate: '2026-01-25' });
      vi.mocked(dataService.createChore).mockResolvedValue(newChore);

      const response = await request(app)
        .post('/api/chores')
        .send({ title: 'New Chore', dueDate: '2026-01-25' })
        .expect(201);

      expect(response.body.chore.title).toBe('New Chore');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/chores')
        .send({ title: '' }) // Missing dueDate, empty title
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    it('should return 400 for non-existent assignee', async () => {
      vi.mocked(dataService.getTeamMemberById).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/chores')
        .send({ title: 'Chore', dueDate: '2026-01-25', assigneeId: 'non-existent' })
        .expect(400);

      expect(response.body.error).toBe('Assignee not found');
    });

    it('should accept valid assignee', async () => {
      const mockMember = createMockTeamMember({ id: 'tm-1' });
      const mockChore = createMockChore({ title: 'Assigned Chore', assigneeId: 'tm-1' });

      vi.mocked(dataService.getTeamMemberById).mockResolvedValue(mockMember);
      vi.mocked(dataService.createChore).mockResolvedValue(mockChore);

      const response = await request(app)
        .post('/api/chores')
        .send({ title: 'Assigned Chore', dueDate: '2026-01-25', assigneeId: 'tm-1' })
        .expect(201);

      expect(response.body.chore.assigneeId).toBe('tm-1');
    });
  });

  describe('PUT /api/chores/:id', () => {
    it('should update existing chore', async () => {
      const existingChore = createMockChore({ id: 'chore-1', title: 'Old Title' });
      const updatedChore = { ...existingChore, title: 'New Title' };

      vi.mocked(dataService.getChoreById).mockResolvedValue(existingChore);
      vi.mocked(dataService.updateChore).mockResolvedValue(updatedChore);

      const response = await request(app)
        .put('/api/chores/chore-1')
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body.chore.title).toBe('New Title');
    });

    it('should return 404 for non-existent chore', async () => {
      vi.mocked(dataService.getChoreById).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/chores/non-existent')
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body.error).toBe('Chore not found');
    });
  });

  describe('PATCH /api/chores/:id/status', () => {
    it('should update chore status', async () => {
      const existingChore = createMockChore({ id: 'chore-1', status: 'pending' });
      const updatedChore = { ...existingChore, status: 'completed' as const };

      vi.mocked(dataService.getChoreById).mockResolvedValue(existingChore);
      vi.mocked(dataService.updateChore).mockResolvedValue(updatedChore);

      const response = await request(app)
        .patch('/api/chores/chore-1/status')
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.chore.status).toBe('completed');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch('/api/chores/chore-1/status')
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    it('should persist virtual instance when status changes', async () => {
      const parentChore = createMockChore({ id: 'parent-chore', title: 'Parent' });
      const createdInstance = createMockChore({
        id: 'new-instance',
        title: 'Parent',
        status: 'completed',
        parentChoreId: 'parent-chore',
        isRecurrenceInstance: true,
      });

      vi.mocked(dataService.getChoreById).mockResolvedValue(parentChore);
      vi.mocked(dataService.createChore).mockResolvedValue(createdInstance);

      const response = await request(app)
        .patch('/api/chores/parent-chore::instance::2026-01-25/status')
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.chore.isRecurrenceInstance).toBe(true);
      expect(response.body.chore.parentChoreId).toBe('parent-chore');
    });

    it('should return 404 for non-existent parent in virtual instance', async () => {
      vi.mocked(dataService.getChoreById).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/chores/non-existent::instance::2026-01-25/status')
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.error).toBe('Parent chore not found');
    });
  });

  describe('DELETE /api/chores/:id', () => {
    it('should delete existing chore', async () => {
      vi.mocked(dataService.deleteChore).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/chores/chore-1')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent chore', async () => {
      vi.mocked(dataService.deleteChore).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/chores/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Chore not found');
    });

    it('should delete instances when deleteInstances=true', async () => {
      vi.mocked(dataService.deleteChore).mockResolvedValue(true);

      await request(app)
        .delete('/api/chores/chore-1?deleteInstances=true')
        .expect(200);

      expect(dataService.deleteChore).toHaveBeenCalledWith('chore-1', true);
    });
  });

  describe('GET /api/chores/calendar/:year/:month', () => {
    it('should return chores for calendar month', async () => {
      const mockChores = [
        createMockChore({ dueDate: '2026-01-15' }),
        createMockChore({ dueDate: '2026-01-20' }),
      ];

      vi.mocked(dataService.getAllChores).mockResolvedValue(mockChores);

      const response = await request(app)
        .get('/api/chores/calendar/2026/1')
        .expect(200);

      expect(response.body.year).toBe(2026);
      expect(response.body.month).toBe(1);
      expect(response.body.chores).toBeDefined();
    });

    it('should return 400 for invalid year', async () => {
      const response = await request(app)
        .get('/api/chores/calendar/invalid/1')
        .expect(400);

      expect(response.body.error).toBe('Invalid parameters');
    });

    it('should return 400 for invalid month', async () => {
      const response = await request(app)
        .get('/api/chores/calendar/2026/13')
        .expect(400);

      expect(response.body.error).toBe('Invalid parameters');
    });
  });
});
