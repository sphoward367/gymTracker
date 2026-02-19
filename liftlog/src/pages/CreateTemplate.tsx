import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { templateService } from '@/services/templates/templateService';
import { useAuth } from '@/contexts/AuthContext';
import type { Exercise } from '@/types/exercise';
import { AddExerciseModal } from '@/components/workout/AddExerciseModal';

interface TemplateExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  restDuration: number;
}

export default function CreateTemplate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<TemplateExerciseEntry[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => {
      // Don't add duplicates
      if (prev.some((e) => e.exerciseId === exercise.id)) return prev;
      return [
        ...prev,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: 3,
          restDuration: 90,
        },
      ];
    });
  }, []);

  function handleRemoveExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSetCount(index: number, delta: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== index) return ex;
        const newSets = Math.max(1, ex.sets + delta);
        return { ...ex, sets: newSets };
      }),
    );
  }

  async function handleSave() {
    if (!user) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a template name.');
      return;
    }
    if (exercises.length === 0) {
      setError('Add at least one exercise.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // templateService.createTemplate expects WorkoutExercise[] shape
      // but only reads exerciseId, exerciseName, sets.length, restDuration
      // Build a minimal WorkoutExercise[] to satisfy the signature
      const workoutExercises = exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: 0,
          reps: 0,
          completed: false,
          type: 'working' as const,
        })),
        restDuration: ex.restDuration,
      }));

      await templateService.createTemplate(user.uid, trimmed, workoutExercises);
      navigate('/');
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-on-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-background px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-on-surface active:opacity-80 transition-opacity"
          aria-label="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-on-surface">Create Template</h1>
      </div>

      <div className="px-4 pt-4">
        {/* Template name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name (e.g. Push Day)"
          maxLength={200}
          className="mb-4 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-on-surface placeholder-zinc-500 focus:border-primary focus:outline-none"
          aria-label="Template name"
        />

        {/* Exercise list */}
        {exercises.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {exercises.map((ex, index) => (
              <div
                key={ex.exerciseId}
                className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3"
              >
                {/* Exercise info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-on-surface">
                    {ex.exerciseName}
                  </p>
                  <p className="text-xs text-zinc-500">{ex.sets} sets</p>
                </div>

                {/* Set count controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetCount(index, -1)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 active:bg-zinc-700 transition-colors"
                    aria-label="Decrease sets"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-on-surface">
                    {ex.sets}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetCount(index, 1)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 active:bg-zinc-700 transition-colors"
                    aria-label="Increase sets"
                  >
                    +
                  </button>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(index)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-500 active:text-error transition-colors"
                  aria-label={`Remove ${ex.exerciseName}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add exercise button */}
        <button
          type="button"
          onClick={() => setShowAddExercise(true)}
          className="mb-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm font-medium text-zinc-400 active:border-primary active:text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Exercise
        </button>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-error">{error}</p>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || exercises.length === 0 || name.trim() === ''}
          className="flex min-h-[56px] w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-semibold text-on-primary transition-opacity active:opacity-80 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>

      <AddExerciseModal
        visible={showAddExercise}
        onSelect={handleAddExercise}
        onClose={() => setShowAddExercise(false)}
      />
    </div>
  );
}
