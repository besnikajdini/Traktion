# Traktion Mobile

Expo (React Native) + TypeScript app for Traktion, using React Navigation (bottom tabs).

## Structure

```
src/
  components/   shared UI components (SetRow, RestTimerBar, PlanExerciseEditorRow, ...)
  hooks/        custom React hooks (useCountdown, useDebouncedValue)
  navigation/    navigators and route param types
  screens/      one screen per route
  services/     API clients / data fetching (api.ts + one file per resource) + notifications.ts
  store/        global app state — Zustand (authStore: session/JWT, sessionStore: active WorkoutSession + rest timer)
  theme/        colors.ts (palette) + typography.ts (Barlow/Barlow Condensed font tokens)
  types/        local TypeScript types (imports from @traktion/shared-types where possible)
```

## Getting started

```bash
npm install        # from repo root (npm workspaces)
cp .env.example .env   # then point EXPO_PUBLIC_API_URL at apps/backend — see comments in the file
npx expo start      # from this directory, or `npm run dev:mobile` from repo root
```

Scan the QR code with Expo Go, or press `a` / `i` / `w` for Android/iOS/web. `apps/backend` must be running (and seeded) for anything under the Workouts tab to load data — see `apps/backend/README.md`.

## Notes

- Phase 0's auth, the visual design system, Phase 1 (Workout Tracker MVP), Phase 2 (Progress & Motivation), Phase 3 (Food Tracking), and Phase 4 (Social) are all implemented. Phase 2 added: automatic personal-record detection, an end-of-session summary (duration, volume, PRs), a per-exercise progress chart, a weekly workout streak on the Home tab, exercise picker filters (muscle/equipment), and a 3-tab exercise detail screen (Summary with a video + chart + PRs, History, Instructions) backed by a richer exercise dataset with real animated demonstrations. Phase 3 added the FoodLog tab: free-text meal logging with local macro estimation (no external API/key), favorite meals for one-tap re-logging, a daily calories/macros overview, and a daily calorie goal. Phase 4 added an opt-in (default off) Social tab: an end-of-session share prompt (volume/PRs/duration + optional Cloudinary photo), a following-feed, username search, public user profiles with follow/unfollow, and 4 fixed-emoji reactions — see `/DEVELOPMENT_LOG.md` for the privacy/consent model. Registration now also asks for a username.
- Not implemented yet: Phase 5 (Rifinitura e Portfolio — public deploy, portfolio website, final polish). Phase 4 also deliberately excludes text comments, push notifications, and DMs — see `/DEVELOPMENT_LOG.md`.
- `.claude/settings.json` and `AGENTS.md` were added automatically by the Expo project template (official `expo` Claude Code plugin) — safe to keep.
- Pinned to **Expo SDK 54** (not the newest SDK) because as of writing, the Expo Go app on the iOS App Store hasn't been updated past SDK 54 yet. If you hit "Project is incompatible with this version of Expo Go", update Expo Go from the store first — if it's already current, the project SDK may need bumping (`npx expo install expo@<version>` then `npx expo install --fix`).
- Local (in-app) notifications work fine in Expo Go; only *remote/push* notifications require a development build, and this app never uses those.
