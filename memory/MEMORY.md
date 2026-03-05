# WellTrack Project Memory

## Workflow Preferences
- **Always create a new git branch and open a PR for each task** from Tasks.md before implementing it.
  - Branch naming: `task/<short-description>` (e.g., `task/setup-eslint-prettier`)
  - PR targets `master`
  - Mark task as `[x]` in Tasks.md when done

## Project Structure
- Root: `/home/regis/Documents/Claude Home/WellTrack/`
- Backend: `backend/` — Node.js + Express + TypeScript
- Docs: `Documents/` — Requirements.md, Tasks.md
- Remote: `git@github.com:atemengue/welltrack.git` (branch: `master`)

## Stack
- Backend: Node.js 18, Express 5, TypeScript, Prisma 5 (pinned — Prisma 7+ requires Node 20+), PostgreSQL
- Test runner: **vitest** (not Jest) — tests explicitly import from `'vitest'`
- Frontend (planned): React + Vite + Tailwind CSS
- Auth: JWT (access + refresh tokens), bcrypt

## Completed Tasks
- [x] Initialize Node.js/Express project with TypeScript
- [x] Configure ESLint, Prettier, and tsconfig
- [x] Set up PostgreSQL database (local dev instance)
- [x] Initialize Prisma and connect to the database
- [x] Add .env support with dotenv
- [x] Create health check endpoint (GET /api/health)
- [x] Unit and integration tests
