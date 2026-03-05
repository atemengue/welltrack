# WellTrack - Implementation Tasks

Tasks are organized by phase, matching the 12-week timeline in the requirements. Each task is scoped to be completable in a focused work session.

---

## Phase 1: Backend Foundation (Weeks 1–3)

### Project Setup
- [x] Initialize Node.js/Express project with TypeScript
- [x] Configure ESLint, Prettier, and tsconfig
- [x] Set up PostgreSQL database (local dev instance)
- [x] Initialize Prisma and connect to the database
- [x] Add `.env` support with `dotenv` (DATABASE_URL, JWT secrets, etc.)
- [x] Create a basic Express app with a health check endpoint (`GET /api/health`)

### Database Schema
- [x] Write Prisma schema for `User`
- [x] Write Prisma schema for `Symptom` and `SymptomLog`
- [x] Write Prisma schema for `MoodLog`
- [x] Write Prisma schema for `Medication` and `MedicationLog`
- [x] Write Prisma schema for `Habit` and `HabitLog`
- [x] Add indexes on `(user_id, logged_at)` for all log tables
- [x] Run initial migration (`prisma migrate dev`)
- [x] Write a seed script for default symptoms (Headache, Fatigue, Joint Pain, Muscle Pain, Nausea, Brain Fog, Dizziness, Insomnia, Anxiety, Stomach Pain, Back Pain)
- [x] Write a seed script for default habits (Sleep Duration, Water Intake, Exercise, Alcohol, Caffeine)

### Authentication
- [x] Implement `POST /api/auth/register` — hash password with bcrypt, return JWT
- [x] Implement `POST /api/auth/login` — verify credentials, return access + refresh tokens
- [ ] Implement `POST /api/auth/refresh` — validate refresh token, issue new access token
- [ ] Implement `POST /api/auth/logout` — invalidate refresh token
- [ ] Implement `POST /api/auth/forgot-password` — generate reset token, send email
- [ ] Implement `POST /api/auth/reset-password` — validate token, update password hash
- [x] Write JWT middleware to protect routes (`requireAuth`)

### User Endpoints
- [x] Implement `GET /api/users/me` — return current user profile
- [x] Implement `PATCH /api/users/me` — update display name and timezone
- [x] Implement `DELETE /api/users/me` — delete user and cascade all related data

### Symptoms Endpoints
- [x] Implement `GET /api/symptoms` — return system defaults + user's custom symptoms
- [x] Implement `POST /api/symptoms` — create a custom symptom for the current user
- [x] Implement `PATCH /api/symptoms/:id` — update name/category/is_active (own records only)
- [x] Implement `DELETE /api/symptoms/:id` — delete custom symptom (block deleting system ones)

### Symptom Logs Endpoints
- [ ] Implement `GET /api/symptom-logs` with `startDate`, `endDate`, `limit`, `offset` query params
- [ ] Implement `POST /api/symptom-logs` — create a log entry (severity 1–10, optional notes, logged_at)
- [ ] Implement `PATCH /api/symptom-logs/:id` — update a log entry (own records only)
- [ ] Implement `DELETE /api/symptom-logs/:id` — delete a log entry (own records only)

### Mood Logs Endpoints
- [ ] Implement `GET /api/mood-logs` with `startDate`, `endDate` query params
- [ ] Implement `POST /api/mood-logs` — create entry (mood 1–5, optional energy/stress, notes)
- [ ] Implement `PATCH /api/mood-logs/:id`
- [ ] Implement `DELETE /api/mood-logs/:id`

### Medications Endpoints
- [ ] Implement `GET /api/medications` — return user's active and inactive medications
- [ ] Implement `POST /api/medications` — create a medication record
- [ ] Implement `PATCH /api/medications/:id` — update name, dosage, frequency, is_active
- [ ] Implement `DELETE /api/medications/:id`

### Medication Logs Endpoints
- [ ] Implement `GET /api/medication-logs` with `startDate`, `endDate` query params
- [ ] Implement `POST /api/medication-logs` — log whether a medication was taken
- [ ] Implement `PATCH /api/medication-logs/:id`
- [ ] Implement `DELETE /api/medication-logs/:id`

### Habits Endpoints
- [ ] Implement `GET /api/habits` — return system defaults + user's custom habits
- [ ] Implement `POST /api/habits` — create a custom habit (with tracking_type and optional unit)
- [ ] Implement `PATCH /api/habits/:id`
- [ ] Implement `DELETE /api/habits/:id` — block deleting system habits

### Habit Logs Endpoints
- [ ] Implement `GET /api/habit-logs` with `startDate`, `endDate` query params
- [ ] Implement `POST /api/habit-logs` — log a habit value (boolean, numeric, or duration)
- [ ] Implement `PATCH /api/habit-logs/:id`
- [ ] Implement `DELETE /api/habit-logs/:id`

### Insights & Export Endpoints
- [ ] Implement `GET /api/insights/trends` — aggregate data by `type` (symptom/mood/habit) and `days` (7/30/90)
- [ ] Implement `GET /api/export/csv` — stream a CSV of all log data within a date range

### Validation & Error Handling
- [ ] Add request validation (e.g., with `zod` or `express-validator`) to all POST/PATCH routes
- [ ] Add a global error handler middleware that returns consistent JSON error responses
- [ ] Ensure all routes return 401 for unauthenticated requests and 403 for unauthorized ones

---

## Phase 2: Frontend Foundation (Weeks 4–6)

### Project Setup
- [ ] Initialize React app with TypeScript using Vite
- [ ] Install and configure Tailwind CSS
- [ ] Set up React Router for client-side routing
- [ ] Create an API client module (e.g., using `axios` or `fetch`) with base URL and auth header injection
- [ ] Implement token storage and automatic refresh logic on 401 responses

### Auth Pages
- [ ] Build Register page (email, password, display name)
- [ ] Build Login page (email, password)
- [ ] Build Forgot Password page (email input)
- [ ] Build Reset Password page (new password input, reads token from URL)
- [ ] Implement protected route wrapper that redirects to login if unauthenticated

### Dashboard
- [ ] Build Dashboard layout with today's date header
- [ ] Display a summary of what has been logged today (counts per type)
- [ ] Add quick-add buttons for each log type (symptom, mood, medication, habit)
- [ ] Add a "days logged this week" streak indicator

### Log Entry Forms/Modals
- [ ] Build Symptom log modal — symptom selector, 1–10 severity slider, notes, date picker
- [ ] Build Mood log modal — 1–5 mood score, optional energy/stress levels, notes, date picker
- [ ] Build Medication log modal — medication selector, taken toggle, optional notes, date picker
- [ ] Build Habit log modal — habit selector, value input (adapts to tracking type), notes, date picker
- [ ] Wire all modals to their respective POST API endpoints

---

## Phase 3: Full Features (Weeks 7–9)

### History View
- [ ] Build History page with entries grouped by day (most recent first)
- [ ] Implement filter tabs by type (symptoms, mood, meds, habits)
- [ ] Implement expand/collapse per entry to show full details
- [ ] Wire edit action to open the relevant log modal pre-filled
- [ ] Wire delete action with a confirmation prompt

### Trends View
- [ ] Build Trends page with a date range picker (7/30/90 day presets)
- [ ] Add a line chart for symptom severity over time (using Recharts)
- [ ] Add a line chart for mood, energy, and stress over time
- [ ] Add a calendar heatmap showing which days had any logged activity

### Settings Page
- [ ] Build Edit Profile form (display name, timezone)
- [ ] Build Manage Symptoms section — list active symptoms, toggle hide/show, add custom, delete custom
- [ ] Build Manage Habits section — same pattern as symptoms
- [ ] Build Manage Medications section — add, edit, deactivate, delete medications
- [ ] Add Export Data button that triggers CSV download
- [ ] Add Delete Account button with a confirmation dialog
- [ ] Add Logout button

---

## Phase 4: Polish & Launch (Weeks 10–12)

- [ ] Audit all forms for accessibility (labels, keyboard navigation, focus management)
- [ ] Test and fix mobile responsiveness across all pages
- [ ] Add loading states and skeleton screens where data is being fetched
- [ ] Add toast notifications for success/error feedback on all actions
- [ ] Write smoke tests for critical API routes (auth, log creation, export)
- [ ] Set up environment configs for production (env vars, CORS, HTTPS)
- [ ] Deploy backend (Railway or Render)
- [ ] Deploy frontend (Vercel)
- [ ] Verify end-to-end flow works in production
- [ ] Onboard beta users and document any immediate bug fixes
