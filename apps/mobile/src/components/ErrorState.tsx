// Phase 5 polish: replaces the "spinner spins forever" bug that showed up
// across several screens — a failed fetch left `loading` false but the data
// still null, so the loading guard kept rendering a spinner with no way out.
// This gives every screen the same look for "something went wrong, try
// again" instead of each one inventing its own (or none at all).
import { StyleSheet, Text, View } from 'react-native';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

interface Props {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

export function ErrorState({ message, retryLabel, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <PressableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>{retryLabel}</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...shadows.card,
  },
  retryText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});
