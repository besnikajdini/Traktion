import { PersonalRecordType } from '@prisma/client';
import { prisma } from '../lib/prisma';

export type CreateSetLogInput = {
  workoutSessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number | null;
};

/** Creates the set, then checks it against every earlier set for the same
 *  user+exercise (across all sessions) and records a PersonalRecord for each
 *  type (max weight, max single-set volume) it beats. Both checks and both
 *  possible inserts happen in one transaction so a PR is never recorded
 *  without its SetLog (or vice versa). */
export async function createSetLog(userId: string, input: CreateSetLogInput) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: input.workoutSessionId, userId },
  });
  if (!session) return null;

  return prisma.$transaction(async (tx) => {
    const setLog = await tx.setLog.create({
      data: {
        workoutSessionId: input.workoutSessionId,
        exerciseId: input.exerciseId,
        setNumber: input.setNumber,
        reps: input.reps,
        weightKg: input.weightKg,
        rpe: input.rpe ?? null,
      },
    });

    const [previousBest] = await tx.$queryRaw<{ maxweight: number | null; maxvolume: number | null }[]>`
      SELECT MAX(s."weightKg") AS maxweight, MAX(s."weightKg" * s."reps") AS maxvolume
      FROM "SetLog" s
      JOIN "WorkoutSession" ws ON s."workoutSessionId" = ws."id"
      WHERE ws."userId" = ${userId} AND s."exerciseId" = ${input.exerciseId} AND s."id" != ${setLog.id}
    `;

    const volume = input.weightKg * input.reps;
    const newRecordTypes: PersonalRecordType[] = [];
    if (previousBest?.maxweight === null || previousBest === undefined || input.weightKg > previousBest.maxweight) {
      newRecordTypes.push(PersonalRecordType.MAX_WEIGHT);
    }
    if (previousBest?.maxvolume === null || previousBest === undefined || volume > previousBest.maxvolume) {
      newRecordTypes.push(PersonalRecordType.MAX_VOLUME);
    }

    for (const type of newRecordTypes) {
      await tx.personalRecord.create({
        data: {
          userId,
          exerciseId: input.exerciseId,
          workoutSessionId: input.workoutSessionId,
          setLogId: setLog.id,
          type,
          weightKg: input.weightKg,
          reps: input.reps,
        },
      });
    }

    return setLog;
  });
}

export function getLastSetLog(userId: string, exerciseId: string) {
  return prisma.setLog.findFirst({
    where: { exerciseId, workoutSession: { userId } },
    orderBy: { completedAt: 'desc' },
  });
}

export async function deleteSetLog(userId: string, id: string) {
  const log = await prisma.setLog.findFirst({
    where: { id, workoutSession: { userId } },
  });
  if (!log) return false;
  await prisma.setLog.delete({ where: { id } });
  return true;
}
