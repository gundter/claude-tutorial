# Requirements - v1.0 Milestone

## Goal

Fix critical bugs and add comprehensive test coverage to ensure application stability and maintainability.

## Functional Requirements

### FR-1: Fix Virtual Instance ID Parsing

**Priority:** Critical

**Description:** The current implementation parses virtual recurrence instance IDs by splitting on "-instance-" string. This fails if a parent chore ID happens to contain that substring.

**Current Behavior:**
```typescript
const parts = id.split('-instance-');
const parentId = parts[0];
const instanceDate = parts[1];
```

**Required Behavior:**
- Use a safe delimiter that cannot appear in UUIDs
- OR use a structured format (base64 encoded JSON, query param)
- Handle malformed IDs gracefully with proper error responses

**Acceptance Criteria:**
- [ ] Virtual instance IDs parse correctly for all valid chore IDs
- [ ] Invalid/malformed IDs return 400 error with clear message
- [ ] Existing virtual instances continue to work

### FR-2: Fix RecurrenceSelector Initialization

**Priority:** Critical

**Description:** The RecurrenceSelector component emits an update event during initialization, before any user interaction.

**Current Behavior:**
- Watch triggers on component mount
- Emits update with initial values

**Required Behavior:**
- Only emit when user explicitly changes a value
- Initial state should not trigger parent updates

**Acceptance Criteria:**
- [ ] Opening chore modal with recurrence does not trigger spurious updates
- [ ] User changes to recurrence correctly emit updates
- [ ] Parent form only marks dirty on actual user changes

## Testing Requirements

### TR-1: Backend Recurrence Service Tests

**Priority:** High

**Description:** Add unit tests for `backend/src/services/recurrenceService.ts`

**Test Cases:**
- [ ] `buildRRule()` with daily recurrence
- [ ] `buildRRule()` with weekly recurrence and specific days
- [ ] `buildRRule()` with monthly by day of month
- [ ] `buildRRule()` with monthly by nth weekday
- [ ] `buildRRule()` with end date
- [ ] `buildRRule()` with end after N occurrences
- [ ] `generateChoreInstances()` within date range
- [ ] `generateChoreInstances()` respects end conditions
- [ ] Edge cases: month boundaries, leap years

### TR-2: Backend Data Service Tests

**Priority:** High

**Description:** Add unit tests for `backend/src/services/dataService.ts`

**Test Cases:**
- [ ] `getAllTeamMembers()` returns all members
- [ ] `getTeamMemberById()` returns member or null
- [ ] `createTeamMember()` persists new member
- [ ] `updateTeamMember()` updates existing member
- [ ] `deleteTeamMember()` removes member
- [ ] `getAllChores()` returns all chores
- [ ] `getChoreById()` returns chore or null
- [ ] `getChoresByFilter()` with status filter
- [ ] `getChoresByFilter()` with assignee filter
- [ ] `getChoresByFilter()` with combined filters
- [ ] `createChore()` persists new chore
- [ ] `updateChore()` updates existing chore
- [ ] `deleteChore()` removes chore

### TR-3: Backend Controller Tests

**Priority:** High

**Description:** Add integration tests for API endpoints using Supertest

**Test Cases:**
- [ ] `POST /api/chores` with valid data returns 201
- [ ] `POST /api/chores` with invalid data returns 400
- [ ] `GET /api/chores` returns all chores
- [ ] `GET /api/chores/:id` returns chore or 404
- [ ] `PUT /api/chores/:id` updates chore
- [ ] `PATCH /api/chores/:id/status` updates status
- [ ] `DELETE /api/chores/:id` removes chore
- [ ] `GET /api/chores/calendar/:year/:month` returns calendar data
- [ ] Team member endpoints (CRUD)
- [ ] Reminder endpoints

### TR-4: Frontend Store Tests

**Priority:** Medium

**Description:** Add unit tests for Pinia stores

**Test Cases:**
- [ ] `choreStore.fetchAll()` populates state
- [ ] `choreStore.create()` adds to state
- [ ] `choreStore.update()` modifies state
- [ ] `choreStore.delete()` removes from state
- [ ] `choreStore.filteredChores` applies filters
- [ ] `teamStore` CRUD operations
- [ ] `reminderStore` polling and state

### TR-5: Frontend Component Tests

**Priority:** Medium

**Description:** Add unit tests for key Vue components

**Test Cases:**
- [ ] `CalendarHeader` navigation events
- [ ] `CalendarDay` click handlers
- [ ] `StatusBadge` displays correct labels
- [ ] `ChoreModal` form validation
- [ ] `RecurrenceSelector` emits correct values

### TR-6: E2E Test

**Priority:** Medium

**Description:** Add at least one E2E test covering main workflow

**Test Cases:**
- [ ] Create chore → view on calendar → mark complete

## Technical Requirements

### TECH-1: Test Framework Setup

**Backend:**
- Install Vitest as test runner
- Install Supertest for HTTP testing
- Configure `backend/vitest.config.ts`
- Add `npm test` script

**Frontend:**
- Install Vitest
- Install @vue/test-utils
- Configure `frontend/vitest.config.ts`
- Add `npm test` script

### TECH-2: Test Fixtures

- Create `backend/src/__fixtures__/` directory
- Create `createMockChore()` factory function
- Create `createMockTeamMember()` factory function
- Create `frontend/src/__fixtures__/` with same factories

## Out of Scope

- Performance testing
- Security testing
- Load testing
- Visual regression testing
- Test coverage thresholds (nice to have, not required)

---

*Requirements defined: 2026-01-18*
