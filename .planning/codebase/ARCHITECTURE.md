# Architecture

**Analysis Date:** 2026-01-18

## Pattern Overview

**Overall:** Monorepo with Client-Server Architecture (Vue SPA + Express REST API)

**Key Characteristics:**
- Separate frontend (Vue 3) and backend (Express) workspaces in npm monorepo
- RESTful API with JSON file persistence (no database)
- Pinia stores manage frontend state and API communication
- Layered backend with routes -> controllers -> services -> data access
- Shared type definitions duplicated in both frontend and backend

## Layers

**Frontend - Views:**
- Purpose: Page-level components that compose UI and manage page state
- Location: `frontend/src/views/`
- Contains: `CalendarPage.vue`, `ChoresListPage.vue`, `TeamPage.vue`
- Depends on: Stores, Components
- Used by: Vue Router

**Frontend - Components:**
- Purpose: Reusable UI building blocks organized by feature
- Location: `frontend/src/components/`
- Contains: Feature-grouped components (calendar/, chores/, filters/, reminders/)
- Depends on: Stores, Types
- Used by: Views, other Components

**Frontend - Stores:**
- Purpose: State management and API orchestration using Pinia
- Location: `frontend/src/stores/`
- Contains: `choreStore.ts`, `teamStore.ts`, `reminderStore.ts`
- Depends on: API layer, Types
- Used by: Views, Components

**Frontend - API:**
- Purpose: HTTP client wrappers for backend communication
- Location: `frontend/src/api/`
- Contains: `index.ts` (axios config), `choresApi.ts`, `teamApi.ts`, `remindersApi.ts`
- Depends on: Types, axios
- Used by: Stores

**Backend - Routes:**
- Purpose: HTTP route definitions mapping URLs to controllers
- Location: `backend/src/routes/`
- Contains: `index.ts`, `choreRoutes.ts`, `teamMemberRoutes.ts`, `reminderRoutes.ts`
- Depends on: Controllers
- Used by: Express app

**Backend - Controllers:**
- Purpose: Request handling, validation, response formatting
- Location: `backend/src/controllers/`
- Contains: `choreController.ts`, `teamMemberController.ts`, `reminderController.ts`
- Depends on: Services, Schemas, Types
- Used by: Routes

**Backend - Services:**
- Purpose: Business logic and data operations
- Location: `backend/src/services/`
- Contains: `dataService.ts` (CRUD), `reminderService.ts`, `recurrenceService.ts`
- Depends on: Types, Data files
- Used by: Controllers

**Backend - Schemas:**
- Purpose: Request validation using Zod
- Location: `backend/src/schemas/`
- Contains: `index.ts` with all validation schemas
- Depends on: Zod
- Used by: Controllers

**Backend - Types:**
- Purpose: TypeScript type definitions
- Location: `backend/src/types/index.ts`
- Contains: Entity interfaces, request/response types
- Depends on: Nothing
- Used by: All backend layers

## Data Flow

**Create Chore Flow:**

1. User fills form in `ChoreModal.vue` component
2. Component calls `choreStore.create(data)` action
3. Store calls `choresApi.create(data)` which POSTs to `/api/chores`
4. Express routes to `choreController.createChore`
5. Controller validates with `createChoreSchema.safeParse()`
6. Controller calls `dataService.createChore()` to persist
7. Data service reads `chores.json`, appends chore, writes back
8. Response flows back through layers to update store state

**Calendar Data Flow:**

1. `CalendarPage.vue` calls `choreStore.fetchForCalendar(year, month)`
2. Store calls `choresApi.getForCalendar()` with filters
3. Controller generates virtual instances from recurring chores using `generateChoreInstances()`
4. Combines regular chores, persisted instances, and virtual instances
5. Returns sorted array to frontend
6. Store updates `chores` ref, computed `choresByDate` groups by date
7. `CalendarGrid.vue` renders using grouped data

**State Management:**
- Pinia stores use Composition API style (`defineStore` with setup function)
- State is reactive refs (`ref<Chore[]>([])`)
- Getters are computed properties
- Actions are async functions that call API and update state
- Loading/error states tracked per store

## Key Abstractions

**Chore Entity:**
- Purpose: Represents a task with optional recurrence
- Examples: `backend/src/types/index.ts`, `frontend/src/types/index.ts`
- Pattern: Has `parentChoreId` for recurrence instances, `isRecurrenceInstance` flag

**Recurrence Rule:**
- Purpose: Defines repeating schedule using rrule library
- Examples: `RecurrenceRule` interface in types
- Pattern: Stores both structured data and `rruleString` for regeneration

**Virtual Instances:**
- Purpose: Ephemeral chore instances generated from recurrence rules (not persisted until modified)
- Examples: `choreController.getChoresForCalendar()` generates them
- Pattern: ID format `{parentId}-instance-{date}`, converted to persisted on status change

**Data Service:**
- Purpose: Abstraction over JSON file storage
- Examples: `backend/src/services/dataService.ts`
- Pattern: Async functions wrapping fs read/write with type safety

## Entry Points

**Frontend Entry:**
- Location: `frontend/src/main.ts`
- Triggers: Browser loads app
- Responsibilities: Creates Vue app, installs Pinia and Router, mounts to DOM

**Backend Entry:**
- Location: `backend/src/index.ts`
- Triggers: `npm run dev:backend` or `npm start`
- Responsibilities: Configures Express middleware, mounts routes, starts HTTP server

**API Routes Entry:**
- Location: `backend/src/routes/index.ts`
- Triggers: HTTP requests to `/api/*`
- Responsibilities: Aggregates all resource routes under `/api` prefix

## Error Handling

**Strategy:** Centralized error middleware with validation at controller level

**Patterns:**
- Backend uses `express-async-errors` to catch async errors automatically
- Controllers return early with 400/404 responses for validation/not-found
- Global `errorHandler` middleware catches unhandled errors, returns JSON
- Frontend stores catch errors, store in `error` ref, rethrow for caller handling
- Axios interceptor logs errors, extracts message from response

**Backend Error Response Format:**
```typescript
// Validation error
{ error: 'Validation error', details: ZodError[] }

// Not found
{ error: 'Chore not found' }

// Server error (dev mode includes stack)
{ error: 'message', stack: '...' }
```

## Cross-Cutting Concerns

**Logging:**
- Backend uses `morgan('dev')` for HTTP request logging
- Console.error in error handler for stack traces
- Frontend logs API errors to console

**Validation:**
- Backend: Zod schemas in `backend/src/schemas/index.ts`
- Controller validates at start, returns 400 with details on failure
- Frontend: Minimal client-side validation in components

**Authentication:**
- None implemented - open API
- CORS configured for localhost:5173 origin

**Security:**
- Helmet middleware adds security headers
- CORS restricts origins
- No authentication/authorization

**API Proxy:**
- Vite dev server proxies `/api` to backend at localhost:3000
- Allows frontend to use relative URLs (`/api/chores`)
