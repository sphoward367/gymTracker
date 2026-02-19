import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { workoutService } from '@/services/workouts/workoutService';
import { PRBadge } from '@/components/workout/PRBadge';
import { formatDateGroup, formatDuration, formatVolume } from '@/utils/formatters';
import type { Workout } from '@/types/workout';

function groupByDate(workouts: Workout[]): Array<{ label: string; workouts: Workout[] }> {
  const map = new Map<string, Workout[]>();
  for (const w of workouts) {
    const label = formatDateGroup(w.startedAt);
    const group = map.get(label) ?? [];
    group.push(w);
    map.set(label, group);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, workouts: items }));
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchWorkouts() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const data = await workoutService.getWorkouts(user.uid, 50);
        if (!cancelled) {
          setWorkouts(data);
        }
      } catch (err) {
        console.error('Failed to load workouts:', err);
        if (!cancelled) {
          setError('Failed to load workout history. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchWorkouts();
    return () => { cancelled = true; };
  }, [user]);

  const groups = groupByDate(workouts);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 text-on-background">
      <div className="px-6">
        <h1 className="mb-6 text-2xl font-bold text-on-surface">History</h1>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-surface p-4 text-center">
            <p className="text-error">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 min-h-[44px] min-w-[44px] rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary active:opacity-80 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && workouts.length === 0 && (
          <div className="rounded-xl bg-surface p-6 text-center">
            <p className="text-zinc-400">
              No workouts yet. Complete your first workout to see it here.
            </p>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div>
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-2 mt-4 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {group.label}
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {group.workouts.map((workout) => (
                    <button
                      key={workout.id ?? `${workout.startedAt instanceof Date ? workout.startedAt.getTime() : String(workout.startedAt)}`}
                      type="button"
                      onClick={() => {
                        // Guard against documents that have no persisted id yet.
                        if (workout.id) navigate(`/history/${workout.id}`);
                      }}
                      className="flex min-h-[44px] w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-left active:opacity-70 transition-opacity"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-on-surface truncate">
                            {workout.templateName ?? 'Workout'}
                          </p>
                          {workout.prsAchieved.length > 0 && (
                            <PRBadge count={workout.prsAchieved.length} />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-zinc-400">
                          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                          {' · '}
                          {formatDuration(workout.durationSeconds)}
                          {' · '}
                          {formatVolume(workout.totalVolume)}
                        </p>
                      </div>
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
                        className="ml-3 flex-shrink-0 text-zinc-500"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
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
