import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { updateAutoShareWorkouts } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

export function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [busy, setBusy] = useState(false);

  const toggle = (value: boolean) => {
    setBusy(true);
    updateAutoShareWorkouts(value)
      .then(setUser)
      .catch(() => Alert.alert('Errore', 'Non è stato possibile aggiornare questa impostazione.'))
      .finally(() => setBusy(false));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.title}>Condivisione automatica allenamenti</Text>
            <Text style={styles.description}>
              Se attiva, a fine allenamento ti verrà chiesto se vuoi condividerlo nel feed social. Puoi comunque scegliere
              di non condividere ogni singolo allenamento, anche con questa opzione attiva.
            </Text>
          </View>
          <Switch
            value={user?.autoShareWorkouts ?? false}
            onValueChange={toggle}
            disabled={busy}
            trackColor={{ false: colors.surfaceAlt, true: colors.primaryMuted }}
            thumbColor={user?.autoShareWorkouts ? colors.primary : colors.textMuted}
          />
        </View>
      </View>

      <Text style={styles.footnote}>
        Nessun allenamento viene mai condiviso senza una tua conferma esplicita: questa opzione controlla solo se il
        prompt di condivisione ti viene proposto a fine allenamento.
      </Text>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 17,
  },
  footnote: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
});
