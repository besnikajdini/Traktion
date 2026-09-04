import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

function buildExerciseWhere(search?: string, bodyParts?: string[], equipment?: string[]): Prisma.ExerciseWhereInput {
  return {
    name: search ? { contains: search, mode: 'insensitive' } : undefined,
    bodyPart: bodyParts?.length ? { in: bodyParts } : undefined,
    equipment: equipment?.length ? { in: equipment } : undefined,
  };
}

export function searchExercises(search?: string, bodyParts?: string[], equipment?: string[]) {
  return prisma.exercise.findMany({
    where: buildExerciseWhere(search, bodyParts, equipment),
    orderBy: { name: 'asc' },
    take: 50,
  });
}

export function countExercises(search?: string, bodyParts?: string[], equipment?: string[]) {
  return prisma.exercise.count({ where: buildExerciseWhere(search, bodyParts, equipment) });
}

export function getExerciseById(id: string) {
  return prisma.exercise.findUnique({ where: { id } });
}

export async function getFilterOptions() {
  const [bodyParts, equipment] = await Promise.all([
    prisma.exercise.findMany({
      distinct: ['bodyPart'],
      select: { bodyPart: true },
      orderBy: { bodyPart: 'asc' },
    }),
    prisma.exercise.findMany({
      distinct: ['equipment'],
      select: { equipment: true },
      orderBy: { equipment: 'asc' },
      where: { equipment: { not: null } },
    }),
  ]);

  return {
    bodyParts: bodyParts.map((b) => b.bodyPart),
    equipment: equipment.map((e) => e.equipment as string),
  };
}

/** One point per completed session that logged this exercise — powers the progress chart. */
export async function getExerciseProgress(userId: string, exerciseId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      endedAt: { not: null },
      setLogs: { some: { exerciseId } },
    },
    orderBy: { startedAt: 'asc' },
    select: {
      id: true,
      startedAt: true,
      setLogs: { where: { exerciseId }, select: { weightKg: true, reps: true } },
    },
  });

  return sessions.map((s) => ({
    sessionId: s.id,
    date: s.startedAt,
    maxWeightKg: Math.max(...s.setLogs.map((l) => l.weightKg)),
    volumeKg: s.setLogs.reduce((sum, l) => sum + l.weightKg * l.reps, 0),
  }));
}

/** Full logged history for this exercise, most recent first — the "Cronologia" tab. */
export function getExerciseHistory(userId: string, exerciseId: string) {
  return prisma.setLog.findMany({
    where: { exerciseId, workoutSession: { userId } },
    orderBy: { completedAt: 'desc' },
    include: { workoutSession: { select: { id: true, startedAt: true } } },
  });
}

/** Current best per PR type for this exercise — the most recent row of each type IS
 *  the current best, since a new row of a type only gets created when it beats every
 *  earlier one (see setLogs.service.ts). */
export function getExercisePersonalBests(userId: string, exerciseId: string) {
  return prisma.personalRecord.findMany({
    where: { userId, exerciseId },
    orderBy: { achievedAt: 'desc' },
    distinct: ['type'],
  });
}
