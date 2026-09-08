import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <PressableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.menuText}>Impostazioni</Text>
        <Text style={styles.menuChevron}>›</Text>
      </PressableOpacity>

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
  username: {
    ...typography.body,
    color: colors.primary,
    marginTop: 4,
  },
  email: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...shadows.card,
  },
  menuText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  menuChevron: {
    ...typography.cardTitle,
    color: colors.textMuted,
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
