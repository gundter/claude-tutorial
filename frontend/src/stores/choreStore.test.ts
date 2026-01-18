import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChoreStore } from './choreStore';
import { choresApi } from '@/api/choresApi';
import { createMockChore } from '@/__fixtures__/chores';

// Mock the API
vi.mock('@/api/choresApi', () => ({
  choresApi: {
    getAll: vi.fn(),
    getForCalendar: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('choreStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty chores array', () => {
      const store = useChoreStore();
      expect(store.chores).toEqual([]);
    });

    it('should have null currentChore', () => {
      const store = useChoreStore();
      expect(store.currentChore).toBeNull();
    });

    it('should have loading false', () => {
      const store = useChoreStore();
      expect(store.loading).toBe(false);
    });

    it('should have null error', () => {
      const store = useChoreStore();
      expect(store.error).toBeNull();
    });

    it('should have default filters', () => {
      const store = useChoreStore();
      expect(store.filters).toEqual({ assigneeId: null, status: null });
    });
  });

  describe('fetchAll', () => {
    it('should fetch and store chores', async () => {
      const mockChores = [
        createMockChore({ id: 'chore-1', title: 'Chore 1' }),
        createMockChore({ id: 'chore-2', title: 'Chore 2' }),
      ];
      vi.mocked(choresApi.getAll).mockResolvedValue(mockChores);

      const store = useChoreStore();
      await store.fetchAll();

      expect(store.chores).toHaveLength(2);
      expect(store.chores[0].title).toBe('Chore 1');
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should set loading during fetch', async () => {
      vi.mocked(choresApi.getAll).mockImplementation(() => new Promise(() => {}));

      const store = useChoreStore();
      store.fetchAll();

      expect(store.loading).toBe(true);
    });

    it('should set error on failure', async () => {
      vi.mocked(choresApi.getAll).mockRejectedValue(new Error('Network error'));

      const store = useChoreStore();

      await expect(store.fetchAll()).rejects.toThrow('Network error');
      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });
  });

  describe('create', () => {
    it('should create chore and add to state', async () => {
      const newChore = createMockChore({ id: 'new-chore', title: 'New Chore' });
      vi.mocked(choresApi.create).mockResolvedValue(newChore);

      const store = useChoreStore();
      const result = await store.create({ title: 'New Chore', dueDate: '2026-01-25' });

      expect(result.id).toBe('new-chore');
      expect(store.chores).toContainEqual(newChore);
    });

    it('should set error on failure', async () => {
      vi.mocked(choresApi.create).mockRejectedValue(new Error('Create failed'));

      const store = useChoreStore();

      await expect(store.create({ title: 'Test', dueDate: '2026-01-25' })).rejects.toThrow();
      // Store uses the error message from the exception
      expect(store.error).toBe('Create failed');
    });
  });

  describe('update', () => {
    it('should update chore in state', async () => {
      const existingChore = createMockChore({ id: 'chore-1', title: 'Old Title' });
      const updatedChore = { ...existingChore, title: 'New Title' };

      vi.mocked(choresApi.update).mockResolvedValue(updatedChore);

      const store = useChoreStore();
      store.chores = [existingChore];

      await store.update('chore-1', { title: 'New Title' });

      expect(store.chores[0].title).toBe('New Title');
    });

    it('should update currentChore if it matches', async () => {
      const existingChore = createMockChore({ id: 'chore-1', title: 'Old Title' });
      const updatedChore = { ...existingChore, title: 'New Title' };

      vi.mocked(choresApi.update).mockResolvedValue(updatedChore);

      const store = useChoreStore();
      store.chores = [existingChore];
      store.currentChore = existingChore;

      await store.update('chore-1', { title: 'New Title' });

      expect(store.currentChore?.title).toBe('New Title');
    });
  });

  describe('updateStatus', () => {
    it('should update status in state', async () => {
      const existingChore = createMockChore({ id: 'chore-1', status: 'pending' });
      const updatedChore = { ...existingChore, status: 'completed' as const };

      vi.mocked(choresApi.updateStatus).mockResolvedValue(updatedChore);

      const store = useChoreStore();
      store.chores = [existingChore];

      await store.updateStatus('chore-1', 'completed');

      expect(store.chores[0].status).toBe('completed');
    });

    it('should add persisted virtual instance to state', async () => {
      const newInstance = createMockChore({
        id: 'new-instance',
        parentChoreId: 'parent',
        isRecurrenceInstance: true,
      });

      vi.mocked(choresApi.updateStatus).mockResolvedValue(newInstance);

      const store = useChoreStore();
      store.chores = [];

      await store.updateStatus('parent::instance::2026-01-25', 'completed');

      expect(store.chores).toContainEqual(newInstance);
    });
  });

  describe('remove', () => {
    it('should remove chore from state', async () => {
      vi.mocked(choresApi.delete).mockResolvedValue(undefined);

      const store = useChoreStore();
      store.chores = [
        createMockChore({ id: 'chore-1' }),
        createMockChore({ id: 'chore-2' }),
      ];

      await store.remove('chore-1');

      expect(store.chores).toHaveLength(1);
      expect(store.chores[0].id).toBe('chore-2');
    });

    it('should remove instances when deleteInstances is true', async () => {
      vi.mocked(choresApi.delete).mockResolvedValue(undefined);

      const store = useChoreStore();
      store.chores = [
        createMockChore({ id: 'parent' }),
        createMockChore({ id: 'instance-1', parentChoreId: 'parent' }),
        createMockChore({ id: 'instance-2', parentChoreId: 'parent' }),
        createMockChore({ id: 'other' }),
      ];

      await store.remove('parent', true);

      expect(store.chores).toHaveLength(1);
      expect(store.chores[0].id).toBe('other');
    });

    it('should clear currentChore if it was deleted', async () => {
      vi.mocked(choresApi.delete).mockResolvedValue(undefined);

      const chore = createMockChore({ id: 'chore-1' });
      const store = useChoreStore();
      store.chores = [chore];
      store.currentChore = chore;

      await store.remove('chore-1');

      expect(store.currentChore).toBeNull();
    });
  });

  describe('filters', () => {
    it('should set filters', () => {
      const store = useChoreStore();
      store.setFilters({ assigneeId: 'tm-1' });

      expect(store.filters.assigneeId).toBe('tm-1');
    });

    it('should clear filters', () => {
      const store = useChoreStore();
      store.setFilters({ assigneeId: 'tm-1', status: ['pending'] });
      store.clearFilters();

      expect(store.filters).toEqual({ assigneeId: null, status: null });
    });
  });

  describe('filteredChores', () => {
    it('should filter by assigneeId', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ id: 'c1', assigneeId: 'tm-1' }),
        createMockChore({ id: 'c2', assigneeId: 'tm-2' }),
        createMockChore({ id: 'c3', assigneeId: 'tm-1' }),
      ];

      store.setFilters({ assigneeId: 'tm-1' });

      expect(store.filteredChores).toHaveLength(2);
      expect(store.filteredChores.every(c => c.assigneeId === 'tm-1')).toBe(true);
    });

    it('should filter by status', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ id: 'c1', status: 'pending' }),
        createMockChore({ id: 'c2', status: 'completed' }),
        createMockChore({ id: 'c3', status: 'pending' }),
      ];

      store.setFilters({ status: ['pending'] });

      expect(store.filteredChores).toHaveLength(2);
      expect(store.filteredChores.every(c => c.status === 'pending')).toBe(true);
    });

    it('should combine filters', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ id: 'c1', assigneeId: 'tm-1', status: 'pending' }),
        createMockChore({ id: 'c2', assigneeId: 'tm-1', status: 'completed' }),
        createMockChore({ id: 'c3', assigneeId: 'tm-2', status: 'pending' }),
      ];

      store.setFilters({ assigneeId: 'tm-1', status: ['pending'] });

      expect(store.filteredChores).toHaveLength(1);
      expect(store.filteredChores[0].id).toBe('c1');
    });
  });

  describe('choresByDate', () => {
    it('should group chores by date', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ id: 'c1', dueDate: '2026-01-20' }),
        createMockChore({ id: 'c2', dueDate: '2026-01-21' }),
        createMockChore({ id: 'c3', dueDate: '2026-01-20' }),
      ];

      const grouped = store.choresByDate;

      expect(grouped['2026-01-20']).toHaveLength(2);
      expect(grouped['2026-01-21']).toHaveLength(1);
    });
  });

  describe('status getters', () => {
    it('should return pending chores', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ status: 'pending' }),
        createMockChore({ status: 'completed' }),
        createMockChore({ status: 'pending' }),
      ];

      expect(store.pendingChores).toHaveLength(2);
    });

    it('should return in progress chores', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ status: 'in_progress' }),
        createMockChore({ status: 'completed' }),
      ];

      expect(store.inProgressChores).toHaveLength(1);
    });

    it('should return completed chores', () => {
      const store = useChoreStore();
      store.chores = [
        createMockChore({ status: 'pending' }),
        createMockChore({ status: 'completed' }),
        createMockChore({ status: 'completed' }),
      ];

      expect(store.completedChores).toHaveLength(2);
    });
  });
});
