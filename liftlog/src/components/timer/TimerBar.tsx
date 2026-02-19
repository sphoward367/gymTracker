import type React from 'react';
import type { TimerState } from '@/contexts/TimerContext';

interface TimerBarProps {
  timerState: TimerState;
  onAdjust: (deltaSeconds: number) => void;
  onSkip: () => void;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TimerBar({ timerState, onAdjust, onSkip }: TimerBarProps) {
  if (!timerState.isRunning) {
    return null;
  }

  const progress =
    timerState.totalDuration > 0
      ? timerState.remaining / timerState.totalDuration
      : 0;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-zinc-700 bg-surface">
      <div className="flex min-h-[64px] items-center gap-2 px-4">
        {/* -15s button */}
        <button
          type="button"
          onClick={() => onAdjust(-15)}
          aria-label="Subtract 15 seconds"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 active:opacity-70 transition-opacity"
        >
          −15s
        </button>

        {/* Timer display */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Rest Timer
          </p>
          <p className="font-mono text-xl font-bold text-on-surface">
            {formatCountdown(timerState.remaining)}
          </p>
          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ '--timer-progress': `${Math.round(progress * 100)}%`, width: 'var(--timer-progress)' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* +15s button */}
        <button
          type="button"
          onClick={() => onAdjust(15)}
          aria-label="Add 15 seconds"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 active:opacity-70 transition-opacity"
        >
          +15s
        </button>

        {/* Skip button */}
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip rest timer"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-sm text-zinc-400 active:opacity-70 transition-opacity"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
