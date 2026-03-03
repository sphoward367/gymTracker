import type { TemplateExercise } from '@/types/workout';

export interface TemplateDraft {
  name: string;
  exercises: TemplateExercise[];
}

const TEMPLATE_DRAFT_KEY = 'liftlog_draft_template';

function isTemplateExercise(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return false;
  const e = item as Record<string, unknown>;
  return (
    typeof e['exerciseId'] === 'string' &&
    typeof e['exerciseName'] === 'string' &&
    typeof e['sets'] === 'number' &&
    typeof e['restDuration'] === 'number'
  );
}

function isTemplateDraft(data: unknown): data is TemplateDraft {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d['name'] === 'string' &&
    Array.isArray(d['exercises']) &&
    (d['exercises'] as unknown[]).every(isTemplateExercise)
  );
}

export const templateDraftStorage = {
  saveDraft(draft: TemplateDraft): void {
    try {
      localStorage.setItem(TEMPLATE_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // localStorage may be unavailable; fail silently
    }
  },

  loadDraft(): TemplateDraft | null {
    try {
      const raw = localStorage.getItem(TEMPLATE_DRAFT_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isTemplateDraft(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(TEMPLATE_DRAFT_KEY);
    } catch {
      // fail silently
    }
  },
};
