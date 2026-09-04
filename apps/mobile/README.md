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

- Phase 1 (Workout Tracker MVP), Phase 0's auth, the visual design system, and Phase 2 (Progress & Motivation) are all implemented. Phase 2 added: automatic personal-record detection, an end-of-session summary (duration, volume, PRs), a per-exercise progress chart, a weekly workout streak on the Home tab, exercise picker filters (muscle/equipment), and a 3-tab exercise detail screen (Summary with a video + chart + PRs, History, Instructions) backed by a richer exercise dataset with real animated demonstrations. See `/DEVELOPMENT_LOG.md` at the repo root for the full write-up of what was built and why.
- Not implemented yet (later phases per `project-plan.md`): food tracking, social.
- `.claude/settings.json` and `AGENTS.md` were added automatically by the Expo project template (official `expo` Claude Code plugin) — safe to keep.
- Pinned to **Expo SDK 54** (not the newest SDK) because as of writing, the Expo Go app on the iOS App Store hasn't been updated past SDK 54 yet. If you hit "Project is incompatible with this version of Expo Go", update Expo Go from the store first — if it's already current, the project SDK may need bumping (`npx expo install expo@<version>` then `npx expo install --fix`).
- Local (in-app) notifications work fine in Expo Go; only *remote/push* notifications require a development build, and this app never uses those.
