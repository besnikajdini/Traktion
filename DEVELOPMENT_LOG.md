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

### How macros get calculated from free text — and why (this changed mid-phase)

This was flagged as the one delicate technical decision in this phase, and it went through
**three** rounds of confirmation with the project owner — the first two picked an approach
that a live check then disproved, so the decision was reopened rather than shipped anyway.

**Round 1 — which kind of approach.** Three options were on the table: (a) ask Claude to
estimate macros directly from the text, (b) call an external nutrition API with a real food
database, or (c) build a small local food list with fuzzy matching. The recommendation was
(a), reasoning that a local food database needs matching/unit-conversion logic built from
scratch, and the user writes in Italian with non-standard portions ("una porzione di..."),
which a hardcoded list handles badly. **The project owner picked (b) instead** — an external
nutrition API — overriding that recommendation.

**Round 2 — which API, and how to handle Italian.** (b) still needed two follow-up decisions:
Nutritionix was picked over Edamam (both offer a natural-language endpoint built for exactly
this), and — since neither handles Italian food text reliably — the plan was to translate the
description to English with a small Claude call before sending it to Nutritionix. This
version was fully built: schema, both API integrations, endpoints, and the mobile screens.

**Round 3 — reopened, because Round 1/2 turned out to be built on stale information.** When
the project owner went looking for the promised free tiers to actually get API keys, they
found Nutritionix required payment. A live check confirmed it from this side too: **both**
`developer.nutritionix.com`'s pricing page and Edamam's pricing page returned an outright
HTTP 402 Payment Required when fetched during this session — whatever free tier either of
them had at the time Round 1/2's information was assumed no longer exists in a usable form.
Rather than ship a feature that needs a paid account to function at all, the project owner
asked for genuinely free alternatives, and the decision was reopened. This is the reason the
approach changed *after* being fully implemented once already — worth remembering as a
reminder that "API has a free tier" is exactly the kind of fact that goes stale and deserves
a live check before committing to it, not just before shipping.

**Final decision: option (c) from round 1 — a local food table, matched against free text.**
No external API, no key, no cost, no network call, ever. The trade-off flagged back in round 1
is real and is exactly what shipped: it only recognizes foods present in a small hand-curated
table (`src/data/foods.ts`, ~35 common Italian foods at launch — chicken breast, eggs, rice,
pasta, bread, common fruits/vegetables, etc.) and only fairly standard quantity phrasing
("150g di...", "una porzione di...", "2 uova"). Extending coverage means adding rows to that
one file — no code change needed for a new food.

**How the matching actually works** (`src/services/nutrition.service.ts`):
1. The description is lowercased and split into segments on `,`, `;`, `\n`, and the connector
   words " e " / " con " / " più " (so "100g di pasta con un cucchiaio di olio d'oliva"
   becomes two segments, one per food — an early bug, caught by testing, was that without
   splitting on "con" the second food in a sentence like that was silently dropped and its
   quantity misapplied to the first).
2. Each segment is parsed for a leading quantity (a digit, or an Italian number word like
   "due"/"tre") and a unit (grams/kg, tablespoon/teaspoon/cup/glass, or a countable unit —
   "fetta", "pezzo", "uovo" — resolved against that specific food's own typical unit weight).
   "Una porzione" (or no quantity/unit at all) falls back to that food's own default portion
   size, since "a portion of rice" and "a portion of olive oil" obviously aren't the same
   number of grams.
3. What's left of the segment is matched against every food's alias list by substring — the
   *longest* matching alias wins, so "petto di pollo" (chicken breast) is preferred over a
   shorter, more generic alias like "pollo" when both could match.
4. Grams are converted to macros via that food's per-100g figures, and every recognized
   segment's contribution is summed into one total for the whole entry.

**The result is stored on `FoodEntry` and never recalculated** — re-viewing a meal, or
re-logging it as a favorite, always reads the stored numbers (this part of the design didn't
change across rounds). If nothing in the description matches any known food at all, the meal
is rejected with a 422 and an Italian message asking the user to be more specific, rather than
silently saving zeroed-out macros.

**Known limitations, flagged rather than papered over:** only foods in the table are
recognized at all (anything else, including most home-cooked or restaurant dishes as a single
named thing, will 422 unless described by its recognizable ingredients); only one food is
credited per segment, so two foods mentioned back-to-back with no connector word this parser
knows ("pasta pomodoro" instead of "pasta con pomodoro") will only count the one with the
longer matching alias; and per-100g figures are single fixed averages (a real "petto di
pollo" varies by cut and cooking method) — this is an approximation, not a lab measurement,
same as any MVP nutrition estimate would be.

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
overview layout, and the calorie-goal screen all still need a real look.

Everything on the backend *could* be tested, though, including — unlike the first version of
this phase — **live macro estimation itself**, since the final approach needs no external
credentials at all. By running the real backend against a real (locally-run) Postgres and
calling the real HTTP endpoints directly: `POST /food-entries` with "150g di petto di pollo e
una porzione di riso" returns a sane, storeable calorie/macro figure (not a stub); the earlier
"con" connector-word bug was caught exactly this way, by asserting that "100g di pasta con un
cucchiaio di olio d'oliva" credits fat to the entry (proving the olive oil wasn't silently
dropped) rather than just checking the endpoint returns *some* number; a description with no
recognizable food (a nonsense phrase) 422s with a friendly message instead of saving zeroed-out
macros; the daily summary's totals exactly match the sum of the entries that produced them;
remaining-calories arithmetic is correct against the goal; saving a real computed entry as a
favorite and then quick-logging it reproduces its exact stored macros, with no recomputation;
the calorie-goal validation and persistence work; and one user's meals stay invisible to
another user. All 13 checks passed (plus the 24 broader CRUD/validation checks from the
Round 2 version of this feature, which still hold unchanged since the API surface didn't
change — only what happens inside `estimateMacros()` did).

### Closing out Phase 3: a bigger, sourced food table

The local food table (`src/data/foods.ts`) started at ~35 hand-typed foods, which is thin
coverage for a real diet. To close out the phase, it was expanded to **~135 foods** using
per-100g figures from the **USDA FoodData Central** SR Legacy dataset
(https://fdc.nal.usda.gov) — free, in English, public domain (CC0), queried via its API with
the no-signup `DEMO_KEY` purely as a *data source* during development, not as a runtime
dependency; `estimateMacros()` still makes zero network calls, matching the Round 3 decision
above. New coverage: more meats/fish (pork, lamb, veal, cured meats, cod, shrimp, sea bass,
sea bream, mackerel, anchovies, octopus, mussels), more dairy (ricotta, cream cheese, feta,
cream, kefir), plant proteins (tofu, tempeh, seitan, peas, edamame), more grains — using
*cooked* values to stay consistent with the existing rice/pasta entries (quinoa, farro, pearl
barley, couscous, polenta, gnocchi, crispbread, crackers, breadsticks, muesli), more
vegetables, fruits, nuts/seeds, condiments, sweets/snacks, drinks, and a few common composite
dishes (lasagna, risotto, minestrone, focaccia, tiramisù, croissant, sandwich, burger patty).

Expanding the table surfaced a real matching bug: `matchFood()` picked whichever alias was
*longest*, with no regard for where it appeared. For "gelato al cioccolato" (chocolate ice
cream), that meant "cioccolato" (10 letters) beat "gelato" (6 letters) even though "gelato" is
the actual dish being named — the entry got silently priced as 20g of dark chocolate instead
of a portion of ice cream. Fixed by preferring whichever alias starts **earliest** in the
segment, falling back to length only when two aliases start at the same position (which is
what keeps "petto di pollo" beating the shorter "pollo" it contains). Re-ran the full
regression set — every previously-working phrase (`petto di pollo`, `pollo alla griglia`,
`pane integrale`, `insalata mista`, `verdure miste`, `cioccolato fondente`, `barretta
proteica`, `pizza margherita`, `proteine whey`, the `con`-connector case) still resolves to
the same food it always did, plus the new one now resolves correctly too.

---

## Phase 4 — Social

Goal: let a user optionally share a finished workout (volume, PRs, duration, an optional
photo) with people who follow them, and let people find and follow each other and react to
what they see — entirely opt-in, since this phase touches other people's data (who follows
whom) and a user's own workout details in a way no earlier phase did.

### Decisions made before writing any code

Two things in the phase description were genuinely ambiguous and were confirmed with the
project owner before implementation started, rather than guessed at:

1. **Is a shared WorkoutPost visible to anyone, or only to followers?** Picked: visible to any
   authenticated user (a public profile, like Twitter), not gated by follow status. Following
   only curates what shows up in *your own* feed — it's not a visibility permission. This
   matches the plan's own wording ("profilo pubblico") and keeps the authorization model to
   one rule instead of two.
2. **Does following require the other user's approval?** Picked: no — follow is instant,
   one-directional, no request/accept step (no private-account concept exists in this app).

A third, smaller decision made during implementation rather than asked about: reactions are
**one per user per post** (not one-per-emoji-type like Slack). Tapping an emoji sets it as your
reaction; tapping the same one again removes it; tapping a different one switches it. Simpler
UI (no multi-select state to show), and matches how the single-tap interaction was described.

### Privacy and consent — how "nothing shared without explicit consent" actually holds

- `User.autoShareWorkouts` (default **off**) controls one thing only: whether the mobile app
  *offers* the end-of-session share prompt at all. If it's off, that prompt never appears, and
  since `POST /workout-posts` is the *only* code path that can ever create a WorkoutPost —
  nothing calls it automatically, anywhere in the backend — a user who never turns this on can
  never end up with a shared workout.
- Even with it on, reaching the prompt never shares anything by itself. "Non condividere" (or
  navigating away) exits with nothing created. Sharing always requires the explicit
  "Condividi" tap, which is itself the consent for that one workout — this is also why the
  backend doesn't re-check `autoShareWorkouts` server-side before accepting the request: the
  explicit call already **is** the per-workout consent the setting exists to gate at the UI
  level.
- The feed and every `/users/*` and `/workout-posts/*` route sit behind `requireAuth` (see
  `app.ts`) — nothing here is reachable logged out.
- A user can delete their own WorkoutPost at any time (`DELETE /workout-posts/:id`, scoped to
  `userId` in the same query, so it 404s rather than 403s on someone else's post — consistent
  with how `favoriteMeals.service.ts` already scoped ownership in Phase 3).

### Data model

- `WorkoutPost` — one per `WorkoutSession` (unique FK), created only by explicit share. Stores
  a **snapshot**, never recomputed: `totalVolumeKg`, `durationSeconds`, `personalRecords`
  (JSON array of `{exerciseName, type, weightKg, reps}`, captured from the same PR rows the
  Phase 2 session summary reads), and an optional `photoUrl`. Same "compute once, store,
  never recompute" policy as `FoodEntry`'s macros in Phase 3.
- `Follow` — `followerId` → `followingId`, unique pair, instant (see decision #2 above).
- `Reaction` — `userId` + `workoutPostId` unique (see the one-per-user decision above), one of
  a fixed `ReactionType` enum: `FIRE` 🔥, `STRONG` 💪, `CLAP` 👏, `HEART` ❤️ — not free-form.
- `User` gained `username` (unique, required — needed for search, since searching by email
  would leak email addresses) and `autoShareWorkouts` (default `false`).

**A real migration wrinkle:** adding a required, unique `username` to `User` isn't safe to
autogenerate against a non-empty table (`prisma migrate dev` refuses to run non-interactively
here, and this project's dev database already had 4 real accounts from earlier phases'
testing). Handled the standard way: generated the migration with `--create-only`, hand-edited
it to add the column nullable first, backfill a username from each existing email's local part
(lowercased, non-username characters replaced with `_`, with a collision fallback that's untested
in practice since none occurred), *then* lock it to `NOT NULL UNIQUE` in the same migration —
and verified the backfill against the real dev rows before moving on.

### Photos: Cloudinary, without giving the backend a new job

The plan calls for Cloudinary specifically for image storage. Rather than route photo bytes
through the backend (multipart handling, a Cloudinary server SDK, API secret management), the
phone uploads directly to Cloudinary using an **unsigned upload preset** — safe to ship inside
the app because an unsigned preset can only accept new uploads, never read, list, or delete
anything. The backend only ever receives and stores the resulting `https://res.cloudinary.com/...`
URL, and validates it's actually a Cloudinary URL before saving (rejects an arbitrary
attacker-supplied URL rather than trusting the client). See `apps/mobile/.env.example` for the
two-variable setup (cloud name + unsigned preset name) — sharing a photo silently fails without
them configured, but nothing else in the app depends on Cloudinary at all.

### What got built

- **Settings**: a new "Impostazioni" screen (Profile tab → Impostazioni) with the
  auto-share toggle, explaining in-line what it does and doesn't do. Backend:
  `PUT /auth/me/auto-share-workouts`.
- **Share prompt**: after the Phase 2 end-of-session summary, if auto-share is on, "Done"
  routes to a new screen asking to share (with an optional photo picker) instead of exiting
  straight to the tab bar; if it's off, "Done" behaves exactly as it did in Phase 1/2. Backend:
  `POST /workout-posts` (rejects sharing a session that hasn't ended yet, and rejects sharing
  the same session twice).
- **Social feed** (new bottom tab): a paginated, cursor-based feed (`GET
  /workout-posts/feed?cursor=&limit=`) of posts from users the caller follows, newest first,
  loading another page on scroll. Each card shows the poster's name, optional photo, total
  volume, duration, every PR earned, and the reaction bar.
- **Search + follow**: `UserSearch` screen (username/name substring search,
  `GET /users/search?q=`) with an inline follow/unfollow toggle; `UserProfile` screen
  (`GET /users/:id/profile` for name/username/follower/following counts + follow state, `GET
  /users/:id/workout-posts` for their paginated shared posts) reused for both other users
  (with a Segui/Smetti di seguire button) and, implicitly, for viewing your own posts list when
  `isSelf` is true (in which case each post gets a delete option instead of a follow button).
- **Reactions**: `POST /workout-posts/:id/reactions` with `{ type }`, toggling per the
  one-reaction-per-user rule above — no separate screen, just the emoji row under each card.

### What was and wasn't tested this session

Same constraint as every earlier phase: no phone/simulator available here, so the actual
screens (feed, search, profile, share prompt, settings toggle) were never visually checked —
only that they type-check cleanly against the real navigation/param types and the real shared
DTOs (`npx tsc --noEmit` clean on both `apps/backend` and `apps/mobile` after every change).

The backend was tested end-to-end for real, the same way as Phase 1/3: a script against the
real running backend + real (locally-run) Postgres, covering the sensitive paths specifically
because this phase is privacy-sensitive — 34 checks, all passing, including: `autoShareWorkouts`
defaults to `false` on a fresh account; sharing an in-progress (not-yet-ended) session is
rejected; sharing the same session twice is rejected; a shared post correctly snapshots volume
and *both* PRs earned by a single heavy set (matching Phase 2's own PR logic); a non-Cloudinary
`photoUrl` is rejected; another user can see a shared post and find its owner by username
search *before* following them (proving the "public profile, not follower-gated" decision is
actually what's implemented); the feed is empty before following and populated immediately
after; a user cannot follow themselves; reacting, switching reactions, and un-reacting via a
repeat tap all produce the right counts; unfollowing empties the feed again; a user cannot
delete someone else's post (404) but can delete their own; the auto-share toggle persists;
and both the feed and user search 401 without a token. A second script specifically verified
cursor pagination (3 pages across 5 posts, no repeats, correct end-of-list signal).

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

These are excluded on purpose, either because they belong to a later phase or because the
project owner explicitly scoped them out when Phase 4 was requested:

- Extended text comments on a WorkoutPost (only the fixed 4-emoji reactions exist)
- Push notifications for new followers or reactions
- Direct messaging between users
- Phase 5 (Rifinitura e Portfolio) — public deploy, portfolio website, final UI polish
