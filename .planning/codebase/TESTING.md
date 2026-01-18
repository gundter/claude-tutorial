# Testing Patterns

**Analysis Date:** 2026-01-18

## Test Framework

**Runner:**
- Not configured - No test framework installed

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands available
# Tests not yet implemented in this project
```

## Current Testing Status

**Backend:** No tests

**Frontend:** No tests

**Test Dependencies:** None installed in `package.json` files

## Recommended Test Setup

Based on the project stack, the following setup is recommended:

**Backend (Express/TypeScript):**
- Framework: Vitest or Jest with ts-jest
- HTTP testing: Supertest
- Config location: `backend/vitest.config.ts` or `backend/jest.config.ts`

**Frontend (Vue 3/TypeScript):**
- Framework: Vitest (integrates with Vite)
- Component testing: @vue/test-utils
- Config location: `frontend/vitest.config.ts`

## Test File Organization

**Recommended Location:**
- Co-located pattern: Tests alongside source files
- Backend: `backend/src/**/*.test.ts`
- Frontend: `frontend/src/**/*.test.ts`

**Naming:**
- Pattern: `{filename}.test.ts` or `{filename}.spec.ts`
- Examples:
  - `backend/src/services/dataService.test.ts`
  - `backend/src/controllers/choreController.test.ts`
  - `frontend/src/stores/choreStore.test.ts`
  - `frontend/src/components/calendar/CalendarHeader.test.ts`

**Structure:**
```
backend/src/
├── services/
│   ├── dataService.ts
│   └── dataService.test.ts
├── controllers/
│   ├── choreController.ts
│   └── choreController.test.ts
frontend/src/
├── stores/
│   ├── choreStore.ts
│   └── choreStore.test.ts
├── components/
│   └── calendar/
│       ├── CalendarHeader.vue
│       └── CalendarHeader.test.ts
```

## Test Structure

**Recommended Suite Organization:**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ChoreController', () => {
  describe('getAllChores', () => {
    it('should return all chores', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should filter by assigneeId when provided', async () => {
      // ...
    });
  });

  describe('createChore', () => {
    it('should create a chore with valid data', async () => {
      // ...
    });

    it('should return 400 for invalid data', async () => {
      // ...
    });
  });
});
```

**Patterns:**
- Use `describe` blocks to group related tests
- Name test suites after the module/function being tested
- Use clear, behavior-focused `it` descriptions
- Follow Arrange-Act-Assert pattern

## Mocking

**Recommended Framework:** Vitest's built-in mocking (`vi`)

**Patterns for Backend:**

```typescript
// Mock the data service
vi.mock('../services/dataService.js', () => ({
  getAllChores: vi.fn(),
  getChoreById: vi.fn(),
  createChore: vi.fn(),
}));

import * as dataService from '../services/dataService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

it('should return chores from dataService', async () => {
  const mockChores = [{ id: 'chore-1', title: 'Test Chore' }];
  vi.mocked(dataService.getAllChores).mockResolvedValue(mockChores);

  // ... test code
});
```

**Patterns for Frontend (Vue Stores):**

```typescript
// Mock the API
vi.mock('@/api/choresApi', () => ({
  choresApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { choresApi } from '@/api/choresApi';
import { useChoreStore } from './choreStore';
import { setActivePinia, createPinia } from 'pinia';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});
```

**What to Mock:**
- External API calls (`choresApi`, `teamApi`)
- Data service functions (file system operations)
- External libraries when needed (date-fns for deterministic dates)
- UUID generation for predictable IDs

**What NOT to Mock:**
- Zod schemas (test actual validation)
- Pure utility functions
- Vue reactivity system
- Router for integration tests

## Fixtures and Factories

**Recommended Test Data Pattern:**

```typescript
// backend/src/__fixtures__/chores.ts
import type { Chore } from '../types/index.js';

export function createMockChore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: 'chore-test-123',
    title: 'Test Chore',
    description: null,
    assigneeId: null,
    status: 'pending',
    dueDate: '2026-01-18',
    recurrence: null,
    parentChoreId: null,
    isRecurrenceInstance: false,
    createdAt: '2026-01-18T00:00:00.000Z',
    updatedAt: '2026-01-18T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'tm-test-123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: '#3B82F6',
    createdAt: '2026-01-18T00:00:00.000Z',
    updatedAt: '2026-01-18T00:00:00.000Z',
    ...overrides,
  };
}
```

**Location:**
- `backend/src/__fixtures__/` - Backend test fixtures
- `frontend/src/__fixtures__/` - Frontend test fixtures

## Coverage

**Requirements:** None enforced currently

**Recommended Configuration:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.test.ts'],
    },
  },
});
```

**View Coverage:**
```bash
npm run test:coverage  # After adding script
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, services, store actions
- Approach: Mock external dependencies, test logic in isolation
- Examples:
  - `dataService.getChoresByFilter()` with various filter combinations
  - `createRecurrenceRule()` with different recurrence configs
  - Store actions with mocked API responses

**Integration Tests:**
- Scope: API endpoints end-to-end
- Approach: Use Supertest to make HTTP requests, mock or use test database
- Examples:
  - POST `/api/chores` creates chore and returns correct response
  - GET `/api/chores/calendar/:year/:month` returns chores for month

**Component Tests (Frontend):**
- Scope: Vue components in isolation
- Approach: Use @vue/test-utils to mount components
- Examples:
  - `CalendarHeader` emits events when buttons clicked
  - `StatusBadge` displays correct label for each status

**E2E Tests:**
- Framework: Not configured (recommend Playwright or Cypress)
- Scope: Full user workflows

## Common Patterns

**Async Testing:**

```typescript
it('should fetch chores successfully', async () => {
  const mockChores = [createMockChore()];
  vi.mocked(choresApi.getAll).mockResolvedValue(mockChores);

  const store = useChoreStore();
  await store.fetchAll();

  expect(store.chores).toEqual(mockChores);
  expect(store.loading).toBe(false);
  expect(store.error).toBeNull();
});
```

**Error Testing:**

```typescript
it('should handle fetch errors', async () => {
  vi.mocked(choresApi.getAll).mockRejectedValue(new Error('Network error'));

  const store = useChoreStore();

  await expect(store.fetchAll()).rejects.toThrow('Network error');
  expect(store.error).toBe('Network error');
  expect(store.loading).toBe(false);
});
```

**API Endpoint Testing (with Supertest):**

```typescript
import request from 'supertest';
import app from '../index.js';

describe('POST /api/chores', () => {
  it('should create a chore with valid data', async () => {
    const response = await request(app)
      .post('/api/chores')
      .send({
        title: 'New Chore',
        dueDate: '2026-01-20',
      })
      .expect(201);

    expect(response.body.chore).toMatchObject({
      title: 'New Chore',
      dueDate: '2026-01-20',
      status: 'pending',
    });
  });

  it('should return 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/chores')
      .send({ title: '' })
      .expect(400);

    expect(response.body.error).toBe('Validation error');
  });
});
```

**Vue Component Testing:**

```typescript
import { mount } from '@vue/test-utils';
import CalendarHeader from './CalendarHeader.vue';

describe('CalendarHeader', () => {
  it('should display month label', () => {
    const wrapper = mount(CalendarHeader, {
      props: { monthLabel: 'January 2026' },
    });

    expect(wrapper.text()).toContain('January 2026');
  });

  it('should emit prev when prev button clicked', async () => {
    const wrapper = mount(CalendarHeader, {
      props: { monthLabel: 'January 2026' },
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('prev')).toBeTruthy();
  });
});
```

## Priority Test Areas

Based on codebase analysis, prioritize testing for:

1. **Backend Controllers** (`backend/src/controllers/`)
   - Input validation with Zod schemas
   - Error responses for edge cases
   - Correct HTTP status codes

2. **Recurrence Service** (`backend/src/services/recurrenceService.ts`)
   - `buildRRule()` with various configurations
   - `generateChoreInstances()` date range handling
   - Edge cases: month boundaries, leap years

3. **Data Service** (`backend/src/services/dataService.ts`)
   - CRUD operations
   - Filter logic in `getChoresByFilter()`
   - File system error handling

4. **Frontend Stores** (`frontend/src/stores/`)
   - State mutations after API calls
   - Error state management
   - Filter application

5. **Vue Components** (Critical UI)
   - `ChoreModal.vue` - Form validation
   - `CalendarGrid.vue` - Day rendering
   - `RecurrenceSelector.vue` - Complex UI logic

---

*Testing analysis: 2026-01-18*
