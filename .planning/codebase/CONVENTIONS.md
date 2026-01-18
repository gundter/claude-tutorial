# Coding Conventions

**Analysis Date:** 2026-01-18

## Naming Patterns

**Files:**
- Backend: camelCase for all TypeScript files (e.g., `dataService.ts`, `choreController.ts`, `teamMemberRoutes.ts`)
- Frontend: camelCase for TypeScript files (e.g., `choreStore.ts`, `choresApi.ts`)
- Frontend: PascalCase for Vue components (e.g., `CalendarHeader.vue`, `ChoreModal.vue`)
- Index files: `index.ts` for barrel exports in types, schemas, routes, api

**Functions:**
- camelCase for all functions (e.g., `getAllChores`, `createTeamMember`, `fetchForCalendar`)
- Async functions: Use verb prefix (`fetch`, `create`, `update`, `delete`, `get`)
- Event handlers in Vue: `handle` prefix (e.g., `handleDayClick`, `handleChoreClick`, `handleChoreSaved`)
- Navigation functions: `goTo` prefix (e.g., `goToNextMonth`, `goToPrevMonth`, `goToToday`)

**Variables:**
- camelCase for all variables
- State refs in Vue stores: noun-based (e.g., `chores`, `loading`, `error`, `filters`)
- Computed properties: descriptive nouns or getters (e.g., `filteredChores`, `choresByDate`, `getById`)

**Types/Interfaces:**
- PascalCase for all types and interfaces
- Request types: `{Action}{Entity}Request` (e.g., `CreateChoreRequest`, `UpdateTeamMemberRequest`)
- Input types (from Zod): `{Action}{Entity}Input` (e.g., `CreateChoreInput`, `UpdateChoreInput`)
- Response types: `{Purpose}Response` (e.g., `ApiResponse`, `ReminderCheckResponse`)
- Entity types: Simple PascalCase nouns (e.g., `Chore`, `TeamMember`, `RecurrenceRule`)

**Constants:**
- UPPER_SNAKE_CASE for constants (e.g., `DATA_DIR`, `TEAM_MEMBERS_FILE`, `WEEKDAY_MAP`, `FREQ_MAP`)

**IDs:**
- Prefixed UUIDs for entity IDs:
  - Team members: `tm-{uuid}` (e.g., `tm-550e8400-e29b-41d4-a716-446655440000`)
  - Chores: `chore-{uuid}` (e.g., `chore-550e8400-e29b-41d4-a716-446655440000`)
  - Virtual instances: `{parentId}-instance-{date}` (e.g., `chore-xxx-instance-2026-01-18`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier/ESLint not present in project)
- Indentation: 2 spaces
- Semicolons: Required at end of statements
- Single quotes for strings
- Trailing commas in multi-line arrays/objects

**TypeScript Strict Mode:**
- `strict: true` enabled in both frontend and backend
- Frontend additional rules: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

**Line Length:**
- No enforced maximum, but lines typically stay under 120 characters

## Import Organization

**Order:**
1. External library imports (e.g., `express`, `vue`, `date-fns`)
2. Internal absolute imports using path aliases (e.g., `@/stores/choreStore`)
3. Relative imports for local files (e.g., `./dataService.js`, `../types/index.js`)

**Backend imports:**
```typescript
import 'express-async-errors';          // Side-effect imports first
import express from 'express';          // External libraries
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth } from 'date-fns';
import * as dataService from '../services/dataService.js';  // Internal with .js extension
import { createChoreSchema } from '../schemas/index.js';
import type { Chore, ChoreStatus } from '../types/index.js'; // Type-only imports
```

**Frontend imports:**
```typescript
import { defineStore } from 'pinia';                    // External libraries
import { ref, computed, onMounted, watch } from 'vue';
import { format, startOfMonth } from 'date-fns';
import { useChoreStore } from '@/stores/choreStore';    // Path alias imports
import type { Chore, CalendarDay } from '@/types';      // Type imports
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'; // Components
```

**Path Aliases:**
- Frontend: `@/*` maps to `./src/*` (configured in `frontend/tsconfig.json`)
- Backend: No path aliases, uses relative imports with `.js` extension for ESM

**ESM Imports:**
- Backend requires `.js` extension on relative imports (NodeNext module resolution)
- Example: `import * as dataService from '../services/dataService.js';`

## Error Handling

**Backend Patterns:**

1. **Validation errors** - Return 400 with Zod error details:
```typescript
const parseResult = createChoreSchema.safeParse(req.body);
if (!parseResult.success) {
  res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
  return;
}
```

2. **Not found errors** - Return 404 with simple message:
```typescript
if (!chore) {
  res.status(404).json({ error: 'Chore not found' });
  return;
}
```

3. **Business logic errors** - Return 400 with descriptive message:
```typescript
if (chores.length > 0) {
  res.status(400).json({
    error: 'Cannot delete team member with assigned chores',
    assignedChoreCount: chores.length,
  });
  return;
}
```

4. **Global error handler** - Catches unhandled errors:
```typescript
// Location: backend/src/middleware/errorHandler.ts
export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  });
}
```

**Frontend Patterns:**

1. **Store error handling** - Catch, store, and re-throw:
```typescript
async function fetchAll() {
  loading.value = true;
  error.value = null;
  try {
    chores.value = await choresApi.getAll();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch chores';
    throw e;
  } finally {
    loading.value = false;
  }
}
```

2. **API error interceptor** - Log and pass through:
```typescript
// Location: frontend/src/api/index.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);
```

## Logging

**Framework:** Console logging (no dedicated logging library)

**Patterns:**
- Backend: `console.log()` for info, `console.error()` for errors
- Error handler logs both message and stack trace:
```typescript
console.error('Error:', err.message);
console.error('Stack:', err.stack);
```

**When to Log:**
- Server startup: Log port and URL
- API errors: Log error message in interceptor
- Unhandled errors: Log full error with stack trace

## Comments

**When to Comment:**
- JSDoc for exported functions that need explanation
- Inline comments for non-obvious business logic
- Section comments to organize code (e.g., `// State`, `// Getters`, `// Actions`)

**JSDoc Pattern:**
```typescript
/**
 * Get chores that are due within the specified number of hours
 */
export async function getUpcomingChores(hoursAhead: number = 24): Promise<Chore[]> {
```

**Section Comments in Vue Stores:**
```typescript
// State
const chores = ref<Chore[]>([]);

// Getters
const getById = computed(() => { ... });

// Actions
async function fetchAll() { ... }
```

**Route Comments:**
```typescript
// GET /api/chores
export async function getAllChores(req: Request, res: Response): Promise<void> {
```

## Function Design

**Size:** Functions typically 10-50 lines, larger functions acceptable for complex controller actions

**Parameters:**
- Destructure request data from validated parse results
- Use optional parameters with defaults: `function getUpcomingChores(hoursAhead: number = 24)`
- Use objects for multiple optional parameters

**Return Values:**
- Controllers: `Promise<void>` (response sent via `res.json()`)
- Services: Return data directly, `Promise<T>` or `Promise<T | null>`
- API methods: Return unwrapped data from response

**Async Functions:**
- All database/API operations are async
- Use `async/await` pattern exclusively (no raw Promises)
- Always handle errors with try/catch in stores

## Module Design

**Exports:**
- Named exports for functions and types
- Default exports for Vue components, router, and Express app
- Barrel exports from `index.ts` files

**Backend Module Pattern:**
```typescript
// Services: Named function exports
export async function getAllChores(): Promise<Chore[]> { ... }
export async function getChoreById(id: string): Promise<Chore | null> { ... }

// Controllers: Named function exports
export async function getAllChores(req: Request, res: Response): Promise<void> { ... }

// Routes: Default export of router
const router = Router();
router.get('/', choreController.getAllChores);
export default router;
```

**Frontend Module Pattern:**
```typescript
// Stores: Named export of composable
export const useChoreStore = defineStore('chores', () => { ... });

// API: Named export of API object
export const choresApi = {
  async getAll(): Promise<Chore[]> { ... },
  async create(data: CreateChoreInput): Promise<Chore> { ... },
};

// Components: Default export (implicit in SFC)
```

**Barrel Files:**
- `backend/src/types/index.ts` - All type exports
- `backend/src/schemas/index.ts` - All Zod schema exports
- `backend/src/routes/index.ts` - Combined router
- `frontend/src/api/index.ts` - Axios instance (not barrel, but entry point)
- `frontend/src/types/index.ts` - All type exports
- `frontend/src/router/index.ts` - Vue Router instance

## Vue Component Conventions

**Script Setup:**
- Always use `<script setup lang="ts">`
- Props defined with `defineProps<{ ... }>()`
- Emits defined with `defineEmits<{ ... }>()`

**Component Structure:**
```vue
<script setup lang="ts">
// Imports
import { ref, computed } from 'vue';
import type { Chore } from '@/types';

// Props and Emits
defineProps<{ ... }>();
const emit = defineEmits<{ ... }>();

// State and computed
const localState = ref(...);

// Functions
function handleAction() { ... }
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Scoped styles using CSS variables */
</style>
```

**Prop Naming:**
- kebab-case in templates: `:month-label="monthLabel"`
- camelCase in script: `monthLabel: string`

**Event Naming:**
- Verb or past-tense verb: `@prev`, `@next`, `@saved`, `@deleted`, `@close`
- Component emits use simple names: `emit('prev')`, `emit('saved')`

## CSS Conventions

**Approach:** Global CSS with CSS custom properties (variables)

**Location:** `frontend/src/styles/main.css`

**Naming:**
- BEM-like for components: `.calendar-day`, `.calendar-day__number`, `.calendar-day--today`
- Modifier pattern: `--{modifier}` (e.g., `--pending`, `--completed`, `--other-month`)
- Utility classes: Simple descriptive names (e.g., `.flex`, `.items-center`, `.gap-md`)

**CSS Variables:**
- Colors: `--color-{purpose}` (e.g., `--color-primary`, `--color-pending`, `--color-text`)
- Spacing: `--spacing-{size}` (e.g., `--spacing-sm`, `--spacing-md`, `--spacing-lg`)
- Typography: `--font-size-{size}`, `--font-family`
- Borders: `--radius-{size}`
- Shadows: `--shadow-{size}`

**Scoped Styles:**
- Use `<style scoped>` in Vue components for component-specific styles
- Reference global CSS variables in scoped styles

---

*Convention analysis: 2026-01-18*
