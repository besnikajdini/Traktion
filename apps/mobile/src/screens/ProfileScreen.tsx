import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={() => logout()}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  name: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.text,
  },
  email: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    ...typography.button,
    color: colors.danger,
  },
});
