import { useCallback } from 'react';

import type { WorkoutSet, SetType } from '@/types/workout';

interface SetRowProps {
  set: WorkoutSet;
  exerciseIndex: number;
  setIndex: number;
  previousSet?: WorkoutSet;
  onUpdate: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  onComplete: (exerciseIndex: number, setIndex: number) => void;
  onTypeChange: (exerciseIndex: number, setIndex: number, type: SetType) => void;
}

const SET_TYPE_ORDER: SetType[] = ['working', 'warmup', 'dropset', 'failure'];

const SET_TYPE_CONFIG: Record<SetType, { label: string; bg: string; text: string }> = {
  working: { label: 'W', bg: 'bg-zinc-700', text: 'text-zinc-200' },
  warmup: { label: 'WU', bg: 'bg-amber-900/60', text: 'text-amber-300' },
  dropset: { label: 'D', bg: 'bg-blue-900/60', text: 'text-blue-300' },
  failure: { label: 'F', bg: 'bg-red-900/60', text: 'text-red-300' },
};

export function SetRow({
  set,
  exerciseIndex,
  setIndex,
  previousSet,
  onUpdate,
  onComplete,
  onTypeChange,
}: SetRowProps) {
  const cycleType = useCallback(() => {
    const currentIndex = SET_TYPE_ORDER.indexOf(set.type);
    const nextIndex = (currentIndex + 1) % SET_TYPE_ORDER.length;
    onTypeChange(exerciseIndex, setIndex, SET_TYPE_ORDER[nextIndex]);
  }, [set.type, exerciseIndex, setIndex, onTypeChange]);

  const handleWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
        onUpdate(exerciseIndex, setIndex, { weight: 0 });
        return;
      }
      const parsed = parseFloat(value);
      if (Number.isNaN(parsed) || parsed < 0) return;
      onUpdate(exerciseIndex, setIndex, { weight: parsed });
    },
    [exerciseIndex, setIndex, onUpdate],
  );

  const handleRepsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
        onUpdate(exerciseIndex, setIndex, { reps: 0 });
        return;
      }
      const parsed = parseInt(value, 10);
      if (Number.isNaN(parsed) || parsed < 0) return;
      onUpdate(exerciseIndex, setIndex, { reps: parsed });
    },
    [exerciseIndex, setIndex, onUpdate],
  );

  const handleComplete = useCallback(() => {
    onComplete(exerciseIndex, setIndex);
  }, [exerciseIndex, setIndex, onComplete]);

  const typeConfig = SET_TYPE_CONFIG[set.type];

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
        set.completed ? 'bg-green-900/20' : ''
      }`}
    >
      {/* Set type chip */}
      <button
        type="button"
        onClick={cycleType}
        className={`min-h-[44px] min-w-[44px] rounded-full px-2 text-xs font-bold ${typeConfig.bg} ${typeConfig.text} active:opacity-70 transition-opacity`}
        aria-label={`Set type: ${set.type}. Tap to change.`}
      >
        {typeConfig.label}
      </button>

      {/* Set number */}
      <span className="w-6 text-center text-sm text-zinc-400">
        {set.setNumber}
      </span>

      {/* Weight input */}
      <input
        type="number"
        inputMode="decimal"
        value={set.weight || ''}
        onChange={handleWeightChange}
        placeholder={previousSet?.weight ? String(previousSet.weight) : '0'}
        className="min-h-[44px] w-16 rounded-lg bg-zinc-800 px-2 text-center text-base text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-primary focus:outline-none"
        aria-label="Weight"
      />

      {/* Separator */}
      <span className="text-sm text-zinc-500">&times;</span>

      {/* Reps input */}
      <input
        type="number"
        inputMode="numeric"
        value={set.reps || ''}
        onChange={handleRepsChange}
        placeholder={previousSet?.reps ? String(previousSet.reps) : '0'}
        className="min-h-[44px] w-14 rounded-lg bg-zinc-800 px-2 text-center text-base text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-primary focus:outline-none"
        aria-label="Reps"
      />

      {/* Complete button */}
      <button
        type="button"
        onClick={handleComplete}
        className={`ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors ${
          set.completed
            ? 'bg-green-600 text-white'
            : 'bg-zinc-800 text-zinc-500 active:bg-zinc-700'
        }`}
        aria-label={set.completed ? 'Set completed' : 'Mark set as complete'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
  );
}
