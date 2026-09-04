// Seeds the Exercise table from a vendored copy of hasaneyldrm/exercises-dataset
// (https://github.com/hasaneyldrm/exercises-dataset).
//
// Licensing note (see that repo's LICENSE + NOTICE.md, and DEVELOPMENT_LOG.md):
// the exercise DATA (names, muscles, equipment, instructions) is MIT-licensed.
// The MEDIA (images/*.jpg, videos/*.gif) is (c) Gym visual and is NOT covered
// by that MIT license — it's redistributed in that repo under separate
// permission from Gym visual that does not extend to downstream projects.
// This project hotlinks that media directly rather than vendoring it, and
// stores the required "(c) Gym visual" attribution on every row that has it.
//
// Run with: npm run prisma:seed --workspace=apps/backend

import { PrismaClient } from '@prisma/client';
import rawExercises from './data/exercises.json';

const prisma = new PrismaClient();

const MEDIA_BASE_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

type RawExercise = {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  instructions: { en: string };
  instruction_steps: { en: string[] };
  secondary_muscles: string[];
  target: string;
  image: string;
  gif_url: string;
  attribution: string;
};

async function main() {
  const exercises = (rawExercises as RawExercise[]).map((e) => ({
    id: e.id,
    name: e.name,
    bodyPart: e.body_part,
    target: e.target,
    secondaryMuscles: e.secondary_muscles,
    equipment: e.equipment,
    instructions: e.instructions.en,
    instructionSteps: e.instruction_steps.en,
    imageUrl: `${MEDIA_BASE_URL}${e.image}`,
    gifUrl: `${MEDIA_BASE_URL}${e.gif_url}`,
    mediaAttribution: e.attribution,
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
