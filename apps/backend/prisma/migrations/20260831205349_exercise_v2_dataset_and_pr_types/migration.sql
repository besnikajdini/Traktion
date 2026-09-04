-- CreateEnum
CREATE TYPE "PersonalRecordType" AS ENUM ('MAX_WEIGHT', 'MAX_VOLUME');

-- DropIndex
DROP INDEX "Exercise_muscleGroup_idx";

-- DropIndex
DROP INDEX "Exercise_name_key";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "category",
DROP COLUMN "muscleGroup",
ADD COLUMN     "bodyPart" TEXT NOT NULL,
ADD COLUMN     "gifUrl" TEXT,
ADD COLUMN     "instructionSteps" TEXT[],
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "mediaAttribution" TEXT,
ADD COLUMN     "secondaryMuscles" TEXT[],
ADD COLUMN     "target" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PersonalRecord" DROP COLUMN "estimatedOneRepMax",
ADD COLUMN     "setLogId" TEXT NOT NULL,
ADD COLUMN     "type" "PersonalRecordType" NOT NULL,
ADD COLUMN     "workoutSessionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Exercise_bodyPart_idx" ON "Exercise"("bodyPart");

-- CreateIndex
CREATE INDEX "Exercise_equipment_idx" ON "Exercise"("equipment");

-- CreateIndex
CREATE INDEX "PersonalRecord_workoutSessionId_idx" ON "PersonalRecord"("workoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_setLogId_type_key" ON "PersonalRecord"("setLogId", "type");

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_setLogId_fkey" FOREIGN KEY ("setLogId") REFERENCES "SetLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

