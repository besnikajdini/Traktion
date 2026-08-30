# Traktion Mobile

Expo (React Native) + TypeScript app for Traktion, using React Navigation (bottom tabs).

## Structure

```
src/
  components/   shared UI components
  hooks/        custom React hooks
  navigation/    navigators and route param types
  screens/      one screen per route
  services/     API clients / data fetching
  store/        app state (context, zustand, etc. — TBD)
  theme/        colors, spacing, typography
  types/        local TypeScript types (imports from @traktion/shared-types where possible)
```

## Getting started

```bash
npm install        # from repo root (npm workspaces)
npx expo start      # from this directory, or `npm run dev:mobile` from repo root
```

Scan the QR code with Expo Go, or press `a` / `i` / `w` for Android/iOS/web.

## Notes

- This is Phase 0 scaffolding: navigation shell with placeholder screens only, no features implemented yet.
- `.claude/settings.json` and `AGENTS.md` were added automatically by the Expo project template (official `expo` Claude Code plugin) — safe to keep.
- Pinned to **Expo SDK 54** (not the newest SDK) because as of writing, the Expo Go app on the iOS App Store hasn't been updated past SDK 54 yet. If you hit "Project is incompatible with this version of Expo Go", update Expo Go from the store first — if it's already current, the project SDK may need bumping (`npx expo install expo@<version>` then `npx expo install --fix`).
