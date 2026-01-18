# Codebase Concerns

**Analysis Date:** 2026-01-18

## Tech Debt

**JSON File-Based Data Storage:**
- Issue: Using flat JSON files for data persistence instead of a proper database
- Files: `backend/src/services/dataService.ts`
- Impact: No concurrent write protection, risk of data corruption under load. Race conditions possible when multiple requests modify data simultaneously. No indexing means O(n) lookups. Every read loads entire file into memory.
- Fix approach: Migrate to SQLite (for simplicity) or PostgreSQL. The data service already abstracts persistence, so changes would be isolated to that file.

**No Rate Limiting:**
- Issue: API endpoints have no rate limiting protection
- Files: `backend/src/index.ts`, `backend/src/routes/*.ts`
- Impact: Vulnerable to denial-of-service attacks. A malicious client could overwhelm the file-based storage with rapid writes.
- Fix approach: Add express-rate-limit middleware to the Express app configuration.

**Duplicated Type Definitions:**
- Issue: Type definitions are duplicated between frontend and backend
- Files: `backend/src/types/index.ts`, `frontend/src/types/index.ts`
- Impact: Types can drift out of sync. Changes require updating both files. No compile-time guarantee of API contract.
- Fix approach: Create a shared types package in the monorepo workspace, or use code generation from OpenAPI/Zod schemas.

**Hardcoded CORS Origin:**
- Issue: CORS origin defaults to hardcoded localhost URL
- Files: `backend/src/index.ts` (line 14-17)
- Impact: Not production-ready. Requires environment variable to be set correctly in deployment.
- Fix approach: Require CORS_ORIGIN env var in production, fail fast if not set.

## Known Bugs

**Virtual Instance ID Parsing Fragility:**
- Symptoms: Virtual recurrence instance IDs are parsed with string manipulation that could fail on edge cases
- Files: `backend/src/controllers/choreController.ts` (lines 221-254)
- Trigger: Chore IDs that happen to contain "-instance-" string
- Workaround: None documented
- Fix approach: Use a structured identifier format (e.g., base64 encoded JSON) or query parameter instead of embedding data in ID.

**RecurrenceSelector Initial Emit:**
- Symptoms: RecurrenceSelector emits update on component initialization before user interaction
- Files: `frontend/src/components/chores/RecurrenceSelector.vue` (lines 113-117)
- Trigger: Opening chore modal with existing recurrence data
- Workaround: None needed currently (watch triggers correctly)
- Fix approach: Use watchEffect with explicit dirty flag, or emit only on user interaction.

## Security Considerations

**No Authentication or Authorization:**
- Risk: Any client can read, create, modify, or delete any data. No user identity verification.
- Files: All route handlers in `backend/src/controllers/*.ts`
- Current mitigation: None - this is a demo/internal tool assumption
- Recommendations: Add authentication middleware (JWT, session-based, or OAuth). Add ownership checks on chore/team member operations.

**Input Validation Relies Solely on Zod:**
- Risk: Zod validation is good but additional sanitization may be needed for XSS prevention
- Files: `backend/src/schemas/index.ts`
- Current mitigation: Helmet middleware provides some headers
- Recommendations: Add explicit HTML sanitization for description fields if content is rendered as HTML.

**File System Path Construction:**
- Risk: Data directory path is constructed relative to module location
- Files: `backend/src/services/dataService.ts` (lines 7-12)
- Current mitigation: No user input reaches file path construction
- Recommendations: Keep data directory outside of application root. Use environment variable for data path.

**No HTTPS Enforcement:**
- Risk: Development server runs HTTP, no redirect to HTTPS
- Files: `backend/src/index.ts`
- Current mitigation: Assumed to be behind reverse proxy in production
- Recommendations: Document deployment requirements, add HTTPS redirect middleware.

## Performance Bottlenecks

**Full File Read on Every Operation:**
- Problem: Every read operation loads entire JSON file, parses it, returns subset
- Files: `backend/src/services/dataService.ts` (functions: getAllTeamMembers, getAllChores)
- Cause: JSON file storage requires full file read for any access
- Improvement path: Implement in-memory caching with invalidation, or migrate to database with proper indexing.

**Calendar View Generates All Instances:**
- Problem: Calendar endpoint generates virtual recurrence instances for entire month range on every request
- Files: `backend/src/controllers/choreController.ts` (getChoresForCalendar, lines 51-128)
- Cause: Recurrence instances are computed on-the-fly rather than pre-generated
- Improvement path: Cache generated instances, or lazy-load instances as calendar is navigated.

**No Pagination on List Endpoints:**
- Problem: `/api/chores` returns all chores without pagination
- Files: `backend/src/controllers/choreController.ts` (getAllChores)
- Cause: Design assumes small data sets
- Improvement path: Add limit/offset query parameters, return total count in response.

## Fragile Areas

**Recurrence Rule Construction:**
- Files: `backend/src/services/recurrenceService.ts`
- Why fragile: Complex interaction between multiple recurrence options (weekly days, monthly dates, nth weekday). RRule library has quirks with timezone handling.
- Safe modification: Always test with edge cases: end of month, leap years, DST transitions
- Test coverage: No automated tests exist for recurrence logic.

**Data File Initialization:**
- Files: `backend/src/services/dataService.ts` (initializeDataFiles, lines 14-27)
- Why fragile: Race condition if multiple requests hit uninitialized system simultaneously. Uses existsSync which is discouraged.
- Safe modification: Initialize data files at server startup, not on first request.
- Test coverage: None.

**Modal State Management:**
- Files: `frontend/src/views/CalendarPage.vue`, `frontend/src/views/ChoresListPage.vue`
- Why fragile: Multiple ref variables track modal/panel visibility and selected items. Easy to have stale state.
- Safe modification: Consider composable or state machine for modal lifecycle.
- Test coverage: None.

## Scaling Limits

**JSON File Storage:**
- Current capacity: Practical limit of ~1000 chores before noticeable slowdown
- Limit: File I/O becomes bottleneck; single-threaded writes block all operations
- Scaling path: Database migration required for any serious scale.

**In-Memory Reminder Polling:**
- Current capacity: Frontend polls every 60 seconds per client
- Limit: No server-side batching; N clients = N polls/minute
- Scaling path: Implement WebSocket for push notifications, or use service worker with background sync.

## Dependencies at Risk

**express-async-errors:**
- Risk: Depends on patching Express internals; may break on Express 5.x upgrade
- Impact: Unhandled promise rejections would crash server
- Migration plan: Use explicit try-catch or modern Express 5 when stable.

**rrule Library:**
- Risk: Complex library with timezone edge cases; documentation sparse for advanced scenarios
- Impact: Recurrence bugs could create incorrect chore instances
- Migration plan: None immediate; maintain thorough test coverage for recurrence scenarios.

## Missing Critical Features

**No Data Backup/Export:**
- Problem: No mechanism to backup or export data
- Blocks: Disaster recovery, data migration, user data portability

**No Undo/History:**
- Problem: Deletes are permanent, no audit trail
- Blocks: Accident recovery, compliance requirements

**No Multi-User/Multi-Tenant:**
- Problem: No concept of user accounts or organizations
- Blocks: Deployment as shared service, per-user chore lists

## Test Coverage Gaps

**No Backend Tests:**
- What's not tested: All backend code (controllers, services, schemas)
- Files: Entire `backend/src/` directory
- Risk: Regressions go unnoticed; refactoring is risky
- Priority: High - business logic in services is critical path

**No Frontend Tests:**
- What's not tested: All Vue components and stores
- Files: Entire `frontend/src/` directory
- Risk: UI regressions, state management bugs
- Priority: Medium - manual testing currently catches most issues

**No Integration Tests:**
- What's not tested: API contract between frontend and backend
- Files: Entire codebase
- Risk: Breaking changes in API response format
- Priority: Medium - type sharing partially mitigates

**Recurrence Logic Untested:**
- What's not tested: RRule generation, instance creation, edge cases
- Files: `backend/src/services/recurrenceService.ts`
- Risk: Incorrect chore instances for complex recurrence patterns
- Priority: High - most complex logic in codebase

---

*Concerns audit: 2026-01-18*
