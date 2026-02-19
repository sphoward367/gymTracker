import type { Timestamp } from 'firebase/firestore';

export interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  type: SetType;
}

export type SetType = 'working' | 'warmup' | 'dropset' | 'failure';

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  restDuration: number;
  notes?: string;
}

/** PR detected during a workout session */
export interface WorkoutPR {
  exerciseId: string;
  exerciseName: string;
  previousWeight: number;
  newWeight: number;
  reps: number;
  estimated1RM: number;
}

export interface Workout {
  id?: string;
  userId: string;
  templateId?: string;
  templateName?: string;
  exercises: WorkoutExercise[];
  startedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  durationSeconds: number;
  totalVolume: number;
  prsAchieved: WorkoutPR[];
}

export interface Template {
  id?: string;
  userId: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface TemplateExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  restDuration: number;
}

export interface PersonalRecord {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxWeightReps: number;
  estimated1RM: number;
  achievedAt: Timestamp | Date;
  workoutId: string;
}

/** History entry for a single exercise across past workouts — returned by workoutService.getExerciseHistory() */
export interface ExerciseHistoryEntry {
  workoutId: string;
  startedAt: Date;
  sets: WorkoutSet[];
  notes?: string;
}
