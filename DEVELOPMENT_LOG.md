# Development Log

How I built Traktion, phase by phase, and the decisions I made along the way.

I built the project in 6 phases (0–5). I finished and tested each phase before starting the next one. I used AI (Claude Code) to help write the code; the planning, the decisions and the testing were my part.

---

## Phase 0 – Setup

I set up the project structure as a monorepo with four parts:

- `apps/mobile` – the phone app (React Native + Expo)
- `apps/backend` – the API (Node.js + Express)
- `apps/website` – a small website to present the project (Next.js)
- `packages/shared-types` – TypeScript types shared by the app and the backend, so both agree on what a "workout plan" or an "exercise" looks like

I also designed a first version of the database (users, exercises, plans, sessions, sets, records, food entries).

---

## Phase 1 – Workout tracker

**Login.** Users register and log in with email and password. Passwords are hashed with bcrypt, never stored as plain text. After login the app gets a JWT token, saves it in the phone's secure storage and sends it with every request. On the backend, a middleware (`requireAuth`) checks the token before every protected route.

I chose to build login myself with JWT instead of using Firebase Auth, because I wanted to understand how it works under the hood.

**Workout plans.** You create a plan, search exercises and add them. For every exercise you choose sets, reps and rest time.

**Workout sessions.** You start a plan, enter weight and reps for each set and confirm it. While typing, the app shows what you did last time for that exercise. If the app is closed during a workout, you can continue where you left off.

**Rest timer.** It starts automatically after each set. In the last 5 seconds the phone vibrates and a notification arrives when it's done. You can add or remove 15 seconds. The timer stores the end time instead of counting down, so it stays correct even when the app is in the background.

**Testing.** I tested the backend with a script that calls the API like the app would: register, login, create a plan, start a session, log sets, undo a set, and check that a second user can't see the first user's data. All 22 checks passed. Then I tested the app on my phone with Expo Go.

**Problem I ran into:** from the phone, login always timed out. The phone could reach the Expo bundler, but not the backend. The cause was the Windows Firewall blocking port 4000. After adding a firewall rule, it worked.

---

## Phase 2 – Progress and motivation

**New exercise database.** I switched to a bigger dataset with 1300+ exercises, muscle groups, equipment, step-by-step instructions and animations. The text data is MIT licensed. The images and animations belong to Gym visual, so the app shows their copyright notice and links to the original files instead of copying them. This would need a proper license before a public release.

**Filters.** The exercise picker can filter by muscle and equipment.

**Exercise detail.** Three tabs: summary (animation, chart, records), history (all sets ever logged) and instructions.

**Automatic personal records.** Every time a set is saved, the backend compares it with all earlier sets of the same exercise:

- **Max weight** – heaviest weight ever
- **Max volume** – best weight × reps in a single set

It uses one SQL query with `MAX` and a `JOIN` between sets and sessions. Saving the set and creating the records happens in one transaction, so a record can never exist without its set. The first set ever logged for an exercise counts as a record, because there is nothing to compare it to.

**Workout summary.** After finishing a workout you see the duration, the total weight moved and the records you hit.

**Progress chart.** I drew the chart myself with `react-native-svg` instead of using a chart library. The libraries I looked at needed extra native code that doesn't work with Expo Go, and my chart is simple anyway.

**Weekly streak.** Counts the weeks in a row (Monday–Sunday) with at least one finished workout. Like Duolingo, the streak doesn't reset on Monday morning: it only breaks after a full week without training.

**Note:** changing the exercise table meant resetting my local database. I only lost test data.

---

## Phase 3 – Food tracking

**The idea:** you type a meal in your own words, e.g. "150g di petto di pollo e una porzione di riso", and the app calculates calories, protein, carbs and fat.

**This decision changed three times:**

1. My first plan was to use an external nutrition API (Nutritionix) and translate the Italian text to English first.
2. I built it, but when I went to get an API key, I found out the free plan didn't exist anymore. Edamam was paid too.
3. I didn't want the app to depend on a paid service, so I switched to a **local food table**. No API, no cost, works offline.

**How it works:** the text is split into parts ("e", "con", commas). For each part the backend finds the quantity ("150g", "due", "una porzione"), the unit and the food, then calculates the macros from values per 100 g. The table has about 135 foods with values from the USDA database. If no food is recognized, the API returns an error message instead of saving zero calories.

**Bugs I found while testing:**
- In "pasta con olio", the oil was ignored because I didn't split on "con". Fixed.
- "Gelato al cioccolato" was counted as chocolate. Now the food named first wins.

**Limitations:** it only knows the foods in the table, and the values are averages.

**Other features:** daily overview with calories left, a daily calorie goal, and favorite meals you can log again with one tap. Macros are calculated once and saved, never recalculated.

---

## Phase 4 – Social

Everything social is **opt-in**: sharing is off by default, and a workout is only shared when you tap "Condividi".

**Decisions:**
- Shared workouts are visible to all logged-in users (public profile). Following only decides what appears in your feed.
- Following is instant, no approval needed.
- One reaction per user per post (🔥 💪 👏 ❤️). Tapping another emoji switches it.

**What I built:** a feed of the people you follow (with pagination), user search, profiles, follow/unfollow, reactions, and an optional photo. Photos are uploaded directly from the phone to Cloudinary, and the backend only saves the URL after checking it really comes from Cloudinary.

**Migration problem:** I added a required, unique `username` to the users table, but there were already users in the database. I wrote the migration by hand: first add the column as optional, fill it with a username based on the email, then make it required.

**Testing:** a script with 34 checks, for example: you can't share a workout twice, you can't follow yourself, you can't delete someone else's post, and everything returns 401 without a token.

---

## Phase 5 – Polish and deploy preparation

**App polish:**
- Fixed a real bug: when a request failed, some screens showed a loading spinner forever. Now they show an error message with a retry button.
- Screens no longer show "empty" when the real problem is an error.
- Consistent tap feedback and vibration for important actions (finishing a set, saving a plan, finishing a workout).
- Bigger buttons where they were too small to tap.

**Website.** A one-page site that presents the project with the same colors and fonts as the app.

**Deploy preparation.** The backend applies database migrations automatically when it starts, and `DEPLOYMENT.md` explains how to deploy the backend (Railway or Render) and the website (Vercel). I tested the production build locally, but it's not online yet.

---

## What's missing / next steps

- Deploy the backend and website online
- Automated tests in the repo
- A real Progress tab (the chart is currently inside the exercise detail screen)
- Use one language in the app (right now it mixes English and Italian)
- Limit login attempts (rate limiting)
- Fix the timezone issue: a meal logged around midnight can count for the wrong day
- Comments, push notifications for new followers
