import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Workout, WorkoutExercise, ExerciseHistoryEntry } from '@/types/workout';

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
    typeof d['totalVolume'] === 'number' &&
    // prsAchieved may be missing on older documents — default to empty array at read time
    (d['prsAchieved'] === undefined || Array.isArray(d['prsAchieved']))
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
          // Guard against documents written before prsAchieved field was introduced
          prsAchieved: Array.isArray(data.prsAchieved) ? data.prsAchieved : [],
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

  async getWorkoutById(
    userId: string,
    workoutId: string,
  ): Promise<Workout | null> {
    const docRef = doc(workoutsRef(userId), workoutId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    if (!isWorkoutData(data)) return null;
    return {
      id: docSnap.id,
      userId: data.userId,
      templateId: data.templateId,
      templateName: data.templateName,
      exercises: data.exercises,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      durationSeconds: data.durationSeconds,
      totalVolume: data.totalVolume,
      prsAchieved: Array.isArray(data.prsAchieved) ? data.prsAchieved : [],
    };
  },

  async getExerciseHistory(
    userId: string,
    exerciseId: string,
    max?: number,
  ): Promise<ExerciseHistoryEntry[]> {
    const q = query(
      workoutsRef(userId),
      orderBy('startedAt', 'desc'),
      limit(30),
    );
    const snapshot = await getDocs(q);
    const results: ExerciseHistoryEntry[] = [];
    const cap = max ?? 10;

    for (const docSnap of snapshot.docs) {
      if (results.length === cap) break;
      const data = docSnap.data();
      if (!isWorkoutData(data)) continue;
      const match = data.exercises.find(
        (e: WorkoutExercise) => e.exerciseId === exerciseId,
      );
      if (match) {
        const startedAt =
          data.startedAt instanceof Timestamp
            ? data.startedAt.toDate()
            : data.startedAt instanceof Date
              ? data.startedAt
              : new Date();
        results.push({
          workoutId: docSnap.id,
          startedAt,
          sets: match.sets,
          notes: match.notes,
        });
      }
    }

    return results;
  },
};
