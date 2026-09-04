-- CreateTable
CREATE TABLE "PlanExerciseSet" (
    "id" TEXT NOT NULL,
    "planExerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "targetReps" INTEGER,
    "targetWeightKg" DOUBLE PRECISION,

    CONSTRAINT "PlanExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanExerciseSet_planExerciseId_idx" ON "PlanExerciseSet"("planExerciseId");

-- AddForeignKey
ALTER TABLE "PlanExerciseSet" ADD CONSTRAINT "PlanExerciseSet_planExerciseId_fkey" FOREIGN KEY ("planExerciseId") REFERENCES "PlanExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add notes, keep targetSets/targetReps around for the backfill below
ALTER TABLE "PlanExercise" ADD COLUMN "notes" TEXT;

-- Backfill: expand each PlanExercise's (targetSets, targetReps) into that many
-- PlanExerciseSet rows, so existing plans keep their set counts/targets
-- instead of losing them when the old scalar columns are dropped.
INSERT INTO "PlanExerciseSet" ("id", "planExerciseId", "order", "targetReps", "targetWeightKg")
SELECT gen_random_uuid()::text, pe."id", gs.i - 1, pe."targetReps", NULL
FROM "PlanExercise" pe
CROSS JOIN LATERAL generate_series(1, GREATEST(COALESCE(pe."targetSets", 1), 1)) AS gs(i);

-- AlterTable: now safe to drop the old scalar columns
ALTER TABLE "PlanExercise" DROP COLUMN "targetReps",
DROP COLUMN "targetSets";
