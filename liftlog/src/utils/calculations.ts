import type { WorkoutExercise } from '@/types/workout';

/** Volume for a single set (weight x reps). */
export function setVolume(weight: number, reps: number): number {
  return weight * reps;
}

/** Volume for one exercise across all its completed sets (excludes warmup sets). */
export function exerciseVolume(exercise: WorkoutExercise): number {
  return exercise.sets
    .filter((s) => s.completed && s.type !== 'warmup')
    .reduce((sum, s) => sum + s.weight * s.reps, 0);
}

/** Total volume for an entire workout (sum of all exercise volumes). */
export function workoutVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((sum, ex) => sum + exerciseVolume(ex), 0);
}

/**
 * Brzycki estimated 1RM formula: weight * (36 / (37 - reps)).
 * Valid for 1-10 reps. Returns weight directly if reps is out of range.
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || reps > 10) return weight;
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)) * 100) / 100;
}
