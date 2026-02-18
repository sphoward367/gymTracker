import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Exercise } from '@/types/exercise';

function customExercisesRef(userId: string) {
  return collection(db, 'users', userId, 'exercises');
}

function isExerciseData(
  data: unknown,
): data is Omit<Exercise, 'id' | 'isCustom'> {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.name === 'string' &&
    typeof obj.bodyPart === 'string' &&
    typeof obj.equipment === 'string' &&
    typeof obj.target === 'string' &&
    Array.isArray(obj.secondaryMuscles) &&
    Array.isArray(obj.instructions) &&
    Array.isArray(obj.images)
  );
}

export const customExerciseService = {
  async saveCustomExercise(
    userId: string,
    exercise: Omit<Exercise, 'id' | 'isCustom'>,
  ): Promise<string> {
    const docRef = await addDoc(customExercisesRef(userId), {
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      equipment: exercise.equipment,
      target: exercise.target,
      secondaryMuscles: exercise.secondaryMuscles,
      instructions: exercise.instructions,
      images: exercise.images,
    });
    return docRef.id;
  },

  async getCustomExercises(userId: string): Promise<Exercise[]> {
    const snapshot = await getDocs(customExercisesRef(userId));
    const exercises: Exercise[] = [];

    for (const docSnap of snapshot.docs) {
      const data: unknown = docSnap.data();
      if (!isExerciseData(data)) {
        console.warn(`Skipping invalid custom exercise document: ${docSnap.id}`);
        continue;
      }
      exercises.push({
        id: docSnap.id,
        name: data.name,
        bodyPart: data.bodyPart,
        equipment: data.equipment,
        target: data.target,
        secondaryMuscles: data.secondaryMuscles,
        instructions: data.instructions,
        images: data.images,
        isCustom: true,
      });
    }

    return exercises;
  },

  async deleteCustomExercise(
    userId: string,
    exerciseId: string,
  ): Promise<void> {
    const docReference = doc(db, 'users', userId, 'exercises', exerciseId);
    await deleteDoc(docReference);
  },
};
