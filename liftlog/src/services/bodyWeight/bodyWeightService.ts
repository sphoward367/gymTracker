import { collection, doc, setDoc, getDocs, getDocsFromCache, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BodyWeightEntry } from '@/types/user';

function bodyWeightRef(userId: string) {
  return collection(db, 'users', userId, 'bodyWeight');
}

function isBodyWeightData(
  data: unknown,
): data is { weight: number; userId: string; loggedAt: Timestamp | Date } {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d['weight'] !== 'number' || !(d['weight'] > 0) || d['weight'] > 500) return false;
  if (typeof d['userId'] !== 'string') return false;
  const loggedAt = d['loggedAt'];
  if (
    !(loggedAt instanceof Timestamp) &&
    !(loggedAt instanceof Date && !isNaN(loggedAt.getTime()))
  ) return false;
  return true;
}

export const bodyWeightService = {
  async logWeight(userId: string, weight: number, date?: Date): Promise<void> {
    if (!isFinite(weight) || weight <= 0 || weight > 500) {
      throw new RangeError(`Invalid weight value: ${weight}`);
    }
    const d = date ?? new Date();
    const docId = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');

    const docRef = doc(bodyWeightRef(userId), docId);
    await setDoc(docRef, {
      weight,
      userId,
      loggedAt: Timestamp.now(),
    });
  },

  async getHistory(userId: string, max = 30): Promise<BodyWeightEntry[]> {
    const q = query(
      bodyWeightRef(userId),
      orderBy('loggedAt', 'desc'),
      limit(max),
    );
    // Try server first; fall back to local cache if server rejects (e.g. rules not deployed)
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocsFromCache(q);
    }
    const entries: BodyWeightEntry[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isBodyWeightData(data)) {
        entries.push({
          date: docSnap.id,
          weight: data.weight,
          userId: data.userId,
          loggedAt: data.loggedAt,
        });
      }
    }

    entries.reverse();
    return entries;
  },
};
