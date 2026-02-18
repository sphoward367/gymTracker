import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import type { PersonalRecord } from '@/types/workout';

function prsRef(userId: string) {
  return collection(db, 'users', userId, 'personalRecords');
}

function isPersonalRecord(data: unknown): data is Omit<PersonalRecord, 'id'> {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d['exerciseId'] === 'string' &&
    typeof d['exerciseName'] === 'string' &&
    typeof d['maxWeight'] === 'number' &&
    typeof d['maxWeightReps'] === 'number' &&
    typeof d['estimated1RM'] === 'number' &&
    typeof d['workoutId'] === 'string' &&
    (d['achievedAt'] instanceof Timestamp || d['achievedAt'] instanceof Date)
  );
}

export const prService = {
  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const snapshot = await getDocs(prsRef(userId));
    const records: PersonalRecord[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isPersonalRecord(data)) {
        records.push({ id: docSnap.id, ...data });
      }
    }

    return records;
  },

  async updatePersonalRecord(
    userId: string,
    pr: Omit<PersonalRecord, 'id'>,
  ): Promise<void> {
    const docRef = doc(prsRef(userId), pr.exerciseId);
    await setDoc(docRef, {
      exerciseId: pr.exerciseId,
      exerciseName: pr.exerciseName,
      maxWeight: pr.maxWeight,
      maxWeightReps: pr.maxWeightReps,
      estimated1RM: pr.estimated1RM,
      achievedAt: pr.achievedAt instanceof Date
        ? Timestamp.fromDate(pr.achievedAt)
        : pr.achievedAt,
      workoutId: pr.workoutId,
    });
  },
};
