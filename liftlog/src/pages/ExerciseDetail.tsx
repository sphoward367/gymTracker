import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { exerciseService } from '@/services/exercises/exerciseService';
import { useAuth } from '@/contexts/AuthContext';
import type { Exercise } from '@/types/exercise';
import { ExerciseDetailView } from '@/components/exercises/ExerciseDetailView';

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchExercise() {
      if (!id) {
        setError('No exercise ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await exerciseService.getById(id, user?.uid);

        if (cancelled) return;

        if (!result) {
          setError('Exercise not found.');
        } else {
          setExercise(result);
        }
      } catch (err) {
        console.error('Failed to load exercise:', err);
        if (!cancelled) setError('Failed to load exercise. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchExercise();
    return () => { cancelled = true; };
  }, [id, user?.uid]);

  function handleBack() {
    navigate('/exercises');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-error text-center">{error ?? 'Exercise not found.'}</p>
        <button
          onClick={handleBack}
          className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-on-primary active:opacity-80 transition-opacity"
        >
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-background px-4 py-3">
        <button
          onClick={handleBack}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-on-surface active:opacity-80 transition-opacity"
          aria-label="Back to exercises"
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
        <h1 className="truncate text-lg font-semibold text-on-surface">
          {exercise.name}
        </h1>
      </div>

      <ExerciseDetailView exercise={exercise} />
    </div>
  );
}
