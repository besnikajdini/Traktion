import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { ReactionType, WorkoutPost } from '@traktion/shared-types';
import { getFeed, reactToPost } from '../services/social';
import { WorkoutPostCard } from '../components/WorkoutPostCard';
import { ErrorState } from '../components/ErrorState';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function SocialFeedScreen() {
  const [posts, setPosts] = useState<WorkoutPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    return getFeed()
      .then((page) => {
        setPosts(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    getFeed(nextCursor)
      .then((page) => {
        setPosts((prev) => [...prev, ...page.items]);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const handleReact = (postId: string, type: ReactionType) => {
    reactToPost(postId, type)
      .then((updated) => setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p))))
      .catch(() => {});
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return <ErrorState message="Non è stato possibile caricare il feed." retryLabel="Riprova" onRetry={load} />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={posts.length === 0 ? styles.emptyContent : styles.content}
      data={posts}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <WorkoutPostCard post={item} onReact={(type) => handleReact(item.id, type)} />}
      onEndReachedThreshold={0.4}
      onEndReached={loadMore}
      ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Il tuo feed è vuoto</Text>
          <Text style={styles.emptyText}>Cerca altri utenti e seguili per vedere qui i loro allenamenti condivisi.</Text>
        </View>
      }
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
  },
  emptyContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
