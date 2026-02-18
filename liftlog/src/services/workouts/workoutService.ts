import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Workout, WorkoutExercise } from '@/types/workout';

function workoutsRef(userId: string) {
  return collection(db, 'users', userId, 'workouts');
}

function isWorkoutData(data: unknown): data is Omit<Workout, 'id'> {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d['userId'] === 'string' &&
    Array.isArray(d['exercises']) &&
    typeof d['durationSeconds'] === 'number' &&
    typeof d['totalVolume'] === 'number'
  );
}

export const workoutService = {
  async saveWorkout(
    userId: string,
    workout: Omit<Workout, 'id'>,
    workoutId?: string,
  ): Promise<string> {
    const startedAt =
      workout.startedAt instanceof Date
        ? Timestamp.fromDate(workout.startedAt)
        : workout.startedAt;

    // Use provided workoutId for idempotent retries, otherwise generate one
    const docRef = workoutId
      ? doc(workoutsRef(userId), workoutId)
      : doc(workoutsRef(userId));

    await setDoc(docRef, {
      userId: workout.userId,
      templateId: workout.templateId ?? null,
      templateName: workout.templateName ?? null,
      exercises: workout.exercises,
      startedAt,
      completedAt: serverTimestamp(),
      durationSeconds: workout.durationSeconds,
      totalVolume: workout.totalVolume,
      prsAchieved: workout.prsAchieved,
    });

    return docRef.id;
  },

  async getWorkouts(userId: string, max = 20): Promise<Workout[]> {
    const q = query(
      workoutsRef(userId),
      orderBy('startedAt', 'desc'),
      limit(max),
    );
    const snapshot = await getDocs(q);
    const workouts: Workout[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isWorkoutData(data)) {
        workouts.push({
          id: docSnap.id,
          userId: data.userId,
          templateId: data.templateId,
          templateName: data.templateName,
          exercises: data.exercises,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          durationSeconds: data.durationSeconds,
          totalVolume: data.totalVolume,
          prsAchieved: data.prsAchieved,
        });
      }
    }

    return workouts;
  },

  async getLastSetsForExercise(
    userId: string,
    exerciseId: string,
  ): Promise<WorkoutExercise | null> {
    const q = query(
      workoutsRef(userId),
      orderBy('startedAt', 'desc'),
      limit(10),
    );
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isWorkoutData(data)) {
        const match = data.exercises.find(
          (e: WorkoutExercise) => e.exerciseId === exerciseId,
        );
        if (match) return match;
      }
    }

    return null;
  },

  async getLastNoteForExercise(
    userId: string,
    exerciseId: string,
  ): Promise<string | null> {
    const q = query(
      workoutsRef(userId),
      orderBy('startedAt', 'desc'),
      limit(10),
    );
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isWorkoutData(data)) {
        const match = data.exercises.find(
          (e: WorkoutExercise) => e.exerciseId === exerciseId,
        );
        if (match?.notes) return match.notes;
      }
    }

    return null;
  },
};
