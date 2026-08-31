// Seeds the Exercise table from a vendored copy of free-exercise-db
// (https://github.com/yuhonas/free-exercise-db, public domain). Users are
// created through POST /auth/register — nothing to seed there.
//
// Run with: npm run prisma:seed --workspace=apps/backend

import { PrismaClient } from '@prisma/client';
import rawExercises from './data/exercises.json';

const prisma = new PrismaClient();

const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

type RawExercise = {
  name: string;
  primaryMuscles: string[];
  equipment: string | null;
  category: string | null;
  images: string[];
};

async function main() {
  const exercises = (rawExercises as RawExercise[]).map((e) => ({
    name: e.name,
    muscleGroup: e.primaryMuscles[0] ?? 'other',
    equipment: e.equipment,
    category: e.category,
    imageUrl: e.images[0] ? `${IMAGE_BASE_URL}${e.images[0]}` : null,
  }));

  const { count } = await prisma.exercise.createMany({
    data: exercises,
    skipDuplicates: true,
  });
  console.log(`Seeded ${count} new exercises (${exercises.length} in source dataset).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
