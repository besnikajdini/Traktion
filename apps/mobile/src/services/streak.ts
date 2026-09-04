import type { StreakSummary } from '@traktion/shared-types';
import { api } from './api';

export function getStreak(): Promise<StreakSummary> {
  return api.get<StreakSummary>('/streak');
}
