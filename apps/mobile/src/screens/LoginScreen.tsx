import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {
      // error is surfaced from the store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Traktion</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.text} /> : <Text style={styles.submitText}>Log in</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>No account? Register</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    ...typography.screenTitle,
    color: colors.primary,
    fontSize: 34,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
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
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    ...typography.button,
    color: colors.text,
  },
  link: {
    ...typography.bodyMedium,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
  },
});
