// Phase 4 — user search, public profiles, and the follow graph. Profile
// visibility is deliberately simple: any authenticated user can look up any
// other user and see their shared WorkoutPosts, regardless of follow state
// (a decision made explicitly with the project owner — see
// DEVELOPMENT_LOG.md). Follow only curates what shows up in *your own* feed
// (see workoutPosts.service.ts's listFeed), it does not gate visibility.
import { prisma } from '../lib/prisma';

export class UserError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function toPublicUserDto(user: { id: string; username: string; name: string }) {
  return { id: user.id, username: user.username, name: user.name };
}

export async function searchUsers(currentUserId: string, query: string) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [{ username: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }],
    },
    take: 20,
    orderBy: { username: 'asc' },
  });

  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId, followingId: { in: users.map((u) => u.id) } },
    select: { followingId: true },
  });
  const followingIds = new Set(following.map((f) => f.followingId));

  return users.map((u) => ({ ...toPublicUserDto(u), isFollowing: followingIds.has(u.id) }));
}

export async function getPublicProfile(currentUserId: string, profileUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: profileUserId } });
  if (!user) return null;

  const [followerCount, followingCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: profileUserId } }),
    prisma.follow.count({ where: { followerId: profileUserId } }),
    profileUserId === currentUserId
      ? Promise.resolve(false)
      : prisma.follow
          .findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: profileUserId } } })
          .then(Boolean),
  ]);

  return {
    ...toPublicUserDto(user),
    followerCount,
    followingCount,
    isFollowing,
    isSelf: profileUserId === currentUserId,
  };
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new UserError('You cannot follow yourself', 400);
  }
  const target = await prisma.user.findUnique({ where: { id: followingId } });
  if (!target) {
    throw new UserError('User not found', 404);
  }

  try {
    await prisma.follow.create({ data: { followerId, followingId } });
  } catch {
    // Unique constraint — already following, treat as a no-op success so a
    // double-tap in the app doesn't surface an error.
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  await prisma.follow.deleteMany({ where: { followerId, followingId } });
}
