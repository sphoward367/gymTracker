import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { exerciseService } from '@/services/exercises/exerciseService';
import { customExerciseService } from '@/services/exercises/customExerciseService';
import { useAuth } from '@/contexts/AuthContext';
import type { Exercise } from '@/types/exercise';
import { ExerciseSearch } from '@/components/exercises/ExerciseSearch';
import { ExerciseList } from '@/components/exercises/ExerciseList';
import { CreateExerciseForm } from '@/components/exercises/CreateExerciseForm';

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load filter options on mount
  useEffect(() => {
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
    return () => { cancelled = true; };
  }, [user?.uid]);

  // Search exercises when query or filters change
  useEffect(() => {
    let cancelled = false;
    async function searchExercises() {
      setLoading(true);
      try {
        const filters = selectedBodyPart
          ? { bodyPart: selectedBodyPart }
          : undefined;
        const results = await exerciseService.search(
          searchQuery,
          filters,
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
    return () => { cancelled = true; };
  }, [searchQuery, selectedBodyPart, user?.uid]);

  const handleExercisePress = useCallback(
    (exercise: Exercise) => {
      navigate(`/exercises/${exercise.id}`);
    },
    [navigate],
  );

  const handleFilterPress = useCallback((bodyPart: string) => {
    setSelectedBodyPart((prev) => (prev === bodyPart ? null : bodyPart));
  }, []);

  const handleSaveCustomExercise = useCallback(
    async (exercise: Omit<Exercise, 'id' | 'isCustom'>) => {
      if (!user) return;
      await customExerciseService.saveCustomExercise(user.uid, exercise);
      exerciseService.clearCache();
      setShowCreateForm(false);
      // Re-trigger search to include new exercise
      try {
        const filters = selectedBodyPart
          ? { bodyPart: selectedBodyPart }
          : undefined;
        const results = await exerciseService.search(
          searchQuery,
          filters,
          user.uid,
        );
        setExercises(results);
      } catch (err) {
        console.error('Failed to refresh exercise list:', err);
      }
    },
    [user, searchQuery, selectedBodyPart],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-on-surface">Exercise Library</h1>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
        {bodyParts.map((part) => (
          <button
            key={part}
            onClick={() => handleFilterPress(part)}
            className={`flex-shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
              selectedBodyPart === part
                ? 'bg-primary text-on-primary'
                : 'bg-surface-variant text-on-surface'
            }`}
          >
            {part}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <ExerciseList
        exercises={exercises}
        loading={loading}
        onExercisePress={handleExercisePress}
      />

      {/* FAB - Create exercise */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80 transition-opacity"
        aria-label="Create custom exercise"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-on-primary"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Create Exercise Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCreateForm(false)}
          />
          {/* Modal content */}
          <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 max-h-[85vh] overflow-y-auto">
            <CreateExerciseForm
              onSave={handleSaveCustomExercise}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
