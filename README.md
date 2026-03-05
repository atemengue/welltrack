# WellTrack

Wellness tracking API for people with chronic health conditions. Log symptoms, moods, medications, and habits — then view trends over time.

**Stack:** Node.js 18 + Express 5 + TypeScript + Prisma 5 + PostgreSQL

---

## Prerequisites

- Node.js 18
- PostgreSQL 15

---

## Setup

**1. Clone and install**
```bash
git clone git@github.com:atemengue/welltrack.git
cd welltrack/backend
npm install
```

**2. Create the database**
```bash
psql -U postgres -c "CREATE USER welltrack WITH PASSWORD 'welltrack_dev';"
psql -U postgres -c "CREATE DATABASE welltrack_dev OWNER welltrack;"
psql -U postgres -c "ALTER USER welltrack CREATEDB;"
```

**3. Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your values (defaults work for local dev):

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://welltrack:welltrack_dev@localhost:5432/welltrack_dev` |
| `PORT` | HTTP port | `3000` |
| `JWT_SECRET` | Secret for signing access tokens | *(required)* |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | *(required)* |

**4. Run migrations and seed**
```bash
npx prisma migrate dev
npx prisma db seed
```

**5. Start the dev server**
```bash
npm run dev
```

Server starts at `http://localhost:3000`. Verify with:
```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with ts-node |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Run compiled output |
| `npm test` | Run all tests |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

---

## API

See [`docs/api.md`](docs/api.md) for the full API reference.
