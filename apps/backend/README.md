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

1. Copy `.env.example` to `.env`, point `DATABASE_URL` at a local PostgreSQL instance, and set `JWT_SECRET` (the file tells you how to generate one).
2. Install dependencies from the repo root: `npm install`
3. Generate the Prisma client: `npm run prisma:generate --workspace=apps/backend`
4. Run the first migration (requires a running Postgres): `npm run prisma:migrate --workspace=apps/backend`
5. Seed exercises + the demo user: `npm run prisma:seed --workspace=apps/backend`
6. Start the dev server: `npm run dev` (from this directory) or `npm run dev:backend` (from repo root)

The server starts on `http://localhost:4000` by default. Check `GET /health` to confirm it's up.

## API

Every route below except `/health` and `/auth/register` + `/auth/login` requires a JWT: send
`Authorization: Bearer <token>` (obtained from register/login). `src/middleware/requireAuth.ts`
verifies it and attaches the user id as `req.userId`.

| Method | Path                        | Purpose                                                                 |
| ------ | --------------------------- | ------------------------------------------------------------------------ |
| POST   | `/auth/register`            | Create an account (`{ email, password, name }`) → `{ user, token }`     |
| POST   | `/auth/login`                | `{ email, password }` → `{ user, token }`                              |
| GET    | `/auth/me`                  | Get the current user from the token                                     |
| GET    | `/exercises?search=&muscleGroup=` | Search the seeded exercise catalogue (free-exercise-db)            |
| GET    | `/exercises/:id`            | Get one exercise                                                        |
| GET    | `/workout-plans`            | List the user's saved plans (summary + exercise count)                  |
| POST   | `/workout-plans`            | Create a plan with its exercises in one call                            |
| GET    | `/workout-plans/:id`        | Get a plan with its ordered exercises                                   |
| PUT    | `/workout-plans/:id`        | Replace a plan's name/description/exercises                             |
| DELETE | `/workout-plans/:id`        | Delete a plan (cascades to its PlanExercise rows)                       |
| GET    | `/workout-sessions/active`  | Get the user's in-progress session (`endedAt: null`), if any            |
| POST   | `/workout-sessions`         | Start a session from a plan (`{ workoutPlanId }`)                       |
| GET    | `/workout-sessions/:id`     | Get a session with its plan and logged sets                             |
| POST   | `/workout-sessions/:id/end` | Mark a session finished (`endedAt = now`)                               |
| POST   | `/set-logs`                 | Log one completed set                                                   |
| GET    | `/set-logs/last?exerciseId=`| Most recent completed set for that exercise (powers the "last time" hint)|
| DELETE | `/set-logs/:id`             | Undo a logged set                                                        |

## Notes

- Phase 1 (Workout Tracker MVP) plus the Phase 0 auth that had been deferred are both implemented — see `/DEVELOPMENT_LOG.md` at the repo root for the full write-up of what was built and why.
- `prisma/data/exercises.json` is a vendored copy of [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain), seeded via `prisma/seed.ts` — including each exercise's first thumbnail, stored as a full `imageUrl` pointing at the dataset's own GitHub-hosted images.
- Auth is JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`), per `project-plan.md`'s stack table — no refresh tokens yet, tokens are just long-lived (30 days).
- The Prisma schema is a first-pass design inferred from the entity list in the project plan; expect it to evolve (e.g. refresh tokens, soft deletes) as later phases are built.
