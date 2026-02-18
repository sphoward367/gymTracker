import type { Exercise } from '@/types/exercise';

interface ExerciseDetailViewProps {
  exercise: Exercise;
}

export function ExerciseDetailView({ exercise }: ExerciseDetailViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Images section */}
      {exercise.images.length > 0 && (
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Demonstration
          </h2>
          <div className="flex gap-3 overflow-x-auto">
            {exercise.images.map((imagePath, index) => (
              <div
                key={imagePath}
                className="flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-lg bg-surface-variant"
              >
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs">Image {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise info card */}
      <div className="rounded-xl bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Details
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Body Part</span>
            <span className="rounded-full bg-surface-variant px-3 py-1 text-sm font-medium text-on-surface">
              {exercise.bodyPart}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Target Muscle</span>
            <span className="rounded-full bg-surface-variant px-3 py-1 text-sm font-medium text-on-surface">
              {exercise.target}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Equipment</span>
            <span className="rounded-full bg-surface-variant px-3 py-1 text-sm font-medium text-on-surface">
              {exercise.equipment}
            </span>
          </div>
          {exercise.isCustom && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Type</span>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                Custom
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary muscles */}
      {exercise.secondaryMuscles.length > 0 && (
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Secondary Muscles
          </h2>
          <div className="flex flex-wrap gap-2">
            {exercise.secondaryMuscles.map((muscle) => (
              <span
                key={muscle}
                className="rounded-full bg-surface-variant px-3 py-1.5 text-sm text-on-surface"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {exercise.instructions.length > 0 && (
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Instructions
          </h2>
          <ol className="flex flex-col gap-3">
            {exercise.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-on-surface/80">
                  {instruction}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
