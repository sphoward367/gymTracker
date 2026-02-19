import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { workoutService } from '@/services/workouts/workoutService';
import { PRBadge } from '@/components/workout/PRBadge';
import { formatDate, formatDuration, formatVolume, formatWeight } from '@/utils/formatters';
import type { Workout } from '@/types/workout';

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function ErrorState({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <p className="text-center text-error">{error ?? 'Workout not found.'}</p>
      <button
        onClick={onBack}
        className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-on-primary active:opacity-80 transition-opacity"
      >
        Back to History
      </button>
    </div>
  );
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    let cancelled = false;

    async function fetchWorkout() {
      if (!id || !user) return;
      try {
        setLoading(true);
        setError(null);
        const data = await workoutService.getWorkoutById(user.uid, id);
        if (cancelled) return;
        if (!data) {
          setError('Workout not found.');
        } else {
          setWorkout(data);
        }
      } catch (err) {
        console.error('Failed to load workout:', err);
        if (!cancelled) {
          setError('Failed to load workout. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchWorkout();
    return () => { cancelled = true; };
  }, [id, user]);

  if (loading) return <LoadingSpinner />;
  if (error || !workout) return <ErrorState error={error} onBack={() => navigate('/history')} />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-background px-4 py-3">
        <button
          onClick={() => navigate('/history')}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-on-surface active:opacity-80 transition-opacity"
          aria-label="Back to history"
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
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-semibold text-on-surface">
            {workout.templateName ?? 'Workout'}
          </h1>
          <p className="text-sm text-zinc-400">
            {formatDate(workout.startedAt)}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs text-zinc-400">Date</p>
            <p className="font-semibold text-on-surface">
              {formatDate(workout.startedAt)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs text-zinc-400">Duration</p>
            <p className="font-semibold text-on-surface">
              {formatDuration(workout.durationSeconds)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs text-zinc-400">Volume</p>
            <p className="font-semibold text-on-surface">
              {formatVolume(workout.totalVolume)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs text-zinc-400">Exercises</p>
            <p className="font-semibold text-on-surface">{workout.exercises.length}</p>
          </div>
        </div>

        {/* PRs section */}
        {workout.prsAchieved.length > 0 && (
          <div className="mb-6 rounded-xl border border-pr-gold/30 bg-pr-gold/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                className="text-pr-gold"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h2 className="font-bold text-pr-gold">Personal Records</h2>
            </div>
            {workout.prsAchieved.map((pr) => (
              <div key={pr.exerciseId} className="flex justify-between py-1 text-sm">
                <span className="text-on-surface">{pr.exerciseName}</span>
                <span className="font-bold text-pr-gold">
                  {formatWeight(pr.newWeight)}kg &times; {pr.reps}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Exercise list */}
        {workout.exercises.map((exercise) => (
          <div key={exercise.exerciseId} className="mb-4 rounded-xl bg-surface overflow-hidden">
            {/* Exercise header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="font-semibold text-on-surface">{exercise.exerciseName}</h3>
              {workout.prsAchieved.some((pr) => pr.exerciseId === exercise.exerciseId) && (
                <PRBadge />
              )}
            </div>

            {/* Notes */}
            {exercise.notes && (
              <div className="px-4 py-2 bg-zinc-900/50">
                <p className="text-sm italic text-zinc-400">"{exercise.notes}"</p>
              </div>
            )}

            {/* Set table header */}
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase text-zinc-500">
              <span className="w-8 text-center">Set</span>
              <span className="w-16 text-center">Type</span>
              <span className="flex-1 text-center">Weight</span>
              <span className="flex-1 text-center">Reps</span>
              <span className="w-8 text-center">✓</span>
            </div>

            {/* Sets */}
            {exercise.sets.map((set) => (
              <div key={set.setNumber} className="flex items-center gap-2 px-4 py-2 border-t border-zinc-800/50">
                <span className="w-8 text-center text-sm text-zinc-400">{set.setNumber}</span>
                <span
                  className={`w-16 text-center text-xs font-medium rounded-full px-2 py-0.5 ${
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
                <span className="flex-1 text-center text-sm text-on-surface">
                  {formatWeight(set.weight)}
                </span>
                <span className="flex-1 text-center text-sm text-on-surface">{set.reps}</span>
                <span
                  className={`w-8 text-center text-sm ${
                    set.completed ? 'text-green-400' : 'text-zinc-600'
                  }`}
                >
                  {set.completed ? '✓' : '–'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
