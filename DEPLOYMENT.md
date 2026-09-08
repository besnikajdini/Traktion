# Deploying Traktion

Two independent pieces get deployed: the **backend** (Node/Express/Prisma API, to
Railway or Render) and the **website** (Next.js portfolio site, to Vercel). The
mobile app is not deployed anywhere — it's run through Expo Go during development
and would need a separate app-store build process, which is out of scope for this
project.

Both apps live inside one npm-workspaces monorepo (`apps/backend`, `apps/website`,
`apps/mobile`, `packages/shared-types`), so the main thing every platform needs to
be told is: **which subfolder is this service, and what command builds/starts it.**
Neither the backend nor the website depends on `packages/shared-types` (only the
mobile app does), so each deploys as a self-contained npm package — no monorepo-wide
build step is required for either.

---

## 1. Backend → Railway or Render

Either platform works the same way in practice: point it at this GitHub repo, tell
it the backend lives in `apps/backend`, give it a Postgres database, and set two
secrets.

### What's already set up for this in the repo

- `apps/backend/package.json`'s `start` script is
  `prisma migrate deploy && node dist/index.js` — every deploy (and every restart)
  applies any pending Prisma migrations *before* the server starts accepting
  requests. `prisma migrate deploy` is safe to run repeatedly: it's a no-op when
  there's nothing pending, which is what makes it safe to put in `start` rather
  than a separate one-off release step.
- `postinstall` runs `prisma generate`, so the Prisma Client is always regenerated
  from the current `schema.prisma` right after `npm install`, on every platform,
  without a manual step.
- The server already reads `PORT` from the environment (`src/index.ts`), which is
  how both Railway and Render tell an app which port to bind — no code change
  needed.
- This was verified locally end-to-end before writing this doc: `npm run build`
  then `npm run start` against a real local Postgres correctly ran
  `prisma migrate deploy` (`5 migrations found ... No pending migrations to apply`)
  and then served `GET /health` with `200 {"status":"ok"}`.

### Environment variables (both platforms)

| Variable       | Value                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL` | Provided automatically if you add a managed Postgres on the same platform |
| `JWT_SECRET`   | A random secret — generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT`         | Leave unset — both platforms inject this themselves |

### Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select this repo.
2. On the new service: **Settings → Root Directory** → `apps/backend`.
3. **Settings → Build**: Build Command `npm install && npm run build`. Start Command `npm run start` (both already match `apps/backend/package.json`, so this is usually auto-detected — just confirm).
4. **+ New → Database → PostgreSQL** in the same project. Railway auto-injects `DATABASE_URL` into the backend service when both are in the same project — confirm it appears under the backend service's Variables tab.
5. Add `JWT_SECRET` under the backend service's **Variables** tab.
6. Deploy. Check the deploy log for `Traktion backend listening on http://localhost:<PORT>`, then hit `https://<your-service>.up.railway.app/health` — expect `{"status":"ok"}`.

### Render

**Option A — the dashboard, manually:**

1. [dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → connect this repo.
2. **Root Directory**: `apps/backend`. **Runtime**: Node.
3. **Build Command**: `npm install && npm run build`. **Start Command**: `npm run start`.
4. **New → PostgreSQL** (free tier). Once created, copy its **Internal Connection String** into the web service's `DATABASE_URL` env var.
5. Add `JWT_SECRET` as an env var.
6. **Health Check Path**: `/health` (so Render can tell the deploy actually came up healthy, not just that the process started).
7. Deploy, then check `https://<your-service>.onrender.com/health`.

**Option B — the included blueprint:** this repo has a [`render.yaml`](./render.yaml)
at the root. Render → **Blueprints → New Blueprint Instance** → point it at this
repo. It provisions the web service and the Postgres database together and wires
`DATABASE_URL` automatically; it'll still prompt you to fill in `JWT_SECRET`
(deliberately left blank in the file — a secret doesn't belong committed to git).
This wasn't deployed live to verify in this session (no Render account available
here) — if anything doesn't match Render's current blueprint schema, the manual
steps in Option A are the fallback.

### After the first deploy

- The exercise database needs seeding once — Railway/Render both expose a shell/console tab on the service; run `npm run prisma:seed` there once, or run it locally against the production `DATABASE_URL` (`DATABASE_URL="<prod-url>" npm run prisma:seed --workspace=apps/backend` from the repo root).
- Point `apps/mobile/.env`'s `EXPO_PUBLIC_API_URL` at the deployed backend URL to test the mobile app against production instead of localhost.

---

## 2. Website → Vercel

This is close to automatic, per the project plan — Vercel's own monorepo support
handles the npm-workspaces root correctly without extra config.

1. [vercel.com/new](https://vercel.com/new) → import this GitHub repo.
2. Vercel will detect multiple candidate projects in the monorepo; when asked for
   the **Root Directory**, choose `apps/website`. It auto-detects the Next.js
   framework preset from there — build command, output directory, and install
   command need no changes.
3. No environment variables are required — the website is fully static (no API
   calls, no secrets; see `apps/website/src/app/page.tsx`), which is also why it
   builds as static-prerendered output (`npx next build` reports `○ /` — fully
   static — confirmed locally before writing this doc).
4. Deploy. Vercel gives you a `*.vercel.app` URL immediately; attach a custom
   domain later from the project's **Domains** tab if wanted.
5. Every push to `main` auto-deploys from here on — that's Vercel's default, not
   something this repo had to configure.

---

## Summary

| App | Platform | Root dir | Build | Start | Needs a DB |
| --- | --- | --- | --- | --- | --- |
| `apps/backend` | Railway or Render | `apps/backend` | `npm install && npm run build` | `npm run start` | Yes — Postgres |
| `apps/website` | Vercel | `apps/website` | auto (Next.js preset) | auto | No |
