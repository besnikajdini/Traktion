// Any authenticated user can open any other user's profile and see their
// shared WorkoutPosts, regardless of follow state — Follow only curates the
// Social feed, it doesn't gate visibility (deliberate decision, see
// DEVELOPMENT_LOG.md).
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PublicUserProfile, ReactionType, WorkoutPost } from '@traktion/shared-types';
import { deleteWorkoutPost, followUser, getUserProfile, getUserWorkoutPosts, reactToPost, unfollowUser } from '../services/social';
import { WorkoutPostCard } from '../components/WorkoutPostCard';
import { PressableOpacity } from '../components/PressableOpacity';
import { ErrorState } from '../components/ErrorState';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { SocialStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'UserProfile'>;

export function UserProfileScreen({ route }: Props) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [posts, setPosts] = useState<WorkoutPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    return Promise.all([getUserProfile(userId), getUserWorkoutPosts(userId)])
      .then(([p, page]) => {
        setProfile(p);
        setPosts(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const loadMore = () => {
    if (!nextCursor) return;
    getUserWorkoutPosts(userId, nextCursor)
      .then((page) => {
        setPosts((prev) => [...prev, ...page.items]);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {});
  };

  const toggleFollow = () => {
    if (!profile || followBusy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFollowBusy(true);
    const action = profile.isFollowing ? unfollowUser(profile.id) : followUser(profile.id);
    action
      .then(() =>
        setProfile((p) =>
          p ? { ...p, isFollowing: !p.isFollowing, followerCount: p.followerCount + (p.isFollowing ? -1 : 1) } : p,
        ),
      )
      .catch(() => {})
      .finally(() => setFollowBusy(false));
  };

  const handleReact = (postId: string, type: ReactionType) => {
    reactToPost(postId, type)
      .then((updated) => setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p))))
      .catch(() => {});
  };

  const handleDelete = (post: WorkoutPost) => {
    Alert.alert('Eliminare questo post?', 'Non potrai annullare questa azione.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => {
          deleteWorkoutPost(post.id)
            .then(() => setPosts((prev) => prev.filter((p) => p.id !== post.id)))
            .catch(() => Alert.alert('Errore', 'Non è stato possibile eliminare il post.'));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return <ErrorState message="Non è stato possibile caricare questo profilo." retryLabel="Riprova" onRetry={load} />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={posts}
      keyExtractor={(p) => p.id}
      onEndReachedThreshold={0.4}
      onEndReached={loadMore}
      renderItem={({ item }) => (
        <WorkoutPostCard
          post={item}
          onReact={(type) => handleReact(item.id, type)}
          onDelete={profile.isSelf ? () => handleDelete(item) : undefined}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>

          <View style={styles.countsRow}>
            <View style={styles.countItem}>
              <Text style={styles.countValue}>{profile.followerCount}</Text>
              <Text style={styles.countLabel}>Follower</Text>
            </View>
            <View style={styles.countItem}>
              <Text style={styles.countValue}>{profile.followingCount}</Text>
              <Text style={styles.countLabel}>Seguiti</Text>
            </View>
          </View>

          {!profile.isSelf && (
            <PressableOpacity
              style={[styles.followButton, profile.isFollowing && styles.followingButton]}
              onPress={toggleFollow}
              disabled={followBusy}
            >
              <Text style={[styles.followText, profile.isFollowing && styles.followingText]}>
                {profile.isFollowing ? 'Smetti di seguire' : 'Segui'}
              </Text>
            </PressableOpacity>
          )}
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>Nessun allenamento condiviso.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    ...shadows.card,
  },
  name: {
    ...typography.screenTitle,
    fontSize: 20,
    color: colors.text,
  },
  username: {
    ...typography.body,
    color: colors.textMuted,
  },
  countsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },
  countItem: {
    alignItems: 'center',
  },
  countValue: {
    ...typography.cardTitle,
    color: colors.primary,
  },
  countLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  followingButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: {
    ...typography.button,
    color: colors.text,
  },
  followingText: {
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
});
