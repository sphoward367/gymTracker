import { useRef, useState, useEffect, useCallback } from 'react';

import type { Exercise } from '@/types/exercise';

interface ExerciseListProps {
  exercises: Exercise[];
  loading: boolean;
  onExercisePress: (exercise: Exercise) => void;
}

const ROW_HEIGHT = 64;
const BUFFER_ROWS = 10;

export function ExerciseList({
  exercises,
  loading,
  onExercisePress,
}: ExerciseListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      setScrollTop(container.scrollTop);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-600"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-zinc-400">No exercises found</p>
        <p className="text-sm text-zinc-500">Try a different search or filter</p>
      </div>
    );
  }

  const totalHeight = exercises.length * ROW_HEIGHT;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS,
  );
  const visibleCount =
    Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS * 2;
  const endIndex = Math.min(exercises.length, startIndex + visibleCount);
  const visibleExercises = exercises.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {/* Inline styles required for virtualised list — dynamic pixel offsets cannot be expressed via Tailwind */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleExercises.map((exercise, i) => {
          const index = startIndex + i;
          return (
            <button
              key={exercise.id}
              onClick={() => onExercisePress(exercise)}
              className="absolute left-0 right-0 flex items-center gap-3 border-b border-zinc-800/50 px-4 min-h-[44px] text-left active:bg-surface-variant/50 transition-colors"
              style={{
                top: index * ROW_HEIGHT,
                height: ROW_HEIGHT,
              }}
            >
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                <span className="truncate text-sm font-medium text-on-surface">
                  {exercise.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-surface-variant px-2 py-0.5 text-xs text-zinc-400">
                    {exercise.bodyPart}
                  </span>
                  <span className="rounded bg-surface-variant px-2 py-0.5 text-xs text-zinc-400">
                    {exercise.equipment}
                  </span>
                  {exercise.isCustom && (
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      Custom
                    </span>
                  )}
                </div>
              </div>
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
                className="flex-shrink-0 text-zinc-600"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
