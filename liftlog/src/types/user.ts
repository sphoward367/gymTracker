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
