import { prisma } from '../lib/prisma';

export type PlanExerciseInput = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps?: number | null;
  restSeconds: number;
};

const planDetailInclude = {
  planExercises: {
    orderBy: { order: 'asc' as const },
    include: { exercise: true },
  },
};

export function listWorkoutPlans(userId: string) {
  return prisma.workoutPlan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { planExercises: true } } },
  });
}

export function getWorkoutPlan(userId: string, id: string) {
  return prisma.workoutPlan.findFirst({
    where: { id, userId },
    include: planDetailInclude,
  });
}

export function createWorkoutPlan(
  userId: string,
  name: string,
  description: string | null,
  exercises: PlanExerciseInput[],
) {
  return prisma.workoutPlan.create({
    data: {
      userId,
      name,
      description,
      planExercises: {
        create: exercises.map((e) => ({
          exerciseId: e.exerciseId,
          order: e.order,
          targetSets: e.targetSets,
          targetReps: e.targetReps ?? null,
          restSeconds: e.restSeconds,
        })),
      },
    },
    include: planDetailInclude,
  });
}

export async function updateWorkoutPlan(
  userId: string,
  id: string,
  name: string,
  description: string | null,
  exercises: PlanExerciseInput[],
) {
  const existing = await prisma.workoutPlan.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    await tx.planExercise.deleteMany({ where: { workoutPlanId: id } });
    return tx.workoutPlan.update({
      where: { id },
      data: {
        name,
        description,
        planExercises: {
          create: exercises.map((e) => ({
            exerciseId: e.exerciseId,
            order: e.order,
            targetSets: e.targetSets,
            targetReps: e.targetReps ?? null,
            restSeconds: e.restSeconds,
          })),
        },
      },
      include: planDetailInclude,
    });
  });
}

export async function deleteWorkoutPlan(userId: string, id: string) {
  const existing = await prisma.workoutPlan.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.workoutPlan.delete({ where: { id } });
  return true;
}
