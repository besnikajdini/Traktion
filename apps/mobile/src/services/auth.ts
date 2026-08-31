import type { User } from '@traktion/shared-types';
import { api } from './api';

export interface AuthResponse {
  user: User;
  token: string;
}

export function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', { email, password, name });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', { email, password });
}

export function getMe(): Promise<User> {
  return api.get<User>('/auth/me');
}
