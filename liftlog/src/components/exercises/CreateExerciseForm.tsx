import { useState, useCallback } from 'react';

import type { Exercise } from '@/types/exercise';

interface CreateExerciseFormProps {
  onSave: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => Promise<void>;
  onCancel: () => void;
}

const BODY_PART_OPTIONS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Other',
];

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Smith Machine',
  'Cable',
  'Bodyweight',
  'Other',
];

export function CreateExerciseForm({
  onSave,
  onCancel,
}: CreateExerciseFormProps) {
  const [name, setName] = useState('');
  const [bodyPart, setBodyPart] = useState(BODY_PART_OPTIONS[0]);
  const [equipment, setEquipment] = useState(EQUIPMENT_OPTIONS[0]);
  const [target, setTarget] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Exercise name is required');
      return;
    }
    if (!BODY_PART_OPTIONS.includes(bodyPart)) {
      setError('Invalid body part selected');
      return;
    }
    if (!EQUIPMENT_OPTIONS.includes(equipment)) {
      setError('Invalid equipment selected');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await onSave({
        name: trimmedName,
        bodyPart,
        equipment,
        target: target.trim() || bodyPart,
        secondaryMuscles: [],
        instructions: instructions
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .slice(0, 20)
          .map((line) => line.slice(0, 500)),
        images: [],
      });
    } catch (err) {
      console.error('Failed to save exercise:', err);
      setError('Failed to save exercise. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, bodyPart, equipment, target, instructions, onSave]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-on-surface">
        Create Custom Exercise
      </h2>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">
          Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Incline Dumbbell Curl"
          maxLength={100}
          className="min-h-[44px] w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Body Part */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Body Part</label>
        <select
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          className="min-h-[44px] w-full rounded-lg bg-zinc-800 px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
        >
          {BODY_PART_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Equipment</label>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="min-h-[44px] w-full rounded-lg bg-zinc-800 px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
        >
          {EQUIPMENT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Target Muscle */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Target Muscle</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g. Biceps (defaults to body part)"
          maxLength={100}
          className="min-h-[44px] w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">
          Instructions (one step per line)
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Step 1&#10;Step 2&#10;Step 3"
          rows={4}
          className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-error">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 min-h-[44px] rounded-lg bg-surface-variant px-4 py-3 font-medium text-on-surface active:opacity-80 transition-opacity disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving}
          className="flex-1 min-h-[44px] rounded-lg bg-primary px-4 py-3 font-medium text-on-primary active:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
              Saving...
            </div>
          ) : (
            'Create Exercise'
          )}
        </button>
      </div>
    </div>
  );
}
