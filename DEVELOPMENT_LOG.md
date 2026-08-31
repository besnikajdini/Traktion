# Traktion — Development Log

This file explains what was built in each phase of the project, in plain language, so anyone
can follow along without reading all the code. It matches the phases in `project-plan.md`.

---

## Phase 0 — Project Setup

Goal: get the project skeleton in place, no real features yet.

- Created the repo with 4 parts: `apps/mobile` (the phone app), `apps/backend` (the server/API),
  `apps/website` (a portfolio website for the project), and `packages/shared-types` (shared
  code used by both the app and the server).
- **Mobile app**: built with Expo (React Native) + TypeScript. Basic navigation with 5 tabs:
  Home, Workouts, Progress, Food Log, Profile. Each tab just showed a placeholder screen.
- **Backend**: built with Node.js + Express + TypeScript. Connected to a PostgreSQL database
  using Prisma. The database design (tables for users, exercises, workout plans, workout
  sessions, logged sets, personal records, food entries) was drafted here. Only one working
  endpoint: a health check.
- **Website**: a basic Next.js starter page, not built out yet.
- **Shared types**: a small package with TypeScript types shared between the app and the
  server, so both sides agree on what a "workout plan" or "exercise" looks like.

Nothing was functional yet — it was just the empty structure to build on.

---

## Phase 1 — Workout Tracker MVP

Goal: let a user log in, build a workout plan, start a workout, and log their sets with an
automatic rest timer. Also went back and finished two things from Phase 0 that had been
skipped: login/accounts and the visual design.

### Accounts (login & register)

- Users can create an account and log in with email + password.
- Passwords are never stored as plain text — they're scrambled with bcrypt before being saved.
- After logging in, the app gets a login token (JWT) which it keeps safely stored on the
  phone (in the device's secure storage, not a plain file) and sends with every request so
  the server knows who's asking.
- The app remembers the login between app restarts, and shows a login/register screen if
  nobody's logged in yet.
- The Profile tab shows the logged-in user's name and email, with a log-out button.

### Exercise database

- Used a free, public list of about 900 exercises (name, muscle group, equipment, a photo)
  as the starting exercise catalogue, loaded into the app's own database.
- Users can search this list by name when building a workout.

### Workout builder

- Users can create a workout plan: give it a name, then add exercises to it by searching the
  catalogue.
- For each exercise added, the user sets: how many sets, how many reps (optional), and how
  long to rest between sets (in seconds).
- Plans can be saved, edited, and deleted.

### Starting and running a workout

- Users pick a saved plan and start a workout session from it.
- The session screen shows every exercise in the plan, with one row per set to fill in.
- If the app is closed mid-workout, reopening it offers to pick the session back up where it
  was left.

### Logging a set

- For each set, the user types in the weight and reps, then taps a checkmark to confirm it.
- While typing, the app shows a small hint: "last time: X kg / Y reps" — pulled from the last
  time that exact exercise was logged, so the user knows what to aim for.
- Confirming a set can be undone (in case of a mistake).

### Rest timer

- As soon as a set is confirmed, a countdown starts automatically, using the rest time set for
  that exercise in the plan.
- In the last 5 seconds, the phone vibrates once per second, and a notification fires when the
  timer hits zero — so the user notices even if they've looked away from the app.
- The user can add or remove 15 seconds from the timer at any point, without resetting it.

### Design

- Gave the app a proper look: a dark blue-and-black color scheme with bold, athletic-style
  fonts (Barlow / Barlow Condensed), plus icons in the tab bar. Built using the project's
  design-system tool, matching the "Gymshark style" the project plan asked for.

---

## How to run it

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env   # set your database URL and a login-token secret
npm install
npm run prisma:generate --workspace=apps/backend
npm run prisma:migrate --workspace=apps/backend
npm run prisma:seed --workspace=apps/backend       # loads the exercise catalogue
npm run dev:backend

# Mobile (separate terminal)
cp apps/mobile/.env.example apps/mobile/.env       # point it at your backend's address
npm run dev:mobile
```

Then in the app: register an account → open the Workouts tab → create a plan → start it →
log a set and watch the rest timer kick in.

---

## Testing Phase 1

Once Phase 1 was built, it was tested for real — not just read through — to make sure it
actually works. Here's how, step by step.

### 1. Set up a real database and ran the backend

- Started a PostgreSQL database using Docker: `docker run` with a Postgres 16 image.
- Ran the database migration (`prisma migrate dev`), which creates all the tables from
  `schema.prisma` in that fresh database.
- Ran the seed script (`prisma:seed`), which loaded the ~900 exercises into the database.
- Started the backend (`npm run dev:backend`) so it could actually answer requests.
- Started Prisma Studio (`npx prisma studio`), a web page that lets you browse the database
  tables directly, to check the data by eye.

### 2. Automated test of the full user flow

Instead of clicking through the app by hand for this first pass, a small script called the
backend's API directly, doing exactly what the app itself would do — this catches problems
faster and checks things a human might miss. The script:

1. Registered a new account and logged in.
2. Checked that a request without being logged in gets rejected (proves login is actually
   required, not optional).
3. Searched the exercise catalogue and picked 3 real exercises.
4. Built a workout plan with **different** sets/reps/rest time for each of the 3 exercises
   (e.g. 4 sets / 120s rest for one, 5 sets / 180s rest for another) — then read the plan back
   and checked every value matched exactly, to prove nothing was hardcoded to one fixed number.
5. Started a workout session and checked the session data includes the correct rest time for
   each exercise (this is the exact data the app's rest timer reads).
6. Logged a set, ended that session, and started a **new** session — then checked that the
   "last time: X kg / Y reps" hint correctly showed the set from the previous session, before
   typing anything new. Logged a new set with a different weight, and checked the hint updated.
7. Deleted (undid) a logged set and confirmed it was really gone.
8. Registered a second account and confirmed it could **not** see the first account's plan —
   proves each user only sees their own data.

Result: all 22 checks passed.

### 3. Checked the database directly

Ran a script that reads straight from Postgres (the same data Prisma Studio shows) to confirm
the API test above wasn't lying about what got saved: correct row counts, the workout plan
with its 3 exercises in the right order and the right settings, both sessions with their sets
correctly linked to the right session and the right exercise, and zero "orphaned" records
(nothing pointing to something that doesn't exist).

### 4. Tested on a real phone with Expo Go

The countdown timer, vibration, and notification can only really be checked on a real phone —
so the app was also opened for real:

- Started the app's bundler (`npx expo start`) and connected a phone running Expo Go to it
  over the same Wi-Fi network.
- Hit "Network request timed out" when trying to log in from the phone. Diagnosed it by
  checking active network connections on the computer: the phone could reach the bundler
  (port 8081) but zero connections were reaching the backend (port 4000) — a sign of Windows
  Firewall silently blocking that port for incoming connections, not an app bug.
- Fixed it by adding a Windows Firewall rule to allow incoming connections on port 4000. After
  that, login worked from the phone.

This firewall step is worth remembering: **whenever the backend is tested from a phone (not
the same computer), the backend's port needs to be allowed through the firewall first**, or
every request from the phone will silently time out.

---

## Not built yet

These are planned for later phases, on purpose — not part of Phase 1:

- Progress charts (weight/volume over time)
- Automatic personal record detection
- Workout streaks
- Food tracking
- Social feed
