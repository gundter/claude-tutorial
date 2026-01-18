# Codebase Structure

**Analysis Date:** 2026-01-18

## Directory Layout

```
claude-tutorial/
├── backend/                    # Express API server
│   ├── data/                   # JSON file storage
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # Route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Business logic & data access
│   │   ├── types/              # TypeScript interfaces
│   │   └── index.ts            # App entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Vue 3 SPA
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # HTTP client wrappers
│   │   ├── components/         # Vue components (by feature)
│   │   │   ├── calendar/       # Calendar UI components
│   │   │   ├── chores/         # Chore form/display components
│   │   │   ├── filters/        # Filter UI components
│   │   │   └── reminders/      # Reminder components
│   │   ├── router/             # Vue Router config
│   │   ├── stores/             # Pinia state stores
│   │   ├── styles/             # Global CSS
│   │   ├── types/              # TypeScript interfaces
│   │   ├── views/              # Page components
│   │   ├── App.vue             # Root component
│   │   ├── main.ts             # App entry point
│   │   └── env.d.ts            # Vite env types
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .planning/                  # Planning documentation
│   └── codebase/               # Architecture docs
├── package.json                # Root workspace config
└── package-lock.json
```

## Directory Purposes

**`backend/`:**
- Purpose: REST API server handling data persistence and business logic
- Contains: Express app, routes, controllers, services, types
- Key files: `src/index.ts` (server entry)

**`backend/data/`:**
- Purpose: JSON file storage for persistence
- Contains: `teamMembers.json`, `chores.json`
- Generated: Yes (created on first run if missing)
- Committed: Data files may contain sample data

**`backend/src/controllers/`:**
- Purpose: Handle HTTP requests, validate input, call services
- Contains: One controller file per resource
- Key files: `choreController.ts`, `teamMemberController.ts`, `reminderController.ts`

**`backend/src/services/`:**
- Purpose: Business logic and data operations
- Contains: `dataService.ts` (CRUD), `reminderService.ts`, `recurrenceService.ts`
- Key files: `dataService.ts` handles all JSON file operations

**`backend/src/schemas/`:**
- Purpose: Zod validation schemas for API requests
- Contains: `index.ts` with all schemas and inferred types
- Key files: Single `index.ts` exports all schemas

**`frontend/src/api/`:**
- Purpose: Axios-based API client modules
- Contains: Base config and per-resource API modules
- Key files: `index.ts` (axios instance), `choresApi.ts`, `teamApi.ts`

**`frontend/src/components/`:**
- Purpose: Reusable Vue components grouped by feature area
- Contains: Subdirectories for calendar, chores, filters, reminders
- Key files: `ChoreModal.vue`, `CalendarGrid.vue`, `FilterBar.vue`

**`frontend/src/stores/`:**
- Purpose: Pinia stores for state management
- Contains: One store per domain entity
- Key files: `choreStore.ts`, `teamStore.ts`, `reminderStore.ts`

**`frontend/src/views/`:**
- Purpose: Page-level components mapped to routes
- Contains: One view per route
- Key files: `CalendarPage.vue`, `ChoresListPage.vue`, `TeamPage.vue`

**`frontend/src/types/`:**
- Purpose: Shared TypeScript type definitions
- Contains: Entity interfaces, form input types
- Key files: `index.ts` exports all types

## Key File Locations

**Entry Points:**
- `backend/src/index.ts`: Express server bootstrap
- `frontend/src/main.ts`: Vue app bootstrap
- `frontend/src/App.vue`: Root component with layout and router-view

**Configuration:**
- `package.json`: Root workspace config with dev scripts
- `backend/package.json`: Backend dependencies and scripts
- `frontend/package.json`: Frontend dependencies and scripts
- `frontend/vite.config.ts`: Vite build config with API proxy
- `backend/tsconfig.json`: Backend TypeScript config
- `frontend/tsconfig.json`: Frontend TypeScript config

**Core Logic:**
- `backend/src/services/dataService.ts`: All data CRUD operations
- `backend/src/controllers/choreController.ts`: Chore API handlers (most complex)
- `frontend/src/stores/choreStore.ts`: Chore state management
- `frontend/src/views/CalendarPage.vue`: Main calendar view with interactions

**Testing:**
- No test files detected - testing not yet implemented

**Styling:**
- `frontend/src/styles/main.css`: Global styles and CSS variables

## Naming Conventions

**Files:**
- Components: PascalCase with `.vue` extension (`CalendarGrid.vue`, `ChoreModal.vue`)
- TypeScript modules: camelCase with `.ts` extension (`choreController.ts`, `dataService.ts`)
- Type files: `index.ts` barrel exports
- Routes: camelCase with "Routes" suffix (`choreRoutes.ts`)
- Controllers: camelCase with "Controller" suffix (`choreController.ts`)
- Services: camelCase with "Service" suffix (`dataService.ts`, `reminderService.ts`)
- Stores: camelCase with "Store" suffix (`choreStore.ts`)
- API modules: camelCase with "Api" suffix (`choresApi.ts`)

**Directories:**
- Feature groups: lowercase singular or plural (`calendar/`, `chores/`, `filters/`)
- Layer directories: lowercase plural (`controllers/`, `services/`, `routes/`)

**Component Organization:**
- Group by feature domain (calendar, chores, filters, reminders)
- Views are page-level, components are reusable pieces

## Where to Add New Code

**New API Endpoint:**
1. Add route in `backend/src/routes/{resource}Routes.ts`
2. Add controller function in `backend/src/controllers/{resource}Controller.ts`
3. Add validation schema in `backend/src/schemas/index.ts` if needed
4. Add service function in `backend/src/services/dataService.ts` if data operation needed

**New Frontend Page:**
1. Create view component in `frontend/src/views/{PageName}Page.vue`
2. Add route in `frontend/src/router/index.ts`
3. Add navigation link in `frontend/src/App.vue` if needed

**New UI Component:**
1. Create component in appropriate `frontend/src/components/{feature}/` directory
2. Import and use in parent view or component

**New Store:**
1. Create store in `frontend/src/stores/{entity}Store.ts`
2. Follow Composition API pattern with `defineStore('name', () => {})`
3. Export from store file

**New API Client:**
1. Create API module in `frontend/src/api/{entity}Api.ts`
2. Import base `api` from `./index.ts`
3. Export object with async methods

**New Type Definitions:**
- Backend types: Add to `backend/src/types/index.ts`
- Frontend types: Add to `frontend/src/types/index.ts`
- Note: Types are duplicated between frontend/backend (not shared)

**Utilities:**
- Backend: Create in `backend/src/services/` or new `backend/src/utils/` directory
- Frontend: Create in `frontend/src/composables/` (for Vue composables) or `frontend/src/utils/`

## Special Directories

**`backend/data/`:**
- Purpose: JSON file storage (acts as database)
- Generated: Yes, auto-created by dataService on first access
- Committed: Yes (may contain seed data)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No

**`frontend/public/`:**
- Purpose: Static assets served as-is
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: Project documentation and planning files
- Generated: Partially (by GSD commands)
- Committed: Yes

---

*Structure analysis: 2026-01-18*
