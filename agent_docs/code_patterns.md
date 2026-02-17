# Code Patterns & Style Guide

## File Naming
- Components: `PascalCase.tsx` — `SetRow.tsx`, `ActiveWorkoutView.tsx`
- Services: `camelCase.ts` — `workoutService.ts`, `prService.ts`
- Types: `camelCase.ts` — `workout.ts`, `exercise.ts`
- Pages: `PascalCase.tsx` — `Home.tsx`, `ActiveWorkout.tsx`
- Constants: `camelCase.ts` — `theme.ts`
- Contexts: `PascalCase.tsx` — `AuthContext.tsx`, `WorkoutContext.tsx`

## Import Order
```typescript
// 1. React (no `import React` needed — React 19 automatic JSX transform)
import { useState, useCallback } from 'react';

// 2. Third-party libraries
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';

// 3. Services
import { workoutService } from '@/services/workouts/workoutService';

// 4. Contexts / Hooks
import { useAuth } from '@/contexts/AuthContext';

// 5. Types
import type { Workout, WorkoutExercise } from '@/types/workout';

// 6. Components
import { SetRow } from '@/components/workout/SetRow';

// 7. Utils
import { formatWeight } from '@/utils/formatters';
```

## Component Pattern

Every component follows this structure:

```tsx
import type { WorkoutSet } from '@/types/workout';

interface SetRowProps {
  set: WorkoutSet;
  previousSet?: WorkoutSet;
  onComplete: (set: WorkoutSet) => void;
  onUpdate: (set: WorkoutSet) => void;
}

export function SetRow({ set, previousSet, onComplete, onUpdate }: SetRowProps) {
  // 1. Hooks first
  // 2. Derived state
  // 3. Handlers
  // 4. Render

  return (
    <div className="flex items-center gap-3 px-4 py-2 min-h-[44px]">
      <span className="w-8 text-center text-zinc-400 text-sm font-medium">
        {set.setNumber}
      </span>
      <input
        type="number"
        inputMode="decimal"
        className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-center text-white
                   text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
        value={set.weight || ''}
        placeholder={previousSet ? String(previousSet.weight) : '0'}
        onChange={(e) => onUpdate({ ...set, weight: Number(e.target.value) })}
      />
      <input
        type="number"
        inputMode="numeric"
        className="w-16 rounded-lg bg-zinc-800 px-3 py-2 text-center text-white
                   text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
        value={set.reps || ''}
        placeholder={previousSet ? String(previousSet.reps) : '0'}
        onChange={(e) => onUpdate({ ...set, reps: Number(e.target.value) })}
      />
      <button
        className={`w-11 h-11 rounded-full flex items-center justify-center text-lg
                    transition-colors ${
                      set.completed
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                    }`}
        onClick={() => onComplete(set)}
        aria-label={`Complete set ${set.setNumber}`}
      >
        ✓
      </button>
    </div>
  );
}
```

**Rules:**
- Named exports, not default exports (except page files if needed by router)
- Props interface defined above the component
- Tailwind classes directly on elements — never inline `style={}` attributes
- Minimum 44×44px (`min-h-[44px] min-w-[44px]`) on all interactive elements
- `inputMode="decimal"` for weight (shows decimal keyboard), `inputMode="numeric"` for reps
- `aria-label` on icon-only buttons for accessibility

## Tailwind Conventions

### Dark Mode Setup
```css
/* src/index.css */
@import "tailwindcss";

:root {
  --color-background: #1C1B1F;
  --color-surface: #2B2930;
  --color-surface-variant: #49454F;
  --color-primary: #6750A4;
  --color-on-primary: #FFFFFF;
  --color-on-background: #E6E1E5;
  --color-on-surface: #E6E1E5;
  --color-pr-gold: #FFD700;
  --color-error: #F2B8B5;
}
```

```css
/* Tailwind v4: CSS-first config via @theme block in index.css */
/* No tailwind.config.ts file — colours are registered directly: */
@theme {
  --color-background: var(--color-background);
  --color-surface: var(--color-surface);
  --color-surface-variant: var(--color-surface-variant);
  --color-primary: var(--color-primary);
  --color-on-primary: var(--color-on-primary);
  --color-on-background: var(--color-on-background);
  --color-on-surface: var(--color-on-surface);
  --color-pr-gold: var(--color-pr-gold);
  --color-error: var(--color-error);
}
/* This enables classes like bg-background, text-on-primary, etc. */
/* No dark: prefix needed — the app is dark-first via :root variables. */
```

### Common Tailwind Patterns
```tsx
// Card
<div className="rounded-xl bg-surface p-4">

// Button (primary)
<button className="rounded-lg bg-primary px-6 py-3 text-on-primary font-medium
                    min-h-[44px] active:opacity-80 transition-opacity">

// Input
<input className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white
                  placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:outline-none" />

// Chip / filter button
<button className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                    ${active ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface'}`}>

// List item row
<div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">

// Bottom navigation
<nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-zinc-800
                flex justify-around py-2 safe-bottom">
```

### Safe Areas (iPhone Notch/Home Indicator)
```css
/* src/index.css — add viewport-fit for PWA */
/* In index.html: <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */

.safe-bottom {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
.safe-top {
  padding-top: max(0.5rem, env(safe-area-inset-top));
}
```

## Service Layer Pattern

Services are the ONLY place that talks to Firestore. Components call services, never Firestore directly.

```typescript
// services/workouts/workoutService.ts
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp, doc, getDoc,
} from 'firebase/firestore';
import type { Workout, WorkoutExercise } from '@/types/workout';

function workoutsRef(userId: string) {
  return collection(db, 'users', userId, 'workouts');
}

export const workoutService = {
  async saveWorkout(userId: string, workout: Workout): Promise<string> {
    const docRef = await addDoc(workoutsRef(userId), {
      ...workout,
      completedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getWorkouts(userId: string, max = 20): Promise<Workout[]> {
    const q = query(workoutsRef(userId), orderBy('startedAt', 'desc'), limit(max));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Workout[];
  },

  async getLastSetsForExercise(
    userId: string,
    exerciseId: string,
  ): Promise<WorkoutExercise | null> {
    const q = query(workoutsRef(userId), orderBy('startedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      const workout = d.data() as Workout;
      const match = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (match) return match;
    }
    return null;
  },
};
```

**Rules:**
- Services are plain objects with async methods
- Every method is typed — parameters and return type
- Firestore references built by helper functions
- Services never hold state — pure data access + business logic

## ExerciseService Normalisation Layer

```typescript
// services/exercises/exerciseService.ts
import type { Exercise } from '@/types/exercise';
import { normaliseBuiltIn } from './normalisers';

let exerciseCache: Exercise[] | null = null;

export const exerciseService = {
  async loadExercises(): Promise<Exercise[]> {
    if (exerciseCache) return exerciseCache;

    // MVP: load from bundled JSON (pre-cached by Service Worker)
    const response = await fetch('/exercises.json');
    const raw = await response.json();
    exerciseCache = (raw as unknown[]).map(normaliseBuiltIn);

    // Post-MVP: swap to ExerciseDB API
    // const response = await fetch(EXERCISEDB_URL);
    // exerciseCache = (await response.json()).map(normaliseExerciseDB);

    return exerciseCache;
  },

  async search(queryStr: string, filters?: { bodyPart?: string; equipment?: string }): Promise<Exercise[]> {
    const exercises = await this.loadExercises();
    const q = queryStr.toLowerCase();
    return exercises.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (filters?.bodyPart && e.bodyPart !== filters.bodyPart) return false;
      if (filters?.equipment && e.equipment !== filters.equipment) return false;
      return true;
    });
  },

  async getById(id: string): Promise<Exercise | null> {
    const exercises = await this.loadExercises();
    return exercises.find((e) => e.id === id) ?? null;
  },

  async getBodyParts(): Promise<string[]> {
    const exercises = await this.loadExercises();
    return [...new Set(exercises.map((e) => e.bodyPart))].sort();
  },
};
```

## Context Pattern

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth/authService';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

## Timer Pattern (Clock-Diff Recovery)

```tsx
// contexts/TimerContext.tsx — THE key PWA-specific pattern

interface TimerState {
  isRunning: boolean;
  remaining: number;
  totalDuration: number;
  startedAt: number | null;  // Date.now() — absolute timestamp
  exerciseId: string;
}

// Inside the provider:
useEffect(() => {
  // Recover timer on tab focus / visibility change
  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && state.isRunning && state.startedAt) {
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      const remaining = Math.max(0, state.totalDuration - elapsed);
      dispatch({ type: 'SYNC_TIMER', remaining });
      if (remaining === 0) {
        dispatch({ type: 'EXPIRE' });
        playTimerSound();
      }
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, [state.isRunning, state.startedAt, state.totalDuration]);

// Normal tick interval (only runs when tab is focused)
useEffect(() => {
  if (!state.isRunning || state.remaining <= 0) return;
  const interval = setInterval(() => {
    dispatch({ type: 'TICK' });
  }, 1000);
  return () => clearInterval(interval);
}, [state.isRunning, state.remaining]);
```

## Error Handling

```tsx
async function handleSaveWorkout() {
  try {
    setLoading(true);
    await workoutService.saveWorkout(user.uid, workoutData);
    navigate('/');
  } catch (error) {
    console.error('Failed to save workout:', error);
    setError('Failed to save workout. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

- Never swallow errors silently
- Log with `console.error` (visible in Chrome DevTools)
- Show user-friendly message via toast/snackbar component
- Always reset loading state in `finally`

## Draft Persistence (localStorage)

```typescript
// utils/draftStorage.ts
const DRAFT_KEY = 'liftlog_draft_workout';
const TIMER_KEY = 'liftlog_timer_state';

export const draftStorage = {
  saveDraft(state: WorkoutState): void {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  },
  loadDraft(): WorkoutState | null {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
  },
  saveTimer(state: TimerState): void {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  },
  loadTimer(): TimerState | null {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};
```

## PR Detection (Brzycki Formula) — NO CHANGE

```typescript
// utils/calculations.ts — identical to native version
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || reps > 10) return weight;
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function setVolume(weight: number, reps: number): number {
  return weight * reps;
}
```

## TypeScript Interfaces — NO CHANGE

All types in `src/types/` are identical to the native version. Exercise, Workout, WorkoutSet, WorkoutExercise, Template, PersonalRecord, UserProfile — see the Tech Design for exact interfaces.

## Naming Conventions
- **Variables / functions:** camelCase — `workoutService`, `handleSaveWorkout`
- **Components:** PascalCase — `SetRow`, `ActiveWorkoutView`
- **Types / Interfaces:** PascalCase — `Workout`, `WorkoutSet`
- **CSS custom properties:** `--color-primary`, `--color-surface`
- **Firestore collections:** camelCase — `workouts`, `personalRecords`
- **File paths use `@/` alias** — configured in vite.config.ts `resolve.alias` + tsconfig.json `paths`
- **Environment variables:** `VITE_` prefix (required by Vite for client-side access)
