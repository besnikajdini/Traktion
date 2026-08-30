# @traktion/shared-types

Plain TypeScript DTOs shared between `apps/backend` and `apps/mobile` (and `apps/website`).

These mirror the shapes in `apps/backend/prisma/schema.prisma` but are hand-written,
serialization-friendly types (dates as ISO strings, no Prisma dependency) so the
mobile/web apps can import them without pulling in `@prisma/client`.

## Usage

```ts
import type { WorkoutPlan } from '@traktion/shared-types';
```

## Build

```bash
npm run build --workspace=packages/shared-types
```
