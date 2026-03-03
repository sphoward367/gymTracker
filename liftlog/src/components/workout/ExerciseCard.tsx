import { useState, useCallback } from 'react';

import type { WorkoutExercise, WorkoutSet, SetType } from '@/types/workout';
import { SetRow } from '@/components/workout/SetRow';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  isPR: boolean;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  onCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  onSetTypeChange: (exerciseIndex: number, setIndex: number, type: SetType) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onUpdateNotes: (exerciseIndex: number, notes: string) => void;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  isPR,
  onUpdateSet,
  onCompleteSet,
  onSetTypeChange,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onUpdateNotes,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  const handleAddSet = useCallback(() => {
    onAddSet(exerciseIndex);
  }, [exerciseIndex, onAddSet]);

  const handleRemoveSet = useCallback(() => {
    onRemoveSet(exerciseIndex);
  }, [exerciseIndex, onRemoveSet]);

  const handleRemoveExercise = useCallback(() => {
    onRemoveExercise(exerciseIndex);
  }, [exerciseIndex, onRemoveExercise]);

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdateNotes(exerciseIndex, e.target.value);
    },
    [exerciseIndex, onUpdateNotes],
  );

  return (
    <div className="rounded-xl bg-surface p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-on-surface">
            {exercise.exerciseName}
          </h3>
          {isPR && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-pr-gold"
              title="Personal Record!"
              aria-label="Personal Record"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Notes toggle */}
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-colors ${
              showNotes ? 'text-primary' : 'text-zinc-500 active:text-zinc-300'
            }`}
            aria-label="Toggle notes"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </button>
          {/* Remove exercise */}
          <button
            type="button"
            onClick={handleRemoveExercise}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-500 active:text-error transition-colors"
            aria-label="Remove exercise"
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes section */}
      {showNotes && (
        <div className="mb-3">
          <textarea
            value={exercise.notes ?? ''}
            onChange={handleNotesChange}
            placeholder="Add notes for this exercise..."
            rows={2}
            className="min-h-[44px] w-full resize-none rounded-lg bg-zinc-800 px-3 py-2 text-sm text-on-surface placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      )}

      {/* Column headers */}
      <div className="mb-1 flex items-center gap-2 px-2 text-xs font-medium text-zinc-500">
        <span className="min-w-[44px] text-center">Type</span>
        <span className="w-6 text-center">Set</span>
        <span className="w-16 text-center">Weight</span>
        <span className="w-4" />
        <span className="w-14 text-center">Reps</span>
        <span className="ml-auto min-w-[44px] text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>

      {/* Sets */}
      <div className="flex flex-col gap-1">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={setIndex}
            set={set}
            exerciseIndex={exerciseIndex}
            setIndex={setIndex}
            previousSet={exercise.previousSets?.[setIndex]}
            onUpdate={onUpdateSet}
            onComplete={onCompleteSet}
            onTypeChange={onSetTypeChange}
          />
        ))}
      </div>

      {/* Footer: Add/Remove Set buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddSet}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-800 text-sm font-medium text-on-surface active:bg-zinc-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
          Add Set
        </button>
        {exercise.sets.length > 1 && (
          <button
            type="button"
            onClick={handleRemoveSet}
            className="flex min-h-[44px] items-center justify-center gap-1 rounded-lg bg-zinc-800 px-4 text-sm font-medium text-zinc-400 active:bg-zinc-700 active:text-error transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
