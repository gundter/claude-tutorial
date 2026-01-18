import type { TeamMember } from '@/types';

export function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  const now = '2026-01-18T00:00:00.000Z';
  return {
    id: 'tm-test-123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: '#3B82F6',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const mockTeamMembers = {
  alice: createMockTeamMember({
    id: 'tm-alice-001',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar: '#EF4444',
  }),
  bob: createMockTeamMember({
    id: 'tm-bob-002',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: '#10B981',
  }),
  charlie: createMockTeamMember({
    id: 'tm-charlie-003',
    name: 'Charlie Brown',
    email: null,
    avatar: '#F59E0B',
  }),
};
