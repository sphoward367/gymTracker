import type { WorkoutExercise, WorkoutPR } from '@/types/workout';

/**
 * Serializable version of WorkoutState for localStorage persistence.
 * Date is stored as ISO string, Map<string, PersonalRecord> is stored as entries array.
 */
interface SerializableDraft {
  status: 'idle' | 'active' | 'completing';
  workoutId: string | null;
  exercises: WorkoutExercise[];
  startedAt: string | null;
  prsAchieved: WorkoutPR[];
  personalRecords: Array<[string, SerializablePersonalRecord]>;
}

interface SerializablePersonalRecord {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxWeightReps: number;
  estimated1RM: number;
  achievedAt: string;
  workoutId: string;
}

const DRAFT_KEY = 'liftlog_draft_workout';

function isSerializableDraft(data: unknown): data is SerializableDraft {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    (d['status'] === 'idle' || d['status'] === 'active' || d['status'] === 'completing') &&
    Array.isArray(d['exercises']) &&
    (d['startedAt'] === null || typeof d['startedAt'] === 'string') &&
    Array.isArray(d['prsAchieved']) &&
    Array.isArray(d['personalRecords'])
  );
}

export const draftStorage = {
  saveDraft(state: {
    status: 'idle' | 'active' | 'completing';
    workoutId: string | null;
    exercises: WorkoutExercise[];
    startedAt: Date | null;
    prsAchieved: WorkoutPR[];
    personalRecords: Map<string, {
      id?: string;
      exerciseId: string;
      exerciseName: string;
      maxWeight: number;
      maxWeightReps: number;
      estimated1RM: number;
      achievedAt: Date | { toDate: () => Date };
      workoutId: string;
    }>;
  }): void {
    const serializable: SerializableDraft = {
      status: state.status,
      workoutId: state.workoutId,
      exercises: state.exercises,
      startedAt: state.startedAt ? state.startedAt.toISOString() : null,
      prsAchieved: state.prsAchieved,
      personalRecords: Array.from(state.personalRecords.entries()).map(
        ([key, pr]) => [
          key,
          {
            id: pr.id,
            exerciseId: pr.exerciseId,
            exerciseName: pr.exerciseName,
            maxWeight: pr.maxWeight,
            maxWeightReps: pr.maxWeightReps,
            estimated1RM: pr.estimated1RM,
            achievedAt:
              pr.achievedAt instanceof Date
                ? pr.achievedAt.toISOString()
                : pr.achievedAt.toDate().toISOString(),
            workoutId: pr.workoutId,
          },
        ],
      ),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable));
    } catch {
      // localStorage may be full or unavailable; fail silently
    }
  },

  loadDraft(): {
    status: 'idle' | 'active' | 'completing';
    workoutId: string | null;
    exercises: WorkoutExercise[];
    startedAt: Date | null;
    prsAchieved: WorkoutPR[];
    personalRecords: Map<string, {
      id?: string;
      exerciseId: string;
      exerciseName: string;
      maxWeight: number;
      maxWeightReps: number;
      estimated1RM: number;
      achievedAt: Date;
      workoutId: string;
    }>;
  } | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (!isSerializableDraft(parsed)) return null;

      return {
        status: parsed.status,
        workoutId: parsed.workoutId ?? null,
        exercises: parsed.exercises,
        startedAt: parsed.startedAt ? new Date(parsed.startedAt) : null,
        prsAchieved: parsed.prsAchieved,
        personalRecords: new Map(
          parsed.personalRecords.map(([key, pr]) => [
            key,
            {
              id: pr.id,
              exerciseId: pr.exerciseId,
              exerciseName: pr.exerciseName,
              maxWeight: pr.maxWeight,
              maxWeightReps: pr.maxWeightReps,
              estimated1RM: pr.estimated1RM,
              achievedAt: new Date(pr.achievedAt),
              workoutId: pr.workoutId,
            },
          ]),
        ),
      };
    } catch {
      return null;
    }
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // fail silently
    }
  },
};
