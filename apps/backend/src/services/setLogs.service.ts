import { prisma } from '../lib/prisma';

export type CreateSetLogInput = {
  workoutSessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number | null;
};

export async function createSetLog(userId: string, input: CreateSetLogInput) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: input.workoutSessionId, userId },
  });
  if (!session) return null;

  return prisma.setLog.create({
    data: {
      workoutSessionId: input.workoutSessionId,
      exerciseId: input.exerciseId,
      setNumber: input.setNumber,
      reps: input.reps,
      weightKg: input.weightKg,
      rpe: input.rpe ?? null,
    },
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
