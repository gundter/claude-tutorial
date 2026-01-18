# Roadmap - v1.0 Milestone

## Milestone Goal

Fix critical bugs and add comprehensive test coverage to ensure application stability and maintainability.

## Phase Overview

| Phase | Description | Dependencies |
|-------|-------------|--------------|
| 1 | Test Framework Setup | None |
| 2 | Critical Bug Fixes | None |
| 3 | Backend Fixtures & Service Tests | Phase 1 |
| 4 | Backend Integration Tests | Phase 1, 3 |
| 5 | Frontend Store Tests | Phase 1 |
| 6 | Frontend Component Tests | Phase 1, 5 |
| 7 | E2E Test Setup | Phase 1-6 |

## Phase Details

### Phase 1: Test Framework Setup

**Goal:** Configure Vitest for both backend and frontend with proper TypeScript support.

**Tasks:**
- Install Vitest and dependencies in backend
- Create `backend/vitest.config.ts`
- Add test scripts to `backend/package.json`
- Install Vitest and @vue/test-utils in frontend
- Create `frontend/vitest.config.ts`
- Add test scripts to `frontend/package.json`
- Verify both test runners execute successfully

**Success Criteria:**
- `npm test` runs in backend (even with 0 tests)
- `npm test` runs in frontend (even with 0 tests)

**Files:**
- `backend/package.json`
- `backend/vitest.config.ts`
- `frontend/package.json`
- `frontend/vitest.config.ts`

---

### Phase 2: Critical Bug Fixes

**Goal:** Fix the two critical bugs identified in CONCERNS.md.

**Tasks:**

1. **Virtual Instance ID Fix:**
   - Change ID format to use `::` delimiter (not in UUIDs)
   - Update `choreController.ts` ID parsing logic
   - Update `recurrenceService.ts` ID generation
   - Add validation for malformed IDs

2. **RecurrenceSelector Fix:**
   - Add `isInitialized` flag
   - Only emit after first user interaction
   - Prevent spurious updates on mount

**Success Criteria:**
- Virtual instance IDs parse correctly
- RecurrenceSelector doesn't emit on initialization
- Manual testing confirms fixes work

**Files:**
- `backend/src/controllers/choreController.ts`
- `backend/src/services/recurrenceService.ts`
- `frontend/src/components/chores/RecurrenceSelector.vue`

---

### Phase 3: Backend Fixtures & Service Tests

**Goal:** Create test fixtures and unit tests for backend services.

**Tasks:**
- Create `backend/src/__fixtures__/chores.ts` with factory
- Create `backend/src/__fixtures__/teamMembers.ts` with factory
- Write tests for `recurrenceService.ts`:
  - buildRRule with all recurrence types
  - generateChoreInstances with date ranges
  - Edge cases
- Write tests for `dataService.ts`:
  - Mock file system operations
  - Test all CRUD functions
  - Test filter logic

**Success Criteria:**
- All recurrence service tests pass
- All data service tests pass
- Tests use consistent fixtures

**Files:**
- `backend/src/__fixtures__/chores.ts`
- `backend/src/__fixtures__/teamMembers.ts`
- `backend/src/services/recurrenceService.test.ts`
- `backend/src/services/dataService.test.ts`

---

### Phase 4: Backend Integration Tests

**Goal:** Test API endpoints with Supertest.

**Tasks:**
- Install Supertest
- Create test file for chore endpoints
- Create test file for team member endpoints
- Create test file for reminder endpoints
- Test success and error responses

**Success Criteria:**
- All API endpoints have at least basic test coverage
- Error responses tested (400, 404)
- Tests run against actual Express app

**Files:**
- `backend/src/controllers/choreController.test.ts`
- `backend/src/controllers/teamMemberController.test.ts`
- `backend/src/controllers/reminderController.test.ts`

---

### Phase 5: Frontend Store Tests

**Goal:** Unit test Pinia stores with mocked API.

**Tasks:**
- Create `frontend/src/__fixtures__/chores.ts`
- Create `frontend/src/__fixtures__/teamMembers.ts`
- Write tests for `choreStore.ts`:
  - Mock choresApi
  - Test all actions
  - Test computed properties
- Write tests for `teamStore.ts`
- Write tests for `reminderStore.ts`

**Success Criteria:**
- All store actions tested
- API mocking works correctly
- State updates verified

**Files:**
- `frontend/src/__fixtures__/chores.ts`
- `frontend/src/__fixtures__/teamMembers.ts`
- `frontend/src/stores/choreStore.test.ts`
- `frontend/src/stores/teamStore.test.ts`
- `frontend/src/stores/reminderStore.test.ts`

---

### Phase 6: Frontend Component Tests

**Goal:** Test key Vue components with @vue/test-utils.

**Tasks:**
- Write tests for CalendarHeader:
  - Navigation button clicks
  - Month label display
- Write tests for StatusBadge:
  - Status label mapping
  - CSS classes
- Write tests for RecurrenceSelector:
  - User interactions emit correctly
  - No emit on mount (verifies Phase 2 fix)

**Success Criteria:**
- Component tests pass
- User interactions verified
- Props and emits tested

**Files:**
- `frontend/src/components/calendar/CalendarHeader.test.ts`
- `frontend/src/components/chores/StatusBadge.test.ts`
- `frontend/src/components/chores/RecurrenceSelector.test.ts`

---

### Phase 7: E2E Test Setup

**Goal:** Add at least one E2E test covering the main workflow.

**Tasks:**
- Choose E2E framework (Playwright recommended)
- Install and configure
- Write test: create chore → view on calendar → mark complete
- Add npm script to run E2E tests

**Success Criteria:**
- E2E test passes
- Can run via npm script
- Tests actual user flow

**Files:**
- `frontend/playwright.config.ts` (or similar)
- `frontend/e2e/chore-workflow.spec.ts`
- `frontend/package.json` (e2e script)

---

## Execution Order

```
Phase 1 ──┬──► Phase 2 (can run in parallel with Phase 1)
          │
          ├──► Phase 3 ──► Phase 4
          │
          └──► Phase 5 ──► Phase 6
                              │
                              ▼
                          Phase 7
```

Phases 1 and 2 can start immediately.
Phases 3-4 (backend tests) and 5-6 (frontend tests) can run in parallel after Phase 1.
Phase 7 runs last after all other tests are in place.

---

*Roadmap created: 2026-01-18*
