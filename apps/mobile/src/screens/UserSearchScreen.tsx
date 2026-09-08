import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserSearchResult } from '@traktion/shared-types';
import { followUser, searchUsers, unfollowUser } from '../services/social';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { SocialStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'UserSearch'>;

export function UserSearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  const runSearch = (text: string) => {
    setQuery(text);
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setSearched(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    searchUsers(trimmed)
      .then((r) => {
        setResults(r);
        setSearched(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const toggleFollow = (user: UserSearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const action = user.isFollowing ? unfollowUser(user.id) : followUser(user.id);
    setResults((prev) => prev.map((u) => (u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u)));
    action.catch(() => {
      // roll back on failure
      setResults((prev) => prev.map((u) => (u.id === user.id ? { ...u, isFollowing: user.isFollowing } : u)));
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Cerca per username"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        value={query}
        onChangeText={runSearch}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={results}
          keyExtractor={(u) => u.id}
          ListEmptyComponent={
            error ? (
              <Text style={styles.emptyText}>Ricerca non riuscita. Riprova.</Text>
            ) : searched ? (
              <Text style={styles.emptyText}>Nessun utente trovato.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <PressableOpacity style={styles.row} onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <PressableOpacity
                style={[styles.followButton, item.isFollowing && styles.followingButton]}
                onPress={() => toggleFollow(item)}
              >
                <Text style={[styles.followText, item.isFollowing && styles.followingText]}>
                  {item.isFollowing ? 'Segui già' : 'Segui'}
                </Text>
              </PressableOpacity>
            </PressableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 16,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.card,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  username: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  followingButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: {
    ...typography.caption,
    fontFamily: typography.button.fontFamily,
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
