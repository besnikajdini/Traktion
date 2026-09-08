-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('FIRE', 'STRONG', 'CLAP', 'HEART');

-- AlterTable: add autoShareWorkouts (safe, has a default) and username as
-- nullable for now — it's backfilled below, then locked to NOT NULL, since
-- `prisma migrate dev` can't add a required column to a non-empty table
-- without a default and this project already has real rows from earlier
-- phases' testing.
ALTER TABLE "User" ADD COLUMN     "autoShareWorkouts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "username" TEXT;

-- Backfill: derive a username from the email's local part for every
-- existing row (lowercased, anything outside [a-z0-9_.] replaced with "_").
-- Emails were already unique, so this can only collide if two local parts
-- normalize to the same string — not the case for this project's existing
-- test accounts, but guarded anyway by appending part of the id if it does.
UPDATE "User"
SET "username" = sub.candidate
FROM (
  SELECT
    id,
    CASE
      WHEN COUNT(*) OVER (PARTITION BY base) > 1
        THEN base || '_' || substr(id::text, 1, 6)
      ELSE base
    END AS candidate
  FROM (
    SELECT id, regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9_.]', '_', 'g') AS base
    FROM "User"
  ) named
) sub
WHERE "User".id = sub.id;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE "WorkoutPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "totalVolumeKg" DOUBLE PRECISION NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "personalRecords" JSONB NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutPostId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPost_workoutSessionId_key" ON "WorkoutPost"("workoutSessionId");

-- CreateIndex
CREATE INDEX "WorkoutPost_userId_createdAt_idx" ON "WorkoutPost"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Reaction_workoutPostId_idx" ON "Reaction"("workoutPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_workoutPostId_key" ON "Reaction"("userId", "workoutPostId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "WorkoutPost" ADD CONSTRAINT "WorkoutPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPost" ADD CONSTRAINT "WorkoutPost_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_workoutPostId_fkey" FOREIGN KEY ("workoutPostId") REFERENCES "WorkoutPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
