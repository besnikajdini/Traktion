// Global state for the one workout session that can be "in progress" at a
// time. Kept in Zustand (not screen-local state) so it survives navigating
// between tabs — e.g. the session stays alive if the user checks another tab
// mid-workout — and so the Home tab can eventually surface a "resume
// workout" banner. The backend (GET /workout-sessions/active) is the source
// of truth on cold start; this store just caches it in memory.
import { create } from 'zustand';
import type { SetLog, WorkoutSessionDetail } from '@traktion/shared-types';
import { cancelNotification, scheduleRestEndNotification } from '../services/notifications';

export interface RestTimerState {
  exerciseId: string;
  exerciseName: string;
  /** Denominator for the progress bar; grows/shrinks with +15s/-15s adjustments. */
  totalSeconds: number;
  /** Absolute ms timestamp the rest ends at — recomputing from this (rather
   *  than decrementing a counter) keeps the countdown correct even if the JS
   *  timer is throttled while the app is backgrounded. */
  endTimestamp: number;
  notificationId: string | null;
}

interface SessionStore {
  session: WorkoutSessionDetail | null;
  restTimer: RestTimerState | null;
  setSession: (session: WorkoutSessionDetail | null) => void;
  addSetLog: (log: SetLog) => void;
  removeSetLog: (setLogId: string) => void;
  startRestTimer: (exerciseId: string, exerciseName: string, seconds: number) => Promise<void>;
  adjustRestTimer: (deltaSeconds: number) => Promise<void>;
  clearRestTimer: () => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,
  restTimer: null,

  setSession: (session) => set({ session }),

  addSetLog: (log) =>
    set((state) =>
      state.session ? { session: { ...state.session, setLogs: [...state.session.setLogs, log] } } : state,
    ),

  removeSetLog: (setLogId) =>
    set((state) =>
      state.session
        ? { session: { ...state.session, setLogs: state.session.setLogs.filter((l) => l.id !== setLogId) } }
        : state,
    ),

  startRestTimer: async (exerciseId, exerciseName, seconds) => {
    const previous = get().restTimer;
    if (previous?.notificationId) {
      await cancelNotification(previous.notificationId);
    }
    const notificationId = await scheduleRestEndNotification(seconds, exerciseName).catch(() => null);
    set({
      restTimer: {
        exerciseId,
        exerciseName,
        totalSeconds: seconds,
        endTimestamp: Date.now() + seconds * 1000,
        notificationId,
      },
    });
  },

  adjustRestTimer: async (deltaSeconds) => {
    const timer = get().restTimer;
    if (!timer) return;

    if (timer.notificationId) {
      await cancelNotification(timer.notificationId);
    }

    const newEndTimestamp = timer.endTimestamp + deltaSeconds * 1000;
    const remainingSeconds = Math.max(0, Math.round((newEndTimestamp - Date.now()) / 1000));

    if (remainingSeconds <= 0) {
      set({ restTimer: null });
      return;
    }

    const notificationId = await scheduleRestEndNotification(remainingSeconds, timer.exerciseName).catch(() => null);
    set({
      restTimer: {
        ...timer,
        totalSeconds: Math.max(1, timer.totalSeconds + deltaSeconds),
        endTimestamp: Date.now() + remainingSeconds * 1000,
        notificationId,
      },
    });
  },

  clearRestTimer: async () => {
    const timer = get().restTimer;
    if (timer?.notificationId) {
      await cancelNotification(timer.notificationId);
    }
    set({ restTimer: null });
  },
}));
