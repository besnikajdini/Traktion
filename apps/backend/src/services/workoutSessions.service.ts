import { prisma } from '../lib/prisma';

const sessionDetailInclude = {
  workoutPlan: {
    include: {
      planExercises: {
        orderBy: { order: 'asc' as const },
        include: { exercise: true },
      },
    },
  },
  setLogs: true,
};

export function getActiveSession(userId: string) {
  return prisma.workoutSession.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: 'desc' },
    include: sessionDetailInclude,
  });
}

export async function startSession(userId: string, workoutPlanId: string) {
  const plan = await prisma.workoutPlan.findFirst({ where: { id: workoutPlanId, userId } });
  if (!plan) return null;

  return prisma.workoutSession.create({
    data: { userId, workoutPlanId },
    include: sessionDetailInclude,
  });
}

export function getSession(userId: string, id: string) {
  return prisma.workoutSession.findFirst({
    where: { id, userId },
    include: sessionDetailInclude,
  });
}

export async function endSession(userId: string, id: string) {
  const session = await prisma.workoutSession.findFirst({ where: { id, userId } });
  if (!session) return null;

  return prisma.workoutSession.update({
    where: { id },
    data: { endedAt: new Date() },
    include: sessionDetailInclude,
  });
}
