import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import * as dataService from '../services/dataService.js';
import { createMockTeamMember } from '../__fixtures__/teamMembers.js';

// Mock the data service
vi.mock('../services/dataService.js');

describe('Team Member Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/team-members', () => {
    it('should return all team members', async () => {
      const mockMembers = [
        createMockTeamMember({ id: 'tm-1', name: 'Alice' }),
        createMockTeamMember({ id: 'tm-2', name: 'Bob' }),
      ];

      vi.mocked(dataService.getAllTeamMembers).mockResolvedValue(mockMembers);

      const response = await request(app)
        .get('/api/team-members')
        .expect(200);

      expect(response.body.teamMembers).toHaveLength(2);
      expect(response.body.teamMembers[0].name).toBe('Alice');
    });
  });

  describe('GET /api/team-members/:id', () => {
    it('should return team member by id', async () => {
      const mockMember = createMockTeamMember({ id: 'tm-1', name: 'Alice' });
      vi.mocked(dataService.getTeamMemberById).mockResolvedValue(mockMember);

      const response = await request(app)
        .get('/api/team-members/tm-1')
        .expect(200);

      expect(response.body.teamMember.name).toBe('Alice');
    });

    it('should return 404 for non-existent member', async () => {
      vi.mocked(dataService.getTeamMemberById).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/team-members/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Team member not found');
    });
  });

  describe('POST /api/team-members', () => {
    it('should create team member with valid data', async () => {
      const newMember = createMockTeamMember({ name: 'Charlie' });
      vi.mocked(dataService.createTeamMember).mockResolvedValue(newMember);

      const response = await request(app)
        .post('/api/team-members')
        .send({ name: 'Charlie' })
        .expect(201);

      expect(response.body.teamMember.name).toBe('Charlie');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/team-members')
        .send({ name: '' }) // Empty name
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    it('should accept optional email', async () => {
      const newMember = createMockTeamMember({ name: 'Charlie', email: 'charlie@example.com' });
      vi.mocked(dataService.createTeamMember).mockResolvedValue(newMember);

      const response = await request(app)
        .post('/api/team-members')
        .send({ name: 'Charlie', email: 'charlie@example.com' })
        .expect(201);

      expect(response.body.teamMember.email).toBe('charlie@example.com');
    });
  });

  describe('PUT /api/team-members/:id', () => {
    it('should update existing team member', async () => {
      const updatedMember = createMockTeamMember({ id: 'tm-1', name: 'Alicia' });
      vi.mocked(dataService.updateTeamMember).mockResolvedValue(updatedMember);

      const response = await request(app)
        .put('/api/team-members/tm-1')
        .send({ name: 'Alicia' })
        .expect(200);

      expect(response.body.teamMember.name).toBe('Alicia');
    });

    it('should return 404 for non-existent member', async () => {
      vi.mocked(dataService.updateTeamMember).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/team-members/non-existent')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.error).toBe('Team member not found');
    });
  });

  describe('DELETE /api/team-members/:id', () => {
    it('should delete team member without chores', async () => {
      vi.mocked(dataService.getChoresByFilter).mockResolvedValue([]);
      vi.mocked(dataService.deleteTeamMember).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/team-members/tm-1')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 400 when member has assigned chores', async () => {
      vi.mocked(dataService.getChoresByFilter).mockResolvedValue([
        { id: 'chore-1' } as any,
        { id: 'chore-2' } as any,
      ]);

      const response = await request(app)
        .delete('/api/team-members/tm-1')
        .expect(400);

      expect(response.body.error).toBe('Cannot delete team member with assigned chores');
      expect(response.body.assignedChoreCount).toBe(2);
    });

    it('should return 404 for non-existent member', async () => {
      vi.mocked(dataService.getChoresByFilter).mockResolvedValue([]);
      vi.mocked(dataService.deleteTeamMember).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/team-members/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Team member not found');
    });
  });
});
