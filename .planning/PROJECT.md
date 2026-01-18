# Office Chore Management App

## Overview

A Vue.js web application for managing office chores with an Outlook-style calendar view, recurring schedules, team assignment, and in-app reminders.

**Project Type:** Brownfield (existing codebase)
**Current Focus:** Fix critical bugs and add comprehensive test coverage

## Tech Stack

- **Frontend:** Vue 3 (Composition API) + Vite + Pinia + Vue Router + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Storage:** JSON files (chores.json, teamMembers.json)
- **Key Libraries:** rrule (recurrence), date-fns (dates), axios (HTTP), Zod (validation)

## Validated Requirements

*Features already implemented and working:*

### Team Management
- [x] Add team members with name, email, avatar color
- [x] Edit team member details
- [x] Delete team members (with assigned chore check)
- [x] List all team members

### Chore Management
- [x] Create chores with title, description, due date, assignee
- [x] Edit chore details
- [x] Delete chores
- [x] Status workflow: pending → in_progress → completed
- [x] Single assignee per chore

### Calendar View
- [x] Outlook-style month calendar view
- [x] Month navigation (prev/next/today)
- [x] Chores displayed on their due dates
- [x] Click to view/edit chore details

### Recurrence System
- [x] Daily recurrence with interval
- [x] Weekly recurrence with specific days (MO, TU, WE, etc.)
- [x] Monthly recurrence (by date or nth weekday)
- [x] End options: never, by date, after N occurrences
- [x] Virtual instances generated on-demand
- [x] Instances persist when status changed

### Filtering
- [x] Filter by status (pending, in_progress, completed)
- [x] Filter by assignee
- [x] Combined filters

### Reminders
- [x] Polling-based reminder checks (60s interval)
- [x] Upcoming chores notification (within 24h)
- [x] Overdue chores notification
- [x] Reminder bell with count badge

## Active Requirements

*Work to be completed in current milestone:*

### Critical Bug Fixes

1. **Virtual Instance ID Parsing Fragility**
   - Location: `backend/src/controllers/choreController.ts:221-254`
   - Issue: ID parsing uses string split on "-instance-" which fails if chore ID contains that string
   - Fix: Use structured identifier format or query parameter

2. **RecurrenceSelector Initial Emit**
   - Location: `frontend/src/components/chores/RecurrenceSelector.vue:113-117`
   - Issue: Component emits update on initialization before user interaction
   - Fix: Add dirty flag or only emit on explicit user action

### Test Coverage

1. **Backend Unit Tests**
   - Recurrence service (buildRRule, generateChoreInstances)
   - Data service (CRUD operations, filters)
   - Controllers (validation, error responses)

2. **Backend Integration Tests**
   - API endpoint testing with Supertest
   - Request/response validation
   - Error handling flows

3. **Frontend Unit Tests**
   - Pinia stores (choreStore, teamStore, reminderStore)
   - Component behavior tests

4. **E2E Tests**
   - Create and complete a chore flow
   - Recurring chore instance workflow
   - Team member assignment flow

## Non-Requirements

*Explicitly out of scope:*

- Authentication/authorization
- Database migration (keeping JSON files)
- Multi-tenant support
- Real-time updates (WebSocket)
- Mobile app
- Performance optimization beyond bug fixes

## Success Criteria

1. All critical bugs fixed and verified
2. Backend test coverage for core services
3. Frontend store tests passing
4. At least one E2E test for main workflow
5. Tests can be run via `npm test` commands

## Project Structure

```
claude-tutorial/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Zod validation
│   │   ├── types/           # TypeScript types
│   │   └── middleware/      # Error handling
│   └── data/                # JSON storage
├── frontend/
│   ├── src/
│   │   ├── components/      # Vue components by feature
│   │   ├── stores/          # Pinia stores
│   │   ├── views/           # Page components
│   │   ├── api/             # HTTP clients
│   │   └── types/           # TypeScript types
└── .planning/               # Project documentation
```

---

*Project initialized: 2026-01-18*
*Focus: Bug fixes + Test coverage*
