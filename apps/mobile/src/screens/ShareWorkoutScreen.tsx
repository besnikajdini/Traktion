// The end-of-session "want to share this?" prompt — only reachable when
// autoShareWorkouts is on (see WorkoutsStackNavigator/SessionSummaryScreen).
// Sharing here is still a fully separate, explicit confirmation: reaching
// this screen never shares anything on its own, only tapping "Condividi"
// does. "Non condividere" (or the back gesture) always exits with nothing
// created, even though the general setting is on.
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { shareWorkout } from '../services/social';
import { uploadWorkoutPhoto } from '../services/cloudinary';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ShareWorkout'>;

export function ShareWorkoutScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permesso negato', "Serve l'accesso alle foto per allegarne una all'allenamento.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    setSubmitting(true);
    try {
      let photoUrl: string | null = null;
      if (photoUri) {
        photoUrl = await uploadWorkoutPhoto(photoUri);
      }
      await shareWorkout({ workoutSessionId: sessionId, photoUrl });
      navigation.popToTop();
    } catch (err) {
      Alert.alert('Errore', err instanceof Error ? err.message : 'Non è stato possibile condividere questo allenamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vuoi condividere questo allenamento?</Text>
      <Text style={styles.subtitle}>
        Sarà visibile a chi ti segue, con volume totale, durata e i record ottenuti. Puoi scegliere di non condividerlo,
        anche se la condivisione automatica è attiva.
      </Text>

      <PressableOpacity style={styles.photoPicker} onPress={pickPhoto} disabled={submitting}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
        ) : (
          <Text style={styles.photoPickerText}>+ Aggiungi una foto (facoltativo)</Text>
        )}
      </PressableOpacity>

      <PressableOpacity style={styles.shareButton} onPress={handleShare} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.text} /> : <Text style={styles.shareText}>Condividi</Text>}
      </PressableOpacity>

      <PressableOpacity onPress={() => navigation.popToTop()} disabled={submitting}>
        <Text style={styles.skipText}>Non condividere</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  photoPicker: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 8,
  },
  photoPickerText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    ...shadows.raised,
  },
  shareText: {
    ...typography.button,
    color: colors.text,
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
