import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import type { Template, TemplateExercise, WorkoutExercise } from '@/types/workout';

function templatesRef(userId: string) {
  return collection(db, 'users', userId, 'templates');
}

function isTemplateData(data: unknown): data is Omit<Template, 'id'> {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d['userId'] === 'string' &&
    typeof d['name'] === 'string' &&
    Array.isArray(d['exercises']) &&
    d['createdAt'] !== undefined &&
    d['updatedAt'] !== undefined
  );
}

export const templateService = {
  async createTemplate(
    userId: string,
    name: string,
    exercises: WorkoutExercise[],
  ): Promise<string> {
    // Input validation — mirrors Firestore security rules
    if (!userId) throw new Error('userId is required');
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Template name cannot be empty');
    if (trimmedName.length > 200) throw new Error('Template name must be 200 characters or fewer');
    if (exercises.length === 0) throw new Error('Template must contain at least one exercise');

    const templateExercises: TemplateExercise[] = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets.length,
      restDuration: ex.restDuration,
    }));

    const docRef = await addDoc(templatesRef(userId), {
      userId,
      name: trimmedName,
      exercises: templateExercises,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async getTemplates(userId: string): Promise<Template[]> {
    const q = query(templatesRef(userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const templates: Template[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isTemplateData(data)) {
        templates.push({
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          exercises: data.exercises,
          createdAt: data.createdAt as Timestamp | Date,
          updatedAt: data.updatedAt as Timestamp | Date,
        });
      }
    }

    return templates;
  },

  async getTemplate(userId: string, templateId: string): Promise<Template | null> {
    const docRef = doc(templatesRef(userId), templateId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (!isTemplateData(data)) return null;

    return {
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      exercises: data.exercises,
      createdAt: data.createdAt as Timestamp | Date,
      updatedAt: data.updatedAt as Timestamp | Date,
    };
  },

  async updateTemplate(
    userId: string,
    templateId: string,
    updates: { name?: string; exercises?: TemplateExercise[] },
  ): Promise<void> {
    if (!userId) throw new Error('userId is required');
    // Validate name if being updated
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) throw new Error('Template name cannot be empty');
      if (trimmedName.length > 200) throw new Error('Template name must be 200 characters or fewer');
      updates = { ...updates, name: trimmedName };
    }
    // Validate exercises if being updated
    if (updates.exercises !== undefined && updates.exercises.length === 0) {
      throw new Error('Template must contain at least one exercise');
    }
    const docRef = doc(templatesRef(userId), templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    const docRef = doc(templatesRef(userId), templateId);
    await deleteDoc(docRef);
  },
};
