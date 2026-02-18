import type { Exercise } from '@/types/exercise';
import { normaliseBuiltIn } from './normalisers';
import { customExerciseService } from './customExerciseService';

/** Cache for built-in exercises only (not user-specific). Must never include custom exercises. */
let builtInCache: Exercise[] | null = null;

export const exerciseService = {
  async loadExercises(userId?: string): Promise<Exercise[]> {
    if (!builtInCache) {
      const response = await fetch('/exercises.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.status}`);
      }
      const raw: unknown = await response.json();

      if (!Array.isArray(raw)) {
        throw new Error('exercises.json is not an array');
      }

      builtInCache = raw.map(normaliseBuiltIn);
    }

    if (userId) {
      try {
        const custom = await customExerciseService.getCustomExercises(userId);
        return [...builtInCache, ...custom];
      } catch (err) {
        console.error('Failed to load custom exercises, showing built-in only:', err);
        return builtInCache;
      }
    }

    return builtInCache;
  },

  async search(
    query: string,
    filters?: { bodyPart?: string; equipment?: string },
    userId?: string,
  ): Promise<Exercise[]> {
    const exercises = await this.loadExercises(userId);
    const q = query.toLowerCase();

    return exercises.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (filters?.bodyPart && e.bodyPart !== filters.bodyPart) return false;
      if (filters?.equipment && e.equipment !== filters.equipment) return false;
      return true;
    });
  },

  async getById(id: string, userId?: string): Promise<Exercise | null> {
    const exercises = await this.loadExercises(userId);
    return exercises.find((e) => e.id === id) ?? null;
  },

  async getBodyParts(userId?: string): Promise<string[]> {
    const exercises = await this.loadExercises(userId);
    return [...new Set(exercises.map((e) => e.bodyPart))].sort();
  },

  async getEquipmentList(userId?: string): Promise<string[]> {
    const exercises = await this.loadExercises(userId);
    return [...new Set(exercises.map((e) => e.equipment))].sort();
  },

  clearCache(): void {
    builtInCache = null;
  },
};
