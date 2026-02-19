import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { TimerState } from '@/types/timer';
import { draftStorage } from '@/utils/draftStorage';

export type { TimerState };

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface TimerContextType {
  timerState: TimerState;
  startTimer: (durationSeconds: number, exerciseId: string) => void;
  adjustTimer: (deltaSeconds: number) => void;
  skipTimer: () => void;
  isTimerActive: () => boolean;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialTimerState: TimerState = {
  isRunning: false,
  remaining: 0,
  totalDuration: 90,
  startedAt: null,
  exerciseId: '',
};

// ---------------------------------------------------------------------------
// Audio helper
// ---------------------------------------------------------------------------

function playTimerSound(): void {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
    // Close the AudioContext after the sound finishes to avoid leaking resources
    oscillator.onended = () => {
      void ctx.close();
    };
  } catch {
    // Audio not supported — fail silently
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TimerContext = createContext<TimerContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    // Load persisted timer state on mount
    const saved = draftStorage.loadTimer();
    if (saved && saved.isRunning && saved.startedAt !== null) {
      const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
      const remaining = Math.max(0, saved.totalDuration - elapsed);
      if (remaining === 0) {
        // Timer already expired while tab was away
        return { ...saved, isRunning: false, remaining: 0 };
      }
      return { ...saved, remaining };
    }
    return saved ?? initialTimerState;
  });

  // Keep a ref for use inside effects/event handlers without stale closure issues
  const timerStateRef = useRef<TimerState>(timerState);
  timerStateRef.current = timerState;

  // Persist to localStorage whenever state changes
  useEffect(() => {
    draftStorage.saveTimer(timerState);
  }, [timerState]);

  // Clock-diff recovery on visibilitychange (PWA-safe: JS may pause on iOS)
  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState !== 'visible') return;

      const state = timerStateRef.current;
      if (!state.isRunning || state.startedAt === null) return;

      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      const remaining = Math.max(0, state.totalDuration - elapsed);

      if (remaining === 0) {
        playTimerSound();
        setTimerState((prev) => ({ ...prev, isRunning: false, remaining: 0 }));
      } else {
        setTimerState((prev) => ({ ...prev, remaining }));
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Normal 1-second tick
  useEffect(() => {
    if (!timerState.isRunning || timerState.remaining <= 0) return;

    const intervalId = setInterval(() => {
      setTimerState((prev) => {
        if (!prev.isRunning || prev.remaining <= 0) return prev;

        const newRemaining = prev.remaining - 1;

        if (newRemaining === 0) {
          if (document.visibilityState === 'visible') {
            playTimerSound();
          }
          return { ...prev, remaining: 0, isRunning: false };
        }

        return { ...prev, remaining: newRemaining };
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timerState.isRunning, timerState.remaining]);

  // -- Action implementations ------------------------------------------------

  function startTimer(durationSeconds: number, exerciseId: string): void {
    const newState: TimerState = {
      isRunning: true,
      remaining: durationSeconds,
      totalDuration: durationSeconds,
      startedAt: Date.now(),
      exerciseId,
    };
    setTimerState(newState);
  }

  function adjustTimer(deltaSeconds: number): void {
    setTimerState((prev) => {
      const newRemaining = Math.max(
        0,
        Math.min(prev.totalDuration, prev.remaining + deltaSeconds),
      );

      // Re-start timer if it had reached 0 and we're adding time
      const wasExpired = prev.remaining === 0 && deltaSeconds > 0;
      const newIsRunning = wasExpired ? true : prev.isRunning;

      // Keep clock-diff accurate: startedAt is the moment when the timer
      // "would have started" given the current remaining time.
      const newStartedAt =
        newIsRunning
          ? Date.now() - (prev.totalDuration - newRemaining) * 1000
          : prev.startedAt;

      return {
        ...prev,
        remaining: newRemaining,
        isRunning: newIsRunning,
        startedAt: newStartedAt,
      };
    });
  }

  function skipTimer(): void {
    setTimerState((prev) => ({ ...prev, isRunning: false, remaining: 0 }));
  }

  function isTimerActive(): boolean {
    return timerStateRef.current.isRunning && timerStateRef.current.remaining > 0;
  }

  // -- Render ----------------------------------------------------------------

  const value: TimerContextType = {
    timerState,
    startTimer,
    adjustTimer,
    skipTimer,
    isTimerActive,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTimer(): TimerContextType {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
