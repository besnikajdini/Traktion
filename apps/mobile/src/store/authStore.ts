// Auth session state. The JWT lives in expo-secure-store (Keychain/Keystore
// — not AsyncStorage, since this is a credential) and is mirrored into
// services/api.ts's in-memory token so every request picks it up
// automatically. `restore()` runs once at app start (see App.tsx) to decide
// whether to land on the auth stack or the main app.
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@traktion/shared-types';
import * as authService from '../services/auth';
import { setAuthToken } from '../services/api';

const TOKEN_KEY = 'traktion.authToken';

interface AuthStore {
  user: User | null;
  status: 'restoring' | 'signedOut' | 'signedIn';
  error: string | null;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: 'restoring',
  error: null,

  restore: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
    if (!token) {
      set({ status: 'signedOut' });
      return;
    }
    setAuthToken(token);
    try {
      const user = await authService.getMe();
      set({ user, status: 'signedIn' });
    } catch {
      // Token expired/invalid — drop it and fall back to the auth stack.
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      setAuthToken(null);
      set({ status: 'signedOut' });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { user, token } = await authService.login(email, password);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setAuthToken(token);
      set({ user, status: 'signedIn' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed' });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ error: null });
    try {
      const { user, token } = await authService.register(email, password, name);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setAuthToken(token);
      set({ user, status: 'signedIn' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    setAuthToken(null);
    set({ user: null, status: 'signedOut' });
  },

  setUser: (user) => set({ user }),
}));
