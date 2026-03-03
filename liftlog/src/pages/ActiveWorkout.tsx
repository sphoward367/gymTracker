import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useWorkout } from '@/contexts/WorkoutContext';
import { useTimer } from '@/contexts/TimerContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Exercise } from '@/types/exercise';
import type { TemplateExercise, WorkoutSet } from '@/types/workout';
import { workoutVolume } from '@/utils/calculations';
import { templateService } from '@/services/templates/templateService';
import { workoutService } from '@/services/workouts/workoutService';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { AddExerciseModal } from '@/components/workout/AddExerciseModal';
import { WorkoutSummary } from '@/components/workout/WorkoutSummary';
import { TimerBar } from '@/components/timer/TimerBar';

function formatElapsedTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export default function ActiveWorkout() {
  const {
    state,
    startWorkout,
    addExercise,
    removeExercise,
    updateSet,
    completeSet,
    addSet,
    removeSet,
    updateSetType,
    updateNotes,
    completeWorkout,
    finishWorkout,
    cancelWorkout,
    isExercisePR,
  } = useWorkout();

  const { timerState, startTimer, adjustTimer, skipTimer } = useTimer();
  const { user } = useAuth();
  const location = useLocation();

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Elapsed time counter using clock-diff approach
  useEffect(() => {
    if (state.status !== 'active' || !state.startedAt) return;

    function updateElapsed() {
      if (state.startedAt) {
        const now = Date.now();
        const started = state.startedAt.getTime();
        setElapsedSeconds(Math.floor((now - started) / 1000));
      }
    }

    // Update immediately
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    // Also update on visibility change (clock-diff recovery for iOS)
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        updateElapsed();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.status, state.startedAt]);

  // Template initialisation — start workout from route state (runs once on mount)
  const hasInitializedTemplate = useRef(false);
  useEffect(() => {
    if (hasInitializedTemplate.current) return;
    const routeState = location.state as {
      templateId?: string;
      templateName?: string;
      exercises?: TemplateExercise[];
    } | null;
    if (!routeState?.exercises?.length) return;
    hasInitializedTemplate.current = true;
    startWorkout(routeState.templateId, routeState.templateName);
  }, [location.state, startWorkout]);

  // Once workout is active and came from template, add template exercises (runs once)
  const hasAddedTemplateExercises = useRef(false);
  useEffect(() => {
    if (state.status !== 'active' || hasAddedTemplateExercises.current) return;
    const routeState = location.state as {
      templateId?: string;
      templateName?: string;
      exercises?: TemplateExercise[];
    } | null;
    if (!routeState?.exercises?.length) return;
    hasAddedTemplateExercises.current = true;
    for (const ex of routeState.exercises) {
      addExercise(ex.exerciseId, ex.exerciseName, ex.restDuration);
    }
  }, [state.status, location.state, addExercise]);

  const handleAddExercise = useCallback(
    async (exercise: Exercise) => {
      if (!user) return;
      let previousSets: WorkoutSet[] | undefined;
      try {
        const lastEntry = await workoutService.getLastSetsForExercise(user.uid, exercise.id);
        previousSets = lastEntry?.sets;
      } catch (err) {
        console.error('Failed to load previous sets:', err);
      }
      addExercise(exercise.id, exercise.name, undefined, previousSets);
    },
    [addExercise, user],
  );

  const handleFinish = useCallback(() => {
    completeWorkout();
  }, [completeWorkout]);

  // Get the rest duration from the most recently added exercise (or default 90s)
  const defaultRestDuration = state.exercises.at(-1)?.restDuration ?? 90;

  const handleStartRest = useCallback(() => {
    const lastExercise = state.exercises.at(-1);
    startTimer(lastExercise?.restDuration ?? 90, lastExercise?.exerciseId ?? '');
  }, [state.exercises, startTimer]);

  const handleSaveAsTemplate = useCallback(
    async (name: string) => {
      if (!user) return;
      await templateService.createTemplate(user.uid, name, state.exercises);
    },
    [user, state.exercises],
  );

  const totalVolume = useMemo(() => {
    return workoutVolume(state.exercises);
  }, [state.exercises]);

  // IDLE STATE
  if (state.status === 'idle') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-20">
        <div className="w-full max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-6 text-zinc-600"
          >
            <path d="M6.5 6.5h11v11h-11z" />
            <path d="M6.5 6.5L12 2l5.5 4.5" />
            <path d="M6.5 17.5L12 22l5.5-4.5" />
            <line x1="2" y1="12" x2="6.5" y2="12" />
            <line x1="17.5" y1="12" x2="22" y2="12" />
          </svg>
          <h1 className="mb-2 text-2xl font-bold text-on-surface">
            Ready to Lift?
          </h1>
          <p className="mb-8 text-zinc-400">
            Start an empty workout and add exercises as you go.
          </p>
          <button
            type="button"
            onClick={() => startWorkout()}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-on-primary active:opacity-80 transition-opacity"
          >
            Start Empty Workout
          </button>
        </div>
      </div>
    );
  }

  // COMPLETING STATE
  if (state.status === 'completing') {
    return (
      <WorkoutSummary
        exercises={state.exercises}
        duration={elapsedSeconds}
        totalVolume={totalVolume}
        prsAchieved={state.prsAchieved}
        onSave={finishWorkout}
        onDiscard={cancelWorkout}
        onSaveAsTemplate={handleSaveAsTemplate}
      />
    );
  }

  // ACTIVE STATE
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-on-surface">
              {state.templateName ?? 'Active Workout'}
            </h1>
            <p className="font-mono text-sm text-zinc-400">
              {formatElapsedTime(elapsedSeconds)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {state.exercises.length > 0 && !timerState.isRunning && (
              <button
                type="button"
                onClick={handleStartRest}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 active:opacity-70 transition-opacity"
                aria-label={`Start ${defaultRestDuration}s rest timer`}
              >
                Rest {defaultRestDuration}s
              </button>
            )}
            <button
              type="button"
              onClick={handleFinish}
              className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary active:opacity-80 transition-opacity"
            >
              Finish
            </button>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex flex-col gap-4 px-4 pt-4">
        {state.exercises.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-zinc-400">No exercises added yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Tap the button below to get started.
            </p>
          </div>
        )}

        {state.exercises.map((exercise, index) => (
          <ExerciseCard
            key={`${exercise.exerciseId}-${index}`}
            exercise={exercise}
            exerciseIndex={index}
            isPR={isExercisePR(exercise.exerciseId)}
            onUpdateSet={updateSet}
            onCompleteSet={completeSet}
            onSetTypeChange={updateSetType}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveExercise={removeExercise}
            onUpdateNotes={updateNotes}
          />
        ))}

        {/* Add exercise button */}
        <button
          type="button"
          onClick={() => setShowAddExercise(true)}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700 px-6 py-4 text-base font-medium text-zinc-400 active:border-primary active:text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          Add Exercise
        </button>
      </div>

      {/* Rest Timer Bar (fixed position above bottom nav) */}
      <TimerBar
        timerState={timerState}
        onAdjust={adjustTimer}
        onSkip={skipTimer}
      />

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExercise}
        onSelect={handleAddExercise}
        onClose={() => setShowAddExercise(false)}
      />
    </div>
  );
}
