# Traktion Backend

Node.js + Express + TypeScript API, using Prisma as the ORM against PostgreSQL.

## Structure

```
src/
  routes/       Express routers (thin, delegate to controllers)
  controllers/  request/response handling
  services/     business logic, DB access via Prisma
  middleware/   Express middleware (auth, error handling, etc. — TBD)
  lib/          shared singletons (Prisma client, etc.)
  types/        local TypeScript types
prisma/
  schema.prisma First-pass data model (User, Exercise, WorkoutPlan, PlanExercise,
                WorkoutSession, SetLog, PersonalRecord, FoodEntry)
```

## Getting started

1. Copy `.env.example` to `.env` and point `DATABASE_URL` at a local PostgreSQL instance.
2. Install dependencies from the repo root: `npm install`
3. Generate the Prisma client: `npm run prisma:generate --workspace=apps/backend`
4. Run the first migration (requires a running Postgres): `npm run prisma:migrate --workspace=apps/backend`
5. Start the dev server: `npm run dev` (from this directory) or `npm run dev:backend` (from repo root)

The server starts on `http://localhost:4000` by default. Check `GET /health` to confirm it's up.

## Notes

- Phase 0 scaffolding only: no auth, no business routes yet — just the Express app shell, Prisma schema, and a health check endpoint.
- The Prisma schema is a first-pass design inferred from the entity list in the project plan; expect it to evolve (e.g. auth fields, refresh tokens, soft deletes) as features are built.
