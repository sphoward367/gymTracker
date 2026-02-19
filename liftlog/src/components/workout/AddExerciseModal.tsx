import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Load body part filter options once on first open
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    async function loadBodyParts() {
      try {
        const parts = await exerciseService.getBodyParts(user?.uid);
        if (!cancelled) setBodyParts(parts);
      } catch (err) {
        console.error('Failed to load body parts:', err);
      }
    }

    void loadBodyParts();
    return () => {
      cancelled = true;
    };
  }, [visible, user?.uid]);

  // Search exercises when query or filter changes
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    async function searchExercises() {
      setLoading(true);
      try {
        const filters = selectedBodyPart ? { bodyPart: selectedBodyPart } : undefined;
        const results = await exerciseService.search(searchQuery, filters, user?.uid);
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
  }, [searchQuery, selectedBodyPart, visible, user?.uid]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSelectedBodyPart(null);
    }
  }, [visible]);

  const handleSelect = useCallback(
    (exercise: Exercise) => {
      onSelect(exercise);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleViewDetail = useCallback(
    (exercise: Exercise) => {
      // Workout state is preserved in context + localStorage draft
      // User can navigate back to /workout to resume
      onClose();
      navigate(`/exercises/${exercise.id}`);
    },
    [navigate, onClose],
  );

  const handleFilterPress = useCallback((bodyPart: string) => {
    setSelectedBodyPart((prev) => (prev === bodyPart ? null : bodyPart));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-on-surface">Add Exercise</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-zinc-400 active:text-on-surface transition-colors"
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
      <div className="px-4 pb-2">
        <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Body part filter chips */}
      {bodyParts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {bodyParts.map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => handleFilterPress(part)}
              className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedBodyPart === part
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-variant text-on-surface'
              }`}
            >
              {part}
            </button>
          ))}
        </div>
      )}

      {/* Exercise list — tap row to add, tap ⓘ to view detail */}
      <ExerciseList
        exercises={exercises}
        loading={loading}
        onExercisePress={handleSelect}
        onExerciseInfoPress={handleViewDetail}
      />
    </div>
  );
}
