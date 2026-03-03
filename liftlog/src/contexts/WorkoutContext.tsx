import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

import { workoutService } from '@/services/workouts/workoutService';
import { prService } from '@/services/workouts/prService';

import { useAuth } from '@/contexts/AuthContext';

import type {
  WorkoutExercise,
  WorkoutSet,
  WorkoutPR,
  PersonalRecord,
  SetType,
} from '@/types/workout';

import { workoutVolume, estimatedOneRepMax } from '@/utils/calculations';
import { draftStorage } from '@/utils/draftStorage';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface WorkoutState {
  status: 'idle' | 'active' | 'completing';
  workoutId: string | null;
  exercises: WorkoutExercise[];
  startedAt: Date | null;
  prsAchieved: WorkoutPR[];
  personalRecords: Map<string, PersonalRecord>;
  templateId?: string;
  templateName?: string;
}

const initialState: WorkoutState = {
  status: 'idle',
  workoutId: null,
  exercises: [],
  startedAt: null,
  prsAchieved: [],
  personalRecords: new Map(),
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type WorkoutAction =
  | { type: 'START_WORKOUT'; payload?: { templateId?: string; templateName?: string } }
  | {
      type: 'ADD_EXERCISE';
      payload: {
        exerciseId: string;
        exerciseName: string;
        restDuration?: number;
        previousSets?: WorkoutSet[];
      };
    }
  | { type: 'REMOVE_EXERCISE'; payload: { exerciseIndex: number } }
  | {
      type: 'UPDATE_SET';
      payload: {
        exerciseIndex: number;
        setIndex: number;
        set: Partial<WorkoutSet>;
      };
    }
  | {
      type: 'COMPLETE_SET';
      payload: { exerciseIndex: number; setIndex: number };
    }
  | { type: 'ADD_SET'; payload: { exerciseIndex: number } }
  | { type: 'REMOVE_SET'; payload: { exerciseIndex: number } }
  | {
      type: 'UPDATE_SET_TYPE';
      payload: { exerciseIndex: number; setIndex: number; setType: SetType };
    }
  | {
      type: 'UPDATE_NOTES';
      payload: { exerciseIndex: number; notes: string };
    }
  | { type: 'SET_PERSONAL_RECORDS'; payload: { records: PersonalRecord[] } }
  | { type: 'COMPLETE_WORKOUT' }
  | { type: 'RESET' }
  | { type: 'RESTORE_DRAFT'; payload: WorkoutState };

// ---------------------------------------------------------------------------
// PR helper
// ---------------------------------------------------------------------------

function checkSetForPR(
  exerciseId: string,
  exerciseName: string,
  set: WorkoutSet,
  exercise: WorkoutExercise,
  currentPR: PersonalRecord | undefined,
  existingPRs: WorkoutPR[],
): WorkoutPR[] {
  if (!set.completed || set.type === 'warmup' || set.weight <= 0 || set.reps <= 0) return [];

  // Session total: all already-completed working sets + this set
  const sessionVolume =
    exercise.sets
      .filter((s) => s.completed && s.type !== 'warmup' && s.weight > 0 && s.reps > 0)
      .reduce((sum, s) => sum + s.weight * s.reps, 0) +
    set.weight * set.reps;

  const previousMaxWeight = currentPR?.maxWeight ?? 0;
  const previousMaxVolume = currentPR?.maxVolume ?? 0;

  // Session-best weight tracking to avoid duplicate weight PRs within the same workout
  const sessionBestWeight = existingPRs
    .filter((pr) => pr.exerciseId === exerciseId && pr.prType === 'weight')
    .reduce((best, pr) => Math.max(best, pr.newWeight), 0);

  const effectiveMaxWeight = Math.max(previousMaxWeight, sessionBestWeight);

  if (set.weight > effectiveMaxWeight) {
    // Weight PR — always takes precedence
    return [{
      exerciseId,
      exerciseName,
      prType: 'weight',
      previousWeight: previousMaxWeight,
      newWeight: set.weight,
      reps: set.reps,
      estimated1RM: estimatedOneRepMax(set.weight, set.reps),
      previousVolume: previousMaxVolume,
      newVolume: sessionVolume,
    }];
  }

  // Volume PR — session total exceeds stored best; only fires once per exercise per session
  const alreadyHasWeightPRThisSession = existingPRs.some(
    (pr) => pr.exerciseId === exerciseId && pr.prType === 'weight',
  );
  const alreadyHasVolumePRThisSession = existingPRs.some(
    (pr) => pr.exerciseId === exerciseId && pr.prType === 'volume',
  );
  if (!alreadyHasWeightPRThisSession && !alreadyHasVolumePRThisSession && sessionVolume > previousMaxVolume) {
    return [{
      exerciseId,
      exerciseName,
      prType: 'volume',
      previousWeight: previousMaxWeight,
      newWeight: set.weight,
      reps: set.reps,
      estimated1RM: estimatedOneRepMax(set.weight, set.reps),
      previousVolume: previousMaxVolume,
      newVolume: sessionVolume,
    }];
  }

  return [];
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'START_WORKOUT':
      return {
        ...state,
        status: 'active',
        workoutId: crypto.randomUUID(),
        startedAt: new Date(),
        exercises: [],
        prsAchieved: [],
        templateId: action.payload?.templateId,
        templateName: action.payload?.templateName,
      };

    case 'ADD_EXERCISE': {
      const { exerciseId, exerciseName, restDuration, previousSets } = action.payload;

      const defaultSets: WorkoutSet[] = previousSets
        ? previousSets.map((ps, i) => ({
            setNumber: i + 1,
            weight: ps.weight,
            reps: ps.reps,
            completed: false,
            type: ps.type,
          }))
        : [1, 2, 3].map((n) => ({
            setNumber: n,
            weight: 0,
            reps: 0,
            completed: false,
            type: 'working' as const,
          }));

      const newExercise: WorkoutExercise = {
        exerciseId,
        exerciseName,
        sets: defaultSets,
        restDuration: restDuration ?? 90,
        previousSets,
      };

      return {
        ...state,
        exercises: [...state.exercises, newExercise],
      };
    }

    case 'REMOVE_EXERCISE': {
      const exercises = state.exercises.filter(
        (_, i) => i !== action.payload.exerciseIndex,
      );
      return { ...state, exercises };
    }

    case 'UPDATE_SET': {
      const { exerciseIndex, setIndex, set: updates } = action.payload;
      const exercises = state.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, si) => {
          if (si !== setIndex) return s;
          return { ...s, ...updates };
        });
        return { ...ex, sets };
      });
      return { ...state, exercises };
    }

    case 'COMPLETE_SET': {
      const { exerciseIndex, setIndex } = action.payload;
      const exercise = state.exercises[exerciseIndex];
      if (!exercise) return state;

      const set = exercise.sets[setIndex];
      if (!set) return state;

      // Prevent completing a set with 0 reps — allow toggling off if already completed
      if (!set.completed && set.reps <= 0) return state;

      const completedSet: WorkoutSet = { ...set, completed: !set.completed };

      // Check for PR
      const currentPR = state.personalRecords.get(exercise.exerciseId);
      const newPRs = checkSetForPR(
        exercise.exerciseId,
        exercise.exerciseName,
        completedSet,
        exercise,
        currentPR,
        state.prsAchieved,
      );

      const exercises = state.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, si) => {
          if (si !== setIndex) return s;
          return completedSet;
        });
        return { ...ex, sets };
      });

      return {
        ...state,
        exercises,
        prsAchieved: newPRs.length > 0 ? [...state.prsAchieved, ...newPRs] : state.prsAchieved,
      };
    }

    case 'ADD_SET': {
      const { exerciseIndex } = action.payload;
      const exercises = state.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        const newSetNumber = ex.sets.length + 1;
        const newSet: WorkoutSet = {
          setNumber: newSetNumber,
          weight: 0,
          reps: 0,
          completed: false,
          type: 'working',
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
      return { ...state, exercises };
    }

    case 'REMOVE_SET': {
      const { exerciseIndex } = action.payload;
      const exercises = state.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        if (ex.sets.length <= 1) return ex; // Keep at least 1 set
        return { ...ex, sets: ex.sets.slice(0, -1) };
      });
      return { ...state, exercises };
    }

    case 'UPDATE_SET_TYPE': {
      const { exerciseIndex, setIndex, setType } = action.payload;
      const exercises = state.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, si) => {
          if (si !== setIndex) return s;
          return { ...s, type: setType };
        });
        return { ...ex, sets };
      });
      return { ...state, exercises };
    }

    case 'UPDATE_NOTES': {
      const { exerciseIndex, notes } = action.payload;
      const exercises = state.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        return { ...ex, notes };
      });
      return { ...state, exercises };
    }

    case 'SET_PERSONAL_RECORDS': {
      const map = new Map<string, PersonalRecord>();
      for (const record of action.payload.records) {
        map.set(record.exerciseId, record);
      }
      return { ...state, personalRecords: map };
    }

    case 'COMPLETE_WORKOUT':
      return { ...state, status: 'completing' };

    case 'RESET':
      return {
        ...initialState,
        personalRecords: state.personalRecords,
        templateId: undefined,
        templateName: undefined,
      };

    case 'RESTORE_DRAFT':
      return {
        ...action.payload,
        // Preserve freshly-loaded personal records over stale draft records
        personalRecords:
          state.personalRecords.size > 0
            ? state.personalRecords
            : action.payload.personalRecords,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface WorkoutContextType {
  state: WorkoutState;
  startWorkout: (templateId?: string, templateName?: string) => void;
  addExercise: (
    exerciseId: string,
    exerciseName: string,
    restDuration?: number,
    previousSets?: WorkoutSet[],
  ) => void;
  removeExercise: (exerciseIndex: number) => void;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>,
  ) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number) => void;
  updateSetType: (
    exerciseIndex: number,
    setIndex: number,
    type: SetType,
  ) => void;
  updateNotes: (exerciseIndex: number, notes: string) => void;
  completeWorkout: () => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => void;
  isExercisePR: (exerciseId: string) => boolean;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  // Track whether we've already tried to restore a draft
  const draftRestoredRef = useRef(false);
  // Track whether personal records have been loaded
  const prsLoadedRef = useRef(false);

  // Load personal records from Firestore when user is available
  useEffect(() => {
    if (!user) {
      prsLoadedRef.current = false;
      return;
    }

    let cancelled = false;

    async function loadPRs() {
      try {
        const records = await prService.getPersonalRecords(user!.uid);
        if (!cancelled) {
          dispatch({ type: 'SET_PERSONAL_RECORDS', payload: { records } });
          prsLoadedRef.current = true;
        }
      } catch (err) {
        console.error('Failed to load personal records:', err);
      }
    }

    void loadPRs();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Restore draft from localStorage on mount (once)
  useEffect(() => {
    if (draftRestoredRef.current) return;
    draftRestoredRef.current = true;

    const draft = draftStorage.loadDraft();
    if (draft && draft.status === 'active') {
      dispatch({ type: 'RESTORE_DRAFT', payload: draft as WorkoutState });
    }
  }, []);

  // Persist draft to localStorage after state changes (debounced to avoid excessive writes)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.status !== 'active') return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      draftStorage.saveDraft(state);
    }, 500);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [state]);

  // -- Action creators -------------------------------------------------------

  const startWorkout = useCallback((templateId?: string, templateName?: string) => {
    dispatch({
      type: 'START_WORKOUT',
      payload: templateId !== undefined || templateName !== undefined
        ? { templateId, templateName }
        : undefined,
    });
  }, []);

  const addExercise = useCallback(
    (
      exerciseId: string,
      exerciseName: string,
      restDuration?: number,
      previousSets?: WorkoutSet[],
    ) => {
      dispatch({
        type: 'ADD_EXERCISE',
        payload: { exerciseId, exerciseName, restDuration, previousSets },
      });
    },
    [],
  );

  const removeExercise = useCallback((exerciseIndex: number) => {
    dispatch({ type: 'REMOVE_EXERCISE', payload: { exerciseIndex } });
  }, []);

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
      dispatch({
        type: 'UPDATE_SET',
        payload: { exerciseIndex, setIndex, set: updates },
      });
    },
    [],
  );

  const completeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({
        type: 'COMPLETE_SET',
        payload: { exerciseIndex, setIndex },
      });
    },
    [],
  );

  const addSet = useCallback((exerciseIndex: number) => {
    dispatch({ type: 'ADD_SET', payload: { exerciseIndex } });
  }, []);

  const removeSet = useCallback((exerciseIndex: number) => {
    dispatch({ type: 'REMOVE_SET', payload: { exerciseIndex } });
  }, []);

  const updateSetType = useCallback(
    (exerciseIndex: number, setIndex: number, setType: SetType) => {
      dispatch({
        type: 'UPDATE_SET_TYPE',
        payload: { exerciseIndex, setIndex, setType },
      });
    },
    [],
  );

  const updateNotes = useCallback(
    (exerciseIndex: number, notes: string) => {
      dispatch({ type: 'UPDATE_NOTES', payload: { exerciseIndex, notes } });
    },
    [],
  );

  const completeWorkout = useCallback(() => {
    dispatch({ type: 'COMPLETE_WORKOUT' });
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!user || !state.startedAt) return;

    const now = new Date();
    const durationSeconds = Math.floor(
      (now.getTime() - state.startedAt.getTime()) / 1000,
    );
    const totalVolume = workoutVolume(state.exercises);

    try {
      // Save workout — uses pre-generated workoutId so retries are idempotent
      const savedId = await workoutService.saveWorkout(
        user.uid,
        {
          userId: user.uid,
          templateId: state.templateId,
          templateName: state.templateName,
          exercises: state.exercises.map(({ previousSets: _prev, ...rest }) => rest),
          startedAt: state.startedAt,
          durationSeconds,
          totalVolume,
          prsAchieved: state.prsAchieved,
        },
        state.workoutId ?? undefined,
      );

      // Update personal records in Firestore — group by exerciseId to handle weight + volume PRs together
      const prMap = new Map<string, { weight?: WorkoutPR; volume?: WorkoutPR }>();
      for (const pr of state.prsAchieved) {
        const entry = prMap.get(pr.exerciseId) ?? {};
        if (pr.prType === 'weight') entry.weight = pr;
        else entry.volume = pr;
        prMap.set(pr.exerciseId, entry);
      }
      for (const [exerciseId, { weight: weightPR, volume: volumePR }] of prMap) {
        const existingPR = state.personalRecords.get(exerciseId);
        // Compute final session volume at save time — the PR may have fired before more sets were completed
        const finalSessionVolume =
          state.exercises
            .find((ex) => ex.exerciseId === exerciseId)
            ?.sets.filter((s) => s.completed && s.type !== 'warmup' && s.weight > 0 && s.reps > 0)
            .reduce((sum, s) => sum + s.weight * s.reps, 0) ?? 0;
        await prService.updatePersonalRecord(user.uid, {
          exerciseId,
          exerciseName: (weightPR ?? volumePR)!.exerciseName,
          maxWeight: weightPR?.newWeight ?? existingPR?.maxWeight ?? 0,
          maxWeightReps: weightPR?.reps ?? existingPR?.maxWeightReps ?? 0,
          estimated1RM: weightPR?.estimated1RM ?? existingPR?.estimated1RM ?? 0,
          maxVolume: Math.max(finalSessionVolume, existingPR?.maxVolume ?? 0),
          achievedAt: now,
          workoutId: savedId,
        });
      }

      // Refresh personal records in state after saving
      if (state.prsAchieved.length > 0) {
        const records = await prService.getPersonalRecords(user.uid);
        dispatch({ type: 'SET_PERSONAL_RECORDS', payload: { records } });
      }

      draftStorage.clearDraft();
      dispatch({ type: 'RESET' });
    } catch (err) {
      console.error('Failed to save workout:', err);
      // Revert status so the user can retry
      // We don't dispatch RESET so the workout data is preserved
      throw err;
    }
  }, [user, state.workoutId, state.startedAt, state.exercises, state.prsAchieved, state.personalRecords, state.templateId, state.templateName]);

  const cancelWorkout = useCallback(() => {
    draftStorage.clearDraft();
    dispatch({ type: 'RESET' });
  }, []);

  const isExercisePR = useCallback(
    (exerciseId: string): boolean => {
      return state.prsAchieved.some((pr) => pr.exerciseId === exerciseId);
    },
    [state.prsAchieved],
  );

  // -- Render ----------------------------------------------------------------

  const value: WorkoutContextType = {
    state,
    startWorkout,
    addExercise,
    removeExercise,
    updateSet,
    completeSet,
    addSet,
    removeSet,
    updateSetType,
    updateNotes,
    completeWorkout,
    finishWorkout,
    cancelWorkout,
    isExercisePR,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
