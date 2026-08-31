import { prisma } from '../lib/prisma';

export function searchExercises(search?: string, muscleGroup?: string) {
  return prisma.exercise.findMany({
    where: {
      name: search ? { contains: search, mode: 'insensitive' } : undefined,
      muscleGroup: muscleGroup ? { equals: muscleGroup, mode: 'insensitive' } : undefined,
    },
    orderBy: { name: 'asc' },
    take: 50,
  });
}

export function getExerciseById(id: string) {
  return prisma.exercise.findUnique({ where: { id } });
}
