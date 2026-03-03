import { useState, useCallback } from 'react';

import type { WorkoutExercise, WorkoutPR } from '@/types/workout';

interface WorkoutSummaryProps {
  exercises: WorkoutExercise[];
  duration: number; // seconds
  totalVolume: number;
  prsAchieved: WorkoutPR[];
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onSaveAsTemplate?: (name: string) => Promise<void>;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${Math.round(volume)} kg`;
}

export function WorkoutSummary({
  exercises,
  duration,
  totalVolume,
  prsAchieved,
  onSave,
  onDiscard,
  onSaveAsTemplate,
}: WorkoutSummaryProps) {
  const [saving, setSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Save as template state
  const [templateName, setTemplateName] = useState('');
  const [showTemplateSave, setShowTemplateSave] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const totalSetsCompleted = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0,
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave();
    } catch (err) {
      console.error('Failed to save workout:', err);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  const handleDiscard = useCallback(() => {
    if (!showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    onDiscard();
  }, [showDiscardConfirm, onDiscard]);

  const handleSaveTemplate = useCallback(async () => {
    if (!templateName.trim() || !onSaveAsTemplate) return;
    setSavingTemplate(true);
    try {
      await onSaveAsTemplate(templateName.trim());
      setTemplateSaved(true);
      setShowTemplateSave(false);
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSavingTemplate(false);
    }
  }, [templateName, onSaveAsTemplate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <h1 className="mb-8 text-center text-3xl font-bold text-on-surface">
          Workout Complete!
        </h1>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Duration */}
          <div className="rounded-xl bg-surface p-4 text-center">
            <p className="text-sm text-zinc-400">Duration</p>
            <p className="mt-1 text-xl font-bold text-on-surface">
              {formatDuration(duration)}
            </p>
          </div>

          {/* Volume */}
          <div className="rounded-xl bg-surface p-4 text-center">
            <p className="text-sm text-zinc-400">Volume</p>
            <p className="mt-1 text-xl font-bold text-on-surface">
              {formatVolume(totalVolume)}
            </p>
          </div>

          {/* Exercises */}
          <div className="rounded-xl bg-surface p-4 text-center">
            <p className="text-sm text-zinc-400">Exercises</p>
            <p className="mt-1 text-xl font-bold text-on-surface">
              {exercises.length}
            </p>
          </div>

          {/* Sets completed */}
          <div className="rounded-xl bg-surface p-4 text-center">
            <p className="text-sm text-zinc-400">Sets</p>
            <p className="mt-1 text-xl font-bold text-on-surface">
              {totalSetsCompleted}
            </p>
          </div>
        </div>

        {/* PR celebration */}
        {prsAchieved.length > 0 && (
          <div className="mb-6 rounded-xl border border-pr-gold/30 bg-pr-gold/10 p-4">
            <div className="mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                className="text-pr-gold"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h2 className="text-lg font-bold text-pr-gold">
                Personal Records!
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {prsAchieved.map((pr, index) =>
                pr.prType === 'weight' ? (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-zinc-500 shrink-0">WT</span>
                      <span className="truncate text-sm font-medium text-on-surface">{pr.exerciseName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm shrink-0 ml-2">
                      <span className="text-zinc-400 line-through">{pr.previousWeight}kg</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-pr-gold"
                      >
                        <polyline points="7 17 17 7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                      <span className="font-bold text-pr-gold">{pr.newWeight}kg &times; {pr.reps}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-blue-400 shrink-0">VOL</span>
                      <span className="truncate text-sm font-medium text-on-surface">{pr.exerciseName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm shrink-0 ml-2">
                      <span className="text-zinc-400">{Math.round(pr.previousVolume)} kg</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-pr-gold"
                      >
                        <polyline points="7 17 17 7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                      <span className="font-bold text-pr-gold">{Math.round(pr.newVolume)} kg</span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Save as Template section */}
        {onSaveAsTemplate && !templateSaved && (
          <div className="mb-4 rounded-xl bg-surface p-4">
            {!showTemplateSave ? (
              <button
                type="button"
                onClick={() => setShowTemplateSave(true)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 active:opacity-70 transition-opacity"
              >
                {/* Bookmark icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Save as Template
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-on-surface">
                  Template Name
                </p>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Push Day"
                  maxLength={200}
                  className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTemplateSave(false)}
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 active:opacity-70 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim() || savingTemplate}
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50 active:opacity-80 transition-opacity"
                  >
                    {savingTemplate ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {templateSaved && (
          <div className="mb-4 rounded-xl bg-green-900/30 p-3 text-center text-sm text-green-400">
            Template saved!
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-on-primary transition-opacity disabled:opacity-50 active:opacity-80"
          >
            {saving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
            ) : (
              'Save Workout'
            )}
          </button>

          <button
            type="button"
            onClick={handleDiscard}
            className={`flex min-h-[44px] items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition-colors ${
              showDiscardConfirm
                ? 'bg-red-900/40 text-red-300'
                : 'bg-zinc-800 text-zinc-400 active:text-error'
            }`}
          >
            {showDiscardConfirm ? 'Tap again to confirm discard' : 'Discard Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
