import { Image, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '@traktion/shared-types';
import { RestDurationPicker } from './RestDurationPicker';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  exercise: Exercise;
  restSeconds: number | null;
  onSelectRest: (seconds: number | null) => void;
  onPressExercise: () => void;
};

export function ExerciseBlockHeader({ exercise, restSeconds, onSelectRest, onPressExercise }: Props) {
  return (
    <View>
      <PressableOpacity style={styles.header} onPress={onPressExercise}>
        {exercise.imageUrl ? (
          <Image source={{ uri: exercise.imageUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder} />
        )}
        <Text style={styles.name}>{exercise.name}</Text>
      </PressableOpacity>

      <RestDurationPicker restSeconds={restSeconds} onSelectRest={onSelectRest} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  thumbnailPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  name: {
    ...typography.cardTitle,
    color: colors.text,
    flex: 1,
  },
});
