// Phase 4 — sharing a finished WorkoutSession as a WorkoutPost, the
// following-feed, and reactions. See DEVELOPMENT_LOG.md for the consent
// model: creating a post always requires this explicit endpoint call (there
// is no code path that creates one automatically), and User.autoShareWorkouts
// only controls whether the mobile app *offers* to call it.
import type { ReactionType } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class WorkoutPostError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const POST_INCLUDE = {
  user: { select: { id: true, username: true, name: true } },
  reactions: { select: { userId: true, type: true } },
} as const;

type PostWithRelations = {
  id: string;
  workoutSessionId: string;
  totalVolumeKg: number;
  durationSeconds: number;
  personalRecords: unknown;
  photoUrl: string | null;
  createdAt: Date;
  user: { id: string; username: string; name: string };
  reactions: { userId: string; type: ReactionType }[];
};

const REACTION_TYPES: ReactionType[] = ['FIRE', 'STRONG', 'CLAP', 'HEART'];

function toPostDto(post: PostWithRelations, currentUserId: string) {
  const reactionCounts = Object.fromEntries(REACTION_TYPES.map((t) => [t, 0])) as Record<ReactionType, number>;
  let myReaction: ReactionType | null = null;
  for (const r of post.reactions) {
    reactionCounts[r.type]++;
    if (r.userId === currentUserId) myReaction = r.type;
  }

  return {
    id: post.id,
    user: post.user,
    workoutSessionId: post.workoutSessionId,
    totalVolumeKg: post.totalVolumeKg,
    durationSeconds: post.durationSeconds,
    personalRecords: post.personalRecords,
    photoUrl: post.photoUrl,
    createdAt: post.createdAt,
    reactionCounts,
    myReaction,
  };
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 30;

async function paginatePosts(where: Record<string, unknown>, currentUserId: string, cursor: string | null, limit: number | null) {
  const take = Math.min(Math.max(limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  const posts = await prisma.workoutPost.findMany({
    where,
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > take;
  const page = hasMore ? posts.slice(0, take) : posts;

  return {
    items: page.map((p) => toPostDto(p, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

// Only posts from users the caller follows — never the caller's own posts
// (those live on their own profile). Empty follow list just yields an
// empty feed, which is the correct behavior, not an error.
export async function listFeed(currentUserId: string, cursor: string | null, limit: number | null) {
  const follows = await prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } });
  const followingIds = follows.map((f) => f.followingId);
  return paginatePosts({ userId: { in: followingIds } }, currentUserId, cursor, limit);
}

// A user's own shared posts, shown on their public profile — visible to any
// authenticated caller (see users.service.ts for the visibility rationale).
export function listUserPosts(currentUserId: string, profileUserId: string, cursor: string | null, limit: number | null) {
  return paginatePosts({ userId: profileUserId }, currentUserId, cursor, limit);
}

function isValidCloudinaryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

export async function createWorkoutPost(userId: string, workoutSessionId: string, photoUrl: string | null | undefined) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: workoutSessionId, userId },
    include: { setLogs: true },
  });
  if (!session) {
    throw new WorkoutPostError('Workout session not found', 404);
  }
  if (!session.endedAt) {
    throw new WorkoutPostError('Cannot share a workout that has not ended yet', 400);
  }
  if (photoUrl != null && !isValidCloudinaryUrl(photoUrl)) {
    throw new WorkoutPostError('photoUrl must be a valid Cloudinary URL', 400);
  }

  const existing = await prisma.workoutPost.findUnique({ where: { workoutSessionId } });
  if (existing) {
    throw new WorkoutPostError('This workout has already been shared', 409);
  }

  const totalVolumeKg = session.setLogs.reduce((sum, l) => sum + l.weightKg * l.reps, 0);
  const durationSeconds = Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);

  // Snapshot at share time — never recomputed later, same policy as
  // FoodEntry's stored macros (see nutrition.service.ts).
  const records = await prisma.personalRecord.findMany({
    where: { workoutSessionId, userId },
    include: { exercise: { select: { name: true } } },
    orderBy: { achievedAt: 'asc' },
  });
  const personalRecords = records.map((r) => ({
    exerciseName: r.exercise.name,
    type: r.type,
    weightKg: r.weightKg,
    reps: r.reps,
  }));

  const post = await prisma.workoutPost.create({
    data: {
      userId,
      workoutSessionId,
      totalVolumeKg,
      durationSeconds,
      personalRecords,
      photoUrl: photoUrl ?? null,
    },
    include: POST_INCLUDE,
  });

  return toPostDto(post, userId);
}

export async function deleteWorkoutPost(userId: string, postId: string): Promise<boolean> {
  const result = await prisma.workoutPost.deleteMany({ where: { id: postId, userId } });
  return result.count > 0;
}

// Tapping the currently-active reaction removes it; tapping a different one
// switches it. See schema.prisma's comment on Reaction for why it's one
// reaction per user per post, not one-per-type.
export async function setReaction(userId: string, postId: string, type: ReactionType) {
  const post = await prisma.workoutPost.findUnique({ where: { id: postId } });
  if (!post) {
    throw new WorkoutPostError('Post not found', 404);
  }

  const existing = await prisma.reaction.findUnique({
    where: { userId_workoutPostId: { userId, workoutPostId: postId } },
  });

  if (existing && existing.type === type) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.reaction.update({ where: { id: existing.id }, data: { type } });
  } else {
    await prisma.reaction.create({ data: { userId, workoutPostId: postId, type } });
  }

  const refreshed = await prisma.workoutPost.findUniqueOrThrow({ where: { id: postId }, include: POST_INCLUDE });
  return toPostDto(refreshed, userId);
}
