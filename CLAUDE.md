# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Workflow

- **Every task from `Documents/Tasks.md` gets its own branch and PR.**
  - Branch naming: `task/<short-description>`
  - PR targets `master`
  - Mark the task `[x]` in `Tasks.md` when done and include it in the commit

---

## Commands

All commands run from `backend/`.

```bash
npm run dev          # Start dev server (ts-node, connects to DB on startup)
npm run build        # Compile TypeScript → dist/
npm run start        # Run compiled output
npm test             # Run all tests with vitest
npm run lint         # ESLint
npm run format       # Prettier
```

**Run a single test file:**
```bash
npx vitest run src/__tests__/app.test.ts
```

**Prisma:**
```bash
npx prisma generate          # Regenerate client after schema changes
npx prisma migrate dev       # Apply schema changes to local DB
npx prisma migrate dev --name <name>   # Named migration
```

---

## Architecture

```
WellTrack/
├── Documents/
│   ├── Requirements.md   # Full product spec — source of truth for features and data model
│   └── Tasks.md          # Ordered implementation checklist
└── backend/              # Node.js + Express + TypeScript API
    ├── src/
    │   ├── app.ts         # Express app — routes registered here, no server.listen()
    │   ├── index.ts       # Entry point — loads dotenv, connects Prisma, calls app.listen()
    │   ├── lib/
    │   │   └── prisma.ts  # Singleton PrismaClient — import this everywhere
    │   └── __tests__/
    │       ├── setup.ts   # Sets process.env vars before tests (no .env needed in CI)
    │       ├── app.test.ts
    │       └── prisma.test.ts
    ├── prisma/
    │   └── schema.prisma  # PostgreSQL datasource, all models defined here
    ├── .env               # Local only, gitignored
    ├── .env.example       # Committed template
    └── eslint.config.cjs  # Flat ESLint config (CJS because module=commonjs in tsconfig)
```

### Key design decisions

- **`app.ts` vs `index.ts`**: `app.ts` exports the Express instance without calling `listen()`. Tests import `app.ts` directly via `supertest`, avoiding port binding. `index.ts` is the only file that starts the server.
- **Test runner is vitest** (not Jest). Tests import `describe`, `it`, `expect` etc. from `'vitest'`. The `jest.config.js` file is a leftover and not used.
- **Prisma 5** is pinned because Node.js 18 is in use — Prisma 7+ requires Node 20+.
- **ESLint flat config** uses `.cjs` extension to work under CommonJS module resolution.
- All routes are prefixed `/api/`.

### Database

- Local DB: `welltrack_dev`, user: `welltrack`, password: `welltrack_dev`
- Connection string in `backend/.env` (copy from `.env.example`)
- After changing `schema.prisma`, always run `prisma generate` before running tests or the dev server.

### Planned data models (not yet in schema)

`User`, `Symptom`, `SymptomLog`, `MoodLog`, `Medication`, `MedicationLog`, `Habit`, `HabitLog` — see `Documents/Requirements.md` for full field definitions. All log tables need a composite index on `(user_id, logged_at)`.


### Git Workflow

When completing tasks form TASKS.md:

1. Create a new branch named feature/`feature/<task-number>-<brief-description>` before starting work.
2. Making atomic commits with conventional commit messages:
  - feat: for new features
  - fix: for bug fixes
  - docs: for documentation
  - test: for tests
  - refactor: for refactoring

3. After completing a task, create a pull request with:
  - A descriptive title matching the task
  - A summary of changes made
  - Any testing notes or considerations

4. Update the task checkbox in TASKS.md to mark it complete


### Testing Requirements
Before marking any tasks as complete:
1. Write unit test for new functionality
2. Run the full test suite with `npm test`
3.  If tests fail:
  - Analyze the failure output
  - Fix the code (no the tests, unless tests are incorrect)
  - Re-Run tests until all pass
4. For API endpoints, include integration tests that verify
  - Success responses with valid input
  - Authentication requirements
  - Edge cases


### Test Commandes
- Backend tests: `cd backend && npm test`
- Frontend tests: `cd frontend && npm test`
- Run specific test file: `npm test --path/to/test.ts`
- Run test matching pattern: `npm test -- --grep "pattern"`


## Documentation Requirements

### README.md
Keep updated with:
- Quick start instructions (clone, install, run)
- Environment variables table with descriptions
- Available npm scripts and what they do

Update README when:
- Adding new features or endpoints
- Changing environment variables
- Adding new npm scripts or dependencies

### Code Comments
Add comments when:
- The "why" isn't obvious from the code
- There's a non-obvious edge case being handled
- You're working around a bug or limitation
- The function has complex parameters or return values

Don't add comments when:
- The code is self-explanatory
- You'd just be restating what the code does

For exported functions, use JSDoc format:
/**
 * Creates a new symptom log for the authenticated user.
 * @param userId - The ID of the user creating the log
 * @param data - The symptom log data
 * @returns The created symptom log with ID
 * @throws AppError 404 if symptom doesn't exist
 */

### API Documentation
Maintain a simple API reference in /docs/api.md with:
- Endpoint URL and method
- Brief description
- Whether auth is required
- Request body example (if applicable)
- Success response example

Format example:
### Create Symptom Log
POST /api/symptom-logs (requires auth)

Request:
{
  "symptomId": "uuid",
  "severity": 7,
  "notes": "Started after lunch"
}

Response: 201 Created
{
  "id": "uuid",
  "symptomId": "uuid",
  "severity": 7,
  ...
}
