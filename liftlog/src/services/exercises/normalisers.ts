import type { Exercise } from '@/types/exercise';

/** Shape of a single exercise entry in public/exercises.json */
export interface RawExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

function capitaliseFirst(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitaliseWords(value: string): string {
  return value.split(' ').map(capitaliseFirst).join(' ');
}

const EQUIPMENT_MAP: Record<string, string> = {
  'body only': 'Bodyweight',
  'other': 'Other',
};

function normaliseEquipment(raw: string | null): string {
  if (!raw) return 'Other';
  const lower = raw.toLowerCase();
  if (lower in EQUIPMENT_MAP) return EQUIPMENT_MAP[lower];
  return capitaliseWords(raw);
}

function isRawExercise(value: unknown): value is RawExercise {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.primaryMuscles) &&
    Array.isArray(obj.secondaryMuscles) &&
    Array.isArray(obj.instructions) &&
    Array.isArray(obj.images)
  );
}

export function normaliseBuiltIn(raw: unknown): Exercise {
  if (!isRawExercise(raw)) {
    throw new Error(`Invalid exercise data: ${JSON.stringify(raw)}`);
  }

  const bodyPart =
    raw.primaryMuscles.length > 0
      ? capitaliseFirst(raw.primaryMuscles[0])
      : 'Other';

  const target =
    raw.primaryMuscles.length > 0
      ? capitaliseFirst(raw.primaryMuscles[0])
      : 'Other';

  const secondaryMuscles = raw.secondaryMuscles.map(capitaliseFirst);

  return {
    id: raw.id,
    name: raw.name,
    bodyPart,
    equipment: normaliseEquipment(raw.equipment),
    target,
    secondaryMuscles,
    instructions: raw.instructions,
    images: raw.images,
    isCustom: false,
  };
}
