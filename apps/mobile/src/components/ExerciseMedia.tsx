import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  gifUrl: string | null;
  imageUrl: string | null;
  attribution: string | null;
};

// The exercise animation is square (180x180 in the source dataset) — sizing
// it to ~1/3 of the screen height (per the design brief) rather than full
// screen width, so it doesn't dominate the layout.
const MEDIA_SIZE = Dimensions.get('window').height / 3;

export function ExerciseMedia({ gifUrl, imageUrl, attribution }: Props) {
  const uri = gifUrl ?? imageUrl;
  if (!uri) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.media} resizeMode="contain" />
      {attribution && <Text style={styles.attribution}>{attribution}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  media: {
    width: MEDIA_SIZE,
    height: MEDIA_SIZE,
  },
  attribution: {
    ...typography.caption,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
});
