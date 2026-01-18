# External Integrations

**Analysis Date:** 2025-01-18

## APIs & External Services

**None:** This application is self-contained with no external API integrations.

## Data Storage

**Databases:**
- JSON file-based storage (no database)
  - Team members: `backend/data/teamMembers.json`
  - Chores: `backend/data/chores.json`
  - Client: Custom data service (`backend/src/services/dataService.ts`)
  - Auto-initialization: Files created if missing on first access

**File Storage:**
- Local filesystem only
- Data directory: `backend/data/`

**Caching:**
- None - Data read from JSON files on each request

## Authentication & Identity

**Auth Provider:**
- None - No authentication implemented
- All endpoints are publicly accessible
- No user sessions or tokens

## Monitoring & Observability

**Error Tracking:**
- None - Errors logged to console only

**Logs:**
- Morgan HTTP request logging in dev mode (`backend/src/index.ts`)
- Console.error for errors (`backend/src/middleware/errorHandler.ts`)
- Stack traces shown in development mode (controlled by NODE_ENV)

## CI/CD & Deployment

**Hosting:**
- Not configured - Local development only

**CI Pipeline:**
- None

## Environment Configuration

**Required env vars:**
- None strictly required (all have defaults)

**Optional env vars:**
- `PORT` - Backend server port (default: 3000)
- `CORS_ORIGIN` - CORS allowed origin (default: http://localhost:5173)
- `NODE_ENV` - Set to "development" to include error stacks in responses

**Secrets location:**
- No secrets required

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Internal API Structure

**REST Endpoints (all prefixed with `/api`):**

**Health:**
- `GET /api/health` - Health check endpoint

**Team Members:**
- `GET /api/team-members` - List all team members
- `GET /api/team-members/:id` - Get single team member
- `POST /api/team-members` - Create team member
- `PUT /api/team-members/:id` - Update team member
- `DELETE /api/team-members/:id` - Delete team member

**Chores:**
- `GET /api/chores` - List chores (supports filtering)
- `GET /api/chores/:id` - Get single chore
- `GET /api/chores/calendar/:year/:month` - Get chores for calendar view
- `POST /api/chores` - Create chore
- `PUT /api/chores/:id` - Update chore
- `PATCH /api/chores/:id/status` - Update chore status only
- `DELETE /api/chores/:id` - Delete chore

**Reminders:**
- `GET /api/reminders/check` - Get upcoming and overdue chores

**Route Files:**
- `backend/src/routes/index.ts` - Route aggregation
- `backend/src/routes/teamMemberRoutes.ts`
- `backend/src/routes/choreRoutes.ts`
- `backend/src/routes/reminderRoutes.ts`

## Frontend API Client

**Configuration:**
- Base URL: `/api` (proxied in dev via Vite)
- Content-Type: `application/json`
- Location: `frontend/src/api/index.ts`

**API Modules:**
- `frontend/src/api/teamApi.ts` - Team member operations
- `frontend/src/api/choresApi.ts` - Chore CRUD operations
- `frontend/src/api/remindersApi.ts` - Reminder checks

**Error Handling:**
- Response interceptor logs errors to console
- Errors re-thrown for store-level handling

## Data Flow

**Frontend to Backend:**
1. Vue component triggers Pinia store action
2. Store calls API module function
3. Axios sends HTTP request to `/api/*`
4. Vite dev server proxies to `http://localhost:3000`
5. Express route handler processes request
6. Controller validates with Zod schema
7. Service layer reads/writes JSON files
8. Response sent back through chain

**No external integrations required for core functionality.**

---

*Integration audit: 2025-01-18*
