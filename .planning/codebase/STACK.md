# Technology Stack

**Analysis Date:** 2025-01-18

## Languages

**Primary:**
- TypeScript 5.7 - Used throughout both backend and frontend

**Secondary:**
- CSS - Custom styles in `frontend/src/styles/main.css`
- JSON - Data storage in `backend/data/` directory

## Runtime

**Environment:**
- Node.js (ES2022 target)
- ES Modules (`"type": "module"` in all package.json files)

**Package Manager:**
- npm with workspaces
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Express 4.21.0 - Backend REST API (`backend/src/index.ts`)
- Vue 3.5.0 - Frontend SPA (`frontend/src/main.ts`)
- Vite 6.0.0 - Frontend build tool and dev server (`frontend/vite.config.ts`)

**State Management:**
- Pinia 2.3.0 - Vue state management (`frontend/src/stores/`)

**Routing:**
- vue-router 4.5.0 - Frontend routing (`frontend/src/router/index.ts`)

**Testing:**
- None configured

**Build/Dev:**
- tsx 4.19.0 - TypeScript execution for backend dev mode
- vue-tsc 2.2.0 - Vue TypeScript type checking
- concurrently 9.1.0 - Run backend and frontend simultaneously

## Key Dependencies

**Critical:**
- `zod` 3.24.0 - Schema validation for API requests (`backend/src/schemas/index.ts`)
- `axios` 1.7.0 - HTTP client for frontend API calls (`frontend/src/api/index.ts`)
- `rrule` 2.8.1 - Recurrence rule generation (iCal RRULE) (`backend/src/services/recurrenceService.ts`)
- `date-fns` 4.1.0 - Date manipulation (used in both backend and frontend)
- `uuid` 10.0.0 - Generate unique IDs for entities (`backend/src/services/`)

**Infrastructure:**
- `helmet` 8.0.0 - Security headers (`backend/src/index.ts`)
- `cors` 2.8.5 - Cross-origin resource sharing (`backend/src/index.ts`)
- `morgan` 1.10.0 - HTTP request logging (`backend/src/index.ts`)
- `express-async-errors` 3.1.1 - Async error handling for Express

**Frontend Utilities:**
- `@vueuse/core` 12.0.0 - Vue composable utilities (dev dependency)
- `@vitejs/plugin-vue` 5.2.0 - Vue plugin for Vite

## Configuration

**TypeScript (Backend):**
- Target: ES2022
- Module: NodeNext
- Strict mode enabled
- Source maps and declarations generated
- Config: `backend/tsconfig.json`

**TypeScript (Frontend):**
- Target: ES2022
- Module: ESNext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Config: `frontend/tsconfig.json`

**Vite:**
- Dev server port: 5173
- API proxy: `/api` proxied to `http://localhost:3000`
- Path alias: `@` maps to `./src`
- Config: `frontend/vite.config.ts`

**Environment:**
- `PORT` - Backend server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)
- `NODE_ENV` - Environment mode (affects error stack traces)

## Platform Requirements

**Development:**
- Node.js with ES2022 support
- npm for package management
- Windows/Mac/Linux compatible

**Production:**
- Node.js runtime for backend
- Static file hosting for frontend build output
- Backend outputs to `backend/dist/`
- Frontend outputs to Vite default build directory

## Scripts

**Root (`package.json`):**
```bash
npm run dev          # Run backend and frontend concurrently
npm run dev:backend  # Run backend only
npm run dev:frontend # Run frontend only
npm run build        # Build frontend then backend
npm run start        # Start production backend
```

**Backend (`backend/package.json`):**
```bash
npm run dev    # tsx watch src/index.ts
npm run build  # tsc
npm run start  # node dist/index.js
```

**Frontend (`frontend/package.json`):**
```bash
npm run dev        # vite
npm run build      # vue-tsc -b && vite build
npm run preview    # vite preview
npm run type-check # vue-tsc --noEmit
```

---

*Stack analysis: 2025-01-18*
