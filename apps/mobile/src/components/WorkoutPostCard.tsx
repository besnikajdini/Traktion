// Renders one shared workout — used by both the Social feed and a user's
// public profile. Reactions are a single quick tap on one of 4 fixed emoji,
// no separate screen (tapping the active one again removes it, tapping a
// different one switches — see workoutPosts.service.ts's setReaction).
import { Image, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ReactionType, WorkoutPost } from '@traktion/shared-types';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'FIRE', emoji: '🔥' },
  { type: 'STRONG', emoji: '💪' },
  { type: 'CLAP', emoji: '👏' },
  { type: 'HEART', emoji: '❤️' },
];

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

interface Props {
  post: WorkoutPost;
  onReact: (type: ReactionType) => void;
  onDelete?: () => void;
}

export function WorkoutPostCard({ post, onReact, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.username}>{post.user.name}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
        {onDelete && (
          <PressableOpacity onPress={onDelete} hitSlop={8}>
            <Text style={styles.deleteText}>Elimina</Text>
          </PressableOpacity>
        )}
      </View>

      {post.photoUrl && <Image source={{ uri: post.photoUrl }} style={styles.photo} resizeMode="cover" />}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(post.totalVolumeKg).toLocaleString()} kg</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(post.durationSeconds)}</Text>
          <Text style={styles.statLabel}>Durata</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{post.personalRecords.length}</Text>
          <Text style={styles.statLabel}>PR</Text>
        </View>
      </View>

      {post.personalRecords.length > 0 && (
        <View style={styles.prList}>
          {post.personalRecords.map((pr, i) => (
            <Text key={i} style={styles.prText}>
              🏆 {pr.exerciseName} — {pr.weightKg} kg × {pr.reps}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.reactionsRow}>
        {REACTIONS.map((r) => {
          const active = post.myReaction === r.type;
          const count = post.reactionCounts[r.type];
          return (
            <PressableOpacity
              key={r.type}
              style={[styles.reactionButton, active && styles.reactionButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onReact(r.type);
              }}
            >
              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              {count > 0 && <Text style={[styles.reactionCount, active && styles.reactionCountActive]}>{count}</Text>}
            </PressableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  username: {
    ...typography.cardTitle,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteText: {
    ...typography.caption,
    color: colors.danger,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    ...typography.cardTitle,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  prList: {
    gap: 4,
  },
  prText: {
    ...typography.caption,
    color: colors.success,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reactionCountActive: {
    color: colors.primary,
  },
});
