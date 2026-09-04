// Transient hand-off for "exercise picked in the modal picker, pending
// consumption by whichever screen opened it." Avoids the navigate()+merge
// pattern for returning a value from a modal screen, which is fragile with
// native-stack modal presentation (see PlanBuilderScreen/ExercisePickerScreen).
import { create } from 'zustand';
import type { Exercise } from '@traktion/shared-types';

interface ExercisePickerStore {
  pickedExercise: Exercise | null;
  setPickedExercise: (exercise: Exercise) => void;
  /** Reads and clears atomically, so a screen can't double-consume across renders. */
  consumePickedExercise: () => Exercise | null;
}

export const useExercisePickerStore = create<ExercisePickerStore>((set, get) => ({
  pickedExercise: null,
  setPickedExercise: (exercise) => set({ pickedExercise: exercise }),
  consumePickedExercise: () => {
    const exercise = get().pickedExercise;
    if (exercise) set({ pickedExercise: null });
    return exercise;
  },
}));
