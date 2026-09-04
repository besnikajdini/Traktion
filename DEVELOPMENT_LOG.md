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

## Phase 2 — Progress & Motivation

Goal: give the user feedback on how they're improving over time — automatic personal
records, a summary after each workout, a progress chart per exercise, and a weekly streak.
Along the way, this phase also switched to a richer exercise database (with real
demonstration videos) and added search filters to the exercise picker.

### New exercise database

Switched from the previous exercise list to
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) — 1324
exercises with muscle/equipment data, step-by-step instructions, and a short looping
animation (technically a GIF, not a video file) for each one.

**Important licensing note.** This dataset's text (names, instructions, muscle/equipment
data) is MIT-licensed — free to use. Its **images and animations are not** — they're owned
by a company called Gym visual, and the dataset's author only has permission to show them in
his own repo, not to hand that permission on to other projects. This was flagged clearly
before building anything, and the decision (made by the project owner, knowingly) was to use
the media anyway. Two things were done to reduce the risk: every exercise's copyright notice
("© Gym visual — https://gymvisual.com/") is stored and shown on screen next to its image,
and the media is linked directly from the source repository rather than copied into this
project. This is still not a fully licensed use of that media, and should be revisited
before this app is ever shown to a wide audience or submitted anywhere with legal review.

### Exercise picker filters

Added two buttons under the search bar: "Muscle" and "Equipment". Tapping one opens a list
(all values that actually exist in the database) to filter by. Both can be used together
with a text search.

### Exercise detail screen

Tapping an exercise (from a plan, or from the ⓘ next to its name during a workout) opens a
screen with three tabs:
- **Summary** — the exercise's animation, a progress chart (see below), and personal
  records for that exercise.
- **History** — every set ever logged for that exercise, grouped by workout day.
- **Instructions** — the animation again, followed by step-by-step instructions.

### Automatic personal records

Every time a set is saved, it's checked against every earlier set for that same exercise
(for that user, across all their workouts) in two ways:
- **Max weight** — is this the heaviest weight ever lifted for this exercise?
- **Max volume** — is weight × reps for this one set higher than any single set before it?

A set can earn 0, 1, or both of these at once — they're tracked separately (e.g. a lighter
set with more reps can set a new volume record without touching the weight record). The very
first time an exercise is ever logged, that set automatically earns both records, since
there's nothing earlier to compare it to.

### End-of-workout summary

Tapping "Finish" on a workout now leads to a summary screen instead of just closing it:
total time spent, total weight moved (sum of weight × reps across every set), and any
personal records earned during that specific workout.

### Progress chart

Shows two things over time for one exercise: the heaviest weight lifted per workout, and the
total weight moved per workout — switchable with a toggle. If there are fewer than 2 workouts
logged for that exercise yet, it shows a message asking to log more instead of an empty or
misleading chart.

**Library choice**: no charting library was added. The chart is a small hand-built component
using `react-native-svg` (a well-supported, dependency-light package that's guaranteed to
work the same way this project already tests it — with Expo Go, no separate "development
build" needed). Popular chart libraries considered (`react-native-gifted-charts`,
`victory-native`) pull in extra native dependencies that either need a custom Expo build or
add real risk of not working in Expo Go without a device to verify on. Since the actual
chart needed here is simple — one line, a handful of points — building it directly avoided
that risk entirely.

### Weekly streak

Shown as a number on the Home tab. This is a **policy decision, not a fact** — worth
revisiting if it doesn't feel right in practice:

- A week runs Monday to Sunday.
- A week "counts" if at least one workout was finished (not just started) during it.
- The streak counts *consecutive* counting weeks, most recent first.
- **Grace period**: if this week doesn't have a workout yet, the streak doesn't drop to zero
  immediately — it keeps showing last week's count until a full week goes by with nothing
  logged. This matches how apps like Duolingo handle streaks, and avoids the streak looking
  "broken" every Monday morning before the user has had a chance to work out.
- The Home tab also shows the longest streak ever reached, if it's higher than the current one.

### What was and wasn't tested this session

Same limitation as Phase 1: no phone/simulator available here, so the actual screens
couldn't be seen. What *could* be checked, and was: a script called the backend directly to
verify the trickiest logic — that a set can earn a weight record and a volume record
independently, that identical sets don't earn duplicate records, that the progress numbers
add up correctly per workout, and that the streak's "3 weeks in a row, then a gap, then an
isolated week" scenario computes exactly 3 for both the current and longest streak. All of
that passed. What still needs a real device: the new exercise detail screen's layout (video
size, tab switching), the filter buttons, and the progress chart actually rendering
correctly on screen.

### The database had to be wiped and rebuilt for this phase

Switching exercise datasets meant changing the shape of the `Exercise` table (new columns
like `bodyPart`, `target`, `gifUrl`, ...) and the `PersonalRecord` table (added a `type`
column and new relations). That kind of change can't be applied on top of existing rows that
don't have those columns, so the local development database was fully reset — every table
emptied — before the new schema and the new exercise data went in.

This is a genuinely destructive, irreversible action, so it wasn't done automatically: the
tooling itself (Prisma) refused to run it without a clear, explicit go-ahead from the project
owner, spelling out exactly what would be deleted first. That confirmation was given, and
only local development data was lost — the old (now-replaced) exercise list, and whatever
test accounts/plans/workouts existed from testing Phase 1. Nothing that was ever deployed or
shown to real users. After the reset, exercises were reseeded from the new dataset (see
above), but any account created before the reset needs to be registered again.

---

## Phase 3 — Food Tracking

Goal: let a user log meals in their own words ("150g di petto di pollo e una porzione di
riso"), have the app estimate calories/protein/carbs/fat for that meal automatically, see a
daily calories-in / calories-remaining overview, set a personal daily calorie goal, and save
favorite meals to re-log with one tap instead of retyping them.

### How macros get calculated from free text — and why

This was flagged as the one delicate technical decision in this phase, and it went through
two rounds of confirmation with the project owner before any code was written.

**Round 1 — which kind of approach.** Three options were on the table: (a) ask Claude to
estimate macros directly from the text, (b) call an external nutrition API with a real food
database, or (c) build a small local food list with fuzzy matching. The recommendation was
(a), reasoning that a local food database needs matching/unit-conversion logic built from
scratch, and the user writes in Italian with non-standard portions ("una porzione di..."),
which a hardcoded list handles badly. **The project owner picked (b) instead** — an external
nutrition API — overriding that recommendation.

**Round 2 — which API, and how to handle Italian.** (b) still needed two follow-up decisions:
- **Nutritionix vs. Edamam.** Both offer a natural-language endpoint built for exactly this
  ("I ate 2 slices of pizza and a coke" → matched foods + macros from a real food database).
  Nutritionix was picked.
- **The Italian-language gap.** Nutritionix's natural-language endpoint is tuned for English;
  neither Nutritionix nor Edamam handle Italian food text reliably. The chosen fix: translate
  the description to English with a small Claude call *before* sending it to Nutritionix,
  store the original Italian text on the `FoodEntry` (so the user always sees what they
  typed), and only use the translation internally for the lookup.

**Net result — two API calls per new meal, chained:**
1. `src/services/nutrition.service.ts`'s `translateToEnglish()` — one Claude Opus 5 call
   (low effort, ~short output) that translates the description, or passes it through
   unchanged if it's already in English.
2. Nutritionix's `POST /v2/natural/nutrients` with that English text — returns one or more
   matched foods, each with its own calorie/protein/carb/fat figures. These are summed across
   all matched foods in the description (e.g. "chicken and rice" → 2 foods, macros added
   together) into one total for the meal.

Both calls are billed/rate-limited, so **the result is stored on `FoodEntry` and never
recalculated** — re-viewing a meal, or re-logging it as a favorite, always reads the stored
numbers. If Nutritionix can't match any food in the (translated) text at all, the meal is
rejected with a 422 and an Italian message asking the user to be more specific, rather than
silently saving zeroed-out macros.

**Known limitation, flagged rather than papered over:** the translation step is itself an
approximation layered in front of an already-approximate macro estimate — a mistranslated
quantity or food name will silently produce a wrong-but-plausible-looking macro figure.
Nutritionix's own matching can also be imprecise for home-cooked, mixed, or unusually
described meals. This is an accepted MVP tradeoff, not a hidden bug — worth remembering if
numbers look consistently off in practice.

### What got built

- **Data model**: `FoodEntry` (meal category, the raw description the user typed, the four
  stored macro numbers, timestamp) and a new `FavoriteMeal` table for quick-log (its own copy
  of a description + macros, independent of whether the original `FoodEntry` still exists).
  `User` gained an optional `dailyCalorieGoal`.
- **Add a meal** (`FoodLog` tab → `+ Aggiungi pasto`): pick a category (colazione / pranzo /
  spuntino / cena — defaults to whichever fits the current time of day), type a free-text
  description, tap to calculate. Once saved, the screen shows the computed calories and
  protein/carbs/fat for that specific meal, with a "Salva come preferito" button.
  Backend: `POST /food-entries`.
- **Quick log / favorites**: saving a meal as a favorite stores its description + macros
  as-is. The same screen's "Preferiti" list shows every saved favorite; tapping one logs it
  immediately (today, using its stored category and macros) with no retyping and no new
  macro-estimation call. Backend: `GET/POST /favorite-meals`, `POST /favorite-meals/:id/log`.
- **Daily overview** (`FoodLog` tab home): today's total calories, calories remaining against
  the goal (or a prompt to set one, if none is set yet), a protein/carbs/fat breakdown, and
  every logged meal grouped by category — tap a meal to delete it.
  Backend: `GET /food-entries/summary`, aggregating all of a user's `FoodEntry` rows for one
  day.
- **Calorie goal**: a dedicated screen (reachable via "Obiettivo" in the FoodLog header) to
  set/update the daily calorie goal. Backend: `PUT /auth/me/nutrition-goal`.

**Policy simplification, same category as the Phase 2 streak's Monday–Sunday weeks:** "today"
is computed from the phone's local calendar date but treated by the backend as a UTC calendar
day. Right around midnight, depending on the user's timezone, a meal can end up counted on the
"wrong" day by a few hours. Not fixed for this MVP — flagged here in case it matters later.

### What was and wasn't tested this session

Same constraint as Phases 1 and 2: no phone/simulator available here, so the actual screens
were never seen — the meal-category chips, the favorites list, the result card, the daily
overview layout, and the calorie-goal screen all still need a real look. Also new to this
phase: **live macro estimation itself was never tested end-to-end**, because it depends on
two API credentials — `ANTHROPIC_API_KEY` and a Nutritionix `NUTRITIONIX_APP_ID` /
`NUTRITIONIX_API_KEY` pair — that this session doesn't have (Nutritionix requires signing up
for their free tier; see `.env.example`). The project owner needs to add real values for
those three before "Calcola e salva" will actually return numbers instead of a 500.

What *could* be tested, and was, by running the real backend against a real (locally-run)
Postgres and calling every other endpoint directly: the calorie-goal validation and
persistence, every input-validation rule (bad meal category, empty description, malformed
date, non-numeric favorite macros), the daily-summary aggregation math (sum of calories and
each macro across multiple meals, remaining-calories arithmetic against the goal), that
deleting a meal or a favorite actually removes it (and 404s on a second delete), that logging
a favorite creates a `FoodEntry` with exactly the favorite's stored macros and folds correctly
into that day's summary total, and that one user's meals stay invisible to another user. All
24 checks passed. The `POST /food-entries` happy path (the actual translate → Nutritionix →
save chain) was separately confirmed to fail *gracefully* — a clean 500, not a crash — when
the credentials are unset, by inserting `FoodEntry` rows directly via Prisma to exercise
everything downstream of macro estimation instead.

---

## How to run it

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env   # set your database URL and a login-token secret
                                                  # (+ ANTHROPIC_API_KEY / NUTRITIONIX_* for food tracking)
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

These are planned for later phases, on purpose:

- Social feed (Phase 4)
