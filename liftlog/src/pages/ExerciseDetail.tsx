import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { exerciseService } from '@/services/exercises/exerciseService';
import { workoutService } from '@/services/workouts/workoutService';
import { prService } from '@/services/workouts/prService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatWeight } from '@/utils/formatters';
import { PRBadge } from '@/components/workout/PRBadge';
import type { Exercise } from '@/types/exercise';
import type { ExerciseHistoryEntry, PersonalRecord } from '@/types/workout';
import { ExerciseDetailView } from '@/components/exercises/ExerciseDetailView';
import { ExerciseCharts } from '@/components/charts/ExerciseCharts';

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [pr, setPr] = useState<PersonalRecord | null>(null);

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

          const [historyData, prData] = await Promise.all([
            user
              ? workoutService.getExerciseHistory(user.uid, id, 20)
              : Promise.resolve([]),
            user
              ? prService.getPersonalRecord(user.uid, id)
              : Promise.resolve(null),
          ]);

          if (!cancelled) {
            setHistory(historyData);
            setPr(prData);
          }
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
    navigate(-1);
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

      <ExerciseCharts history={history} />

      {/* PR Section */}
      {pr && (
        <div className="mx-4 mb-4 rounded-xl border border-pr-gold/30 bg-pr-gold/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              className="text-pr-gold"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h2 className="font-bold text-pr-gold">Personal Record</h2>
            <PRBadge />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Max Weight</span>
            <span className="font-bold text-pr-gold">
              {formatWeight(pr.maxWeight)}kg &times; {pr.maxWeightReps} reps
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-zinc-400">Est. 1RM</span>
            <span className="font-semibold text-on-surface">
              {formatWeight(pr.estimated1RM)}kg
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-zinc-400">Achieved</span>
            <span className="text-on-surface">
              {formatDate(pr.achievedAt)}
            </span>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="mx-4 mb-6">
        <h2 className="mb-3 text-lg font-bold text-on-surface">History</h2>
        {history.length === 0 ? (
          <div className="rounded-xl bg-surface p-4 text-center text-zinc-400">
            No history yet. Log this exercise to see your progression.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((entry) => (
              <div key={entry.workoutId} className="rounded-xl bg-surface overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <p className="text-sm font-medium text-zinc-400">
                    {formatDate(entry.startedAt)}
                  </p>
                  {entry.notes && (
                    <p className="text-xs italic text-zinc-500 mt-0.5">"{entry.notes}"</p>
                  )}
                </div>
                <div className="px-4 py-2">
                  {entry.sets
                    .filter((s) => s.completed)
                    .map((set) => (
                      <div key={set.setNumber} className="flex items-center gap-3 py-1 text-sm">
                        <span className="w-6 text-zinc-500 text-center">{set.setNumber}</span>
                        <span
                          className={`text-xs rounded-full px-2 py-0.5 ${
                            set.type === 'warmup'
                              ? 'bg-blue-900/40 text-blue-300'
                              : set.type === 'dropset'
                                ? 'bg-orange-900/40 text-orange-300'
                                : set.type === 'failure'
                                  ? 'bg-red-900/40 text-red-300'
                                  : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {set.type}
                        </span>
                        <span className="font-medium text-on-surface">
                          {formatWeight(set.weight)}kg &times; {set.reps}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
