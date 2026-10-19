# Traktion

A full-stack fitness app I built to learn how a real app works end to end: mobile app, backend API and database.

You can build your own workout plans, log your sets, and the app automatically tells you when you hit a new personal record. There's also a rest timer, a simple food log with calories and macros, and an optional social feed.

## Features

- **Workout builder** – create plans from a catalogue of 1300+ exercises, with sets, reps and rest time per exercise
- **Workout sessions** – log weight and reps for every set, with a hint showing what you did last time
- **Rest timer** – starts automatically after each set, vibrates in the last 5 seconds and sends a notification
- **Personal records** – detected automatically (heaviest weight and best weight × reps)
- **Progress** – chart per exercise, end-of-workout summary and a weekly streak
- **Food log** – type a meal in Italian ("150g di petto di pollo e una porzione di riso") and the app estimates calories, protein, carbs and fat
- **Social (optional)** – share a finished workout, follow other users and react with emojis. Off by default.

## Tech stack

| Part | Technology |
|---|---|
| Mobile app | React Native (Expo) + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma |
| Login | JWT + bcrypt |
| Website | Next.js |

Everything is in one repository (monorepo), and the app and backend share the same TypeScript types.

## Status

The main features work. The backend and website are ready to deploy but not online yet, and there are no automated tests in the repo yet. See `DEVELOPMENT_LOG.md` for how I built it and what's still missing.

## How I built it

I built this project with the help of AI (Claude Code). I planned the features and the phases, made the decisions along the way, and tested the app myself, including on my phone with Expo Go. It was a big learning project for me, especially for backend and database design.

## Run it locally

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env   # set DATABASE_URL and JWT_SECRET
npm install
npm run prisma:migrate --workspace=apps/backend
npm run prisma:seed --workspace=apps/backend      # loads the exercises
npm run dev:backend

# Mobile (second terminal)
cp apps/mobile/.env.example apps/mobile/.env      # set your backend URL
npm run dev:mobile
```

Deployment notes are in `DEPLOYMENT.md`.
