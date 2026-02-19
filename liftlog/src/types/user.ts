import type { Timestamp } from 'firebase/firestore';

export type WeightUnit = 'kg' | 'lbs';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  units: WeightUnit;
  defaultRestDuration: number;
  createdAt: Timestamp | Date;
}

export interface BodyWeightEntry {
  /** ISO date string "YYYY-MM-DD" — also used as Firestore document ID */
  date: string;
  weight: number;
  userId: string;
  loggedAt: Timestamp | Date;
}
