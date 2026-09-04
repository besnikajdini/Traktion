// Streak = consecutive ISO weeks (Monday-Sunday, UTC) with at least one
// finished workout. Rule, documented here and in DEVELOPMENT_LOG.md because
// it's a policy choice, not a fact: the streak has a one-week grace period,
// like Duolingo — if this week has no workout YET, the streak still shows
// last week's count rather than dropping to 0 the moment Monday starts. It
// only actually breaks once a full week goes by with nothing logged.
import { prisma } from '../lib/prisma';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function startOfIsoWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

function weekKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
}

export async function getStreak(userId: string): Promise<StreakSummary> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, endedAt: { not: null } },
    select: { startedAt: true },
  });

  const weekKeys = new Set(sessions.map((s) => weekKey(startOfIsoWeek(s.startedAt))));

  return {
    currentStreak: computeCurrentStreak(weekKeys),
    longestStreak: computeLongestStreak(weekKeys),
  };
}

function computeCurrentStreak(weekKeys: Set<string>): number {
  let cursor = startOfIsoWeek(new Date());

  if (!weekKeys.has(weekKey(cursor))) {
    const lastWeek = new Date(cursor.getTime() - MS_PER_WEEK);
    if (!weekKeys.has(weekKey(lastWeek))) {
      return 0;
    }
    cursor = lastWeek;
  }

  let streak = 0;
  while (weekKeys.has(weekKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - MS_PER_WEEK);
  }
  return streak;
}

function computeLongestStreak(weekKeys: Set<string>): number {
  const sortedWeeks = [...weekKeys].sort().map((key) => new Date(`${key}T00:00:00.000Z`).getTime());

  let longest = 0;
  let current = 0;
  let previous: number | null = null;

  for (const week of sortedWeeks) {
    current = previous !== null && week - previous === MS_PER_WEEK ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = week;
  }

  return longest;
}
