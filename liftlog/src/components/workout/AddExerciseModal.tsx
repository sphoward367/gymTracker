import { useState, useEffect, useCallback } from 'react';

import { exerciseService } from '@/services/exercises/exerciseService';
import { useAuth } from '@/contexts/AuthContext';
import type { Exercise } from '@/types/exercise';
import { ExerciseSearch } from '@/components/exercises/ExerciseSearch';
import { ExerciseList } from '@/components/exercises/ExerciseList';

interface AddExerciseModalProps {
  visible: boolean;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function AddExerciseModal({
  visible,
  onSelect,
  onClose,
}: AddExerciseModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Search exercises when query changes
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    async function searchExercises() {
      setLoading(true);
      try {
        const results = await exerciseService.search(
          searchQuery,
          undefined,
          user?.uid,
        );
        if (!cancelled) setExercises(results);
      } catch (err) {
        console.error('Failed to search exercises:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void searchExercises();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, visible, user?.uid]);

  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const handleSelect = useCallback(
    (exercise: Exercise) => {
      onSelect(exercise);
      onClose();
    },
    [onSelect, onClose],
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-on-surface">Add Exercise</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 active:text-on-surface transition-colors"
          aria-label="Close"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Exercise list */}
      <ExerciseList
        exercises={exercises}
        loading={loading}
        onExercisePress={handleSelect}
      />
    </div>
  );
}
