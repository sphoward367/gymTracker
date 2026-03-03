# AGENTS.md — Master Plan for LiftLog

## Project Overview
**App:** LiftLog (PWA)
**Goal:** Mobile-first gym workout tracker with fast set logging (≤15 sec/set), offline-first architecture, and PR tracking — delivered as a Progressive Web App
**Stack:** React 19 + Vite 7 / TypeScript 5.9 (strict) / Tailwind CSS 4 / Firebase JS SDK v12+ (Auth + Firestore) / vite-plugin-pwa / React Router v7
**Deploy:** Vercel (free tier) → Install via Safari "Add to Home Screen"
**Current Phase:** Phase 4 — Core Workout Logging (Day 3)

## How I Should Think
1. **Understand Intent First**: Before answering, identify what the user actually needs — a new feature, a bug fix, an architecture question, or just an explanation.
2. **Ask If Unsure**: If critical information is missing (e.g., which screen, which service), ask ONE specific clarifying question before proceeding.
3. **Plan Before Coding**: Propose a brief plan and wait for approval before implementing. If Plan mode is available, use it.
4. **Verify After Changes**: After each change, confirm the app compiles (`npm run build`), types check (`npx tsc --noEmit`), and the feature works in the browser.
5. **Explain Trade-offs**: When recommending an approach, briefly mention one alternative and why you didn't choose it.

## Plan → Execute → Verify
1. **Plan:** Outline the approach in 3–5 bullet points. Mention which files will be created or modified. Ask for approval.
2. **Execute:** Implement one feature at a time. Keep changes small and reviewable.
3. **Verify:** Run type checking and confirm the feature works in the browser. Fix any issues before moving on.

## Context & Memory
- Treat `AGENTS.md` and `agent_docs/` as living documents. Update `Current State` below after completing each task.
- Use tool-specific config files (`CLAUDE.md`, `.cursorrules`) for persistent project rules.
- Update commands, conventions, and constraints in these files as the project evolves.

## Architecture Rules (Non-Negotiable)

### Service Layer Pattern
Components NEVER call Firestore directly. All data access goes through the `services/` layer.
```
✅ Component → workoutService.saveWorkout() → Firestore
❌ Component → addDoc(collection(db, 'workouts'), ...)
```

### ExerciseService Normalisation Layer
All exercise data access goes through `services/exercises/exerciseService.ts`. This abstraction allows swapping the data source (bundled JSON → API) without touching any UI code.
```
✅ exerciseService.search('bench') → Exercise[]
❌ import exercises from '/exercises.json'
```

### Denormalisation Rule
Workouts store `exerciseName` alongside `exerciseId`. This ensures workout history displays correctly even if exercise IDs change when upgrading data sources.

### Type Safety
- `any` type is FORBIDDEN — use `unknown` with type guards or proper interfaces
- All function parameters and return types must be typed
- Types live in `types/` and are imported everywhere

### State Management
- React Context + useReducer for global state (auth, active workout, timer)
- No Redux, no Zustand, no MobX — not needed at this scale
- localStorage for persistence (draft workouts, timer state, preferences)

### Firebase SDK
- Use Firebase JS SDK v9+ with **modular imports** (tree-shakable)
- `import { getFirestore, collection, addDoc } from 'firebase/firestore'` — NOT `firebase.firestore()`
- Firebase instances initialised in `lib/firebase.ts` and imported from there

### PWA Rules
- Static assets cached by Service Worker (vite-plugin-pwa + Workbox)
- Firestore offline via `enablePersistence()`
- Timer uses clock-diff recovery (`Date.now()` on focus), NOT background notifications
- Draft workouts in localStorage, NOT IndexedDB

## Testing & Verification
- Follow `agent_docs/testing.md` for verification strategy
- After every feature: `npx tsc --noEmit` (type check) + test in browser (Chrome DevTools mobile emulation + real iPhone)
- If no automated tests exist for a change, describe what to test manually
- Do not move forward when verification fails

## Checkpoints & Commits
- Create a git commit after completing each Day's milestone
- Commit message format: `feat(day-N): description` or `fix: description`
- Pre-commit: run `npx tsc --noEmit` before committing — do not commit code with type errors

## Context Files
Refer to these for details (load only when needed):
- `agent_docs/tech_stack.md` — Every library, version, and configuration detail
- `agent_docs/code_patterns.md` — Code style, component patterns, service patterns, Tailwind conventions
- `agent_docs/project_brief.md` — Persistent project rules, conventions, and workflow
- `agent_docs/product_requirements.md` — Full feature list, user stories, success metrics from PRD
- `agent_docs/testing.md` — Verification strategy and commands

## What NOT To Do
- Do NOT delete files without explicit confirmation
- Do NOT modify the Firestore data model without discussing migration impact first
- Do NOT add features not in the current phase — resist scope creep
- Do NOT skip type checking for "simple" changes
- Do NOT bypass failing type checks or lint errors
- Do NOT install new npm packages without checking if an existing dependency covers the need
- Do NOT put Firestore calls in components — always go through services
- Do NOT use Firebase compat SDK (`firebase/compat/*`) — use modular v9+ imports only
- Do NOT use `any` types — ever
- Do NOT use inline styles — use Tailwind classes
- Do NOT rely on background JS execution for the timer — use clock-diff recovery

## Current State (Update This!)
**Last Updated:** 2026-03-03
**Working On:** Nothing — ready to commit
**Recently Completed:**
- 7-task sprint + reviewer audit (see below for details)
- Volume PR logic fix: detection now uses session total (sum of all completed working sets) instead of single-set weight×reps. Fires once when running total first exceeds stored maxVolume. finishWorkout saves true final session total at save time, not the value captured when PR first fired. WorkoutSummary volume PR display updated to show session totals (e.g. 500 kg → 1500 kg).
- Template draft UX fix: Home.tsx now redirects to /templates/new on mount if an unsaved draft exists (name or exercises non-empty). CreateTemplate.tsx back button shows "Discard?" confirmation on first tap (clears draft + navigates home on second tap; resets if user edits). Unmount-save added via refs so draft is captured even if user navigates away within the 400ms debounce window.

**7-task sprint summary:** volume PRs, Smith Machine equipment option, set placeholders (last used weights/reps), responsive header UI, template draft persistence, exercise favourites + usage-count sort, iOS input zoom fix. Reviewer audit resolved 14 warnings. New files: templateDraftStorage.ts, userExerciseStatsService.ts. Modified: workout.ts, prService.ts, WorkoutContext.tsx, draftStorage.ts, workoutService.ts, index.css, WorkoutSummary.tsx, SetRow.tsx, ExerciseCard.tsx, ActiveWorkout.tsx, CreateTemplate.tsx, ExerciseList.tsx, ExerciseLibrary.tsx, AddExerciseModal.tsx, CreateExerciseForm.tsx, Home.tsx. TSC: 0 errors.
**Blocked By:** Nothing

## Roadmap

### Phase 1: Foundation (Day 1 — Morning) ✅
- [x] Create Vite + React + TypeScript project
- [x] Install and configure Tailwind CSS
- [x] Install and configure vite-plugin-pwa
- [x] Install Firebase JS SDK + React Router
- [x] Create `lib/firebase.ts` with Firestore persistence enabled
- [x] Create project folder structure (pages, components, services, contexts, types, utils)
- [x] Create all TypeScript type files (exercise.ts, workout.ts, user.ts)
- [x] Create theme/design tokens (Tailwind v4 @theme block — dark mode colours)

### Phase 2: Authentication + Navigation (Day 1 — Afternoon)
**Code: COMPLETE** | **Manual tasks: INCOMPLETE**

- [x] Create AuthContext + authService (Firebase JS SDK v12 modular)
- [x] Build login/signup pages (with user-friendly error mapping via authErrors utility)
- [x] Create root App.tsx with React Router v7 + AuthGate/PublicRoute wrappers
- [x] Create bottom navigation (BottomNav component with SVG icons)
- [x] Create placeholder tab pages (Home, Workout, History, Profile)
- [x] Write Firestore Security Rules (owner-only, field validation, default deny)
- [x] Create firebase.json config
- [x] Fix deprecated `enableIndexedDbPersistence` → `initializeFirestore` + `persistentLocalCache`
- [x] Patch .gitignore (added .env and .env.* patterns)
- [x] Set up pre-commit hook (runs `npx tsc --noEmit` before every commit)
- [x] Security review completed (error enumeration fix, CSP recommendations noted for Phase 7)
- [x] Architecture review completed (doc version mismatches fixed across AGENTS.md, tech_stack.md, code_patterns.md, CLAUDE.md)
- [x] `npx tsc --noEmit` passes with zero errors
- [x] **MANUAL:** Deploy Firestore rules (`firebase deploy --only firestore:rules`)
- [x] **MANUAL:** Deploy to Vercel (`vercel --prod`) and verify it works
- [x] **MANUAL:** Test on iPhone Safari: Add to Home Screen → verify standalone mode
- [x] **MANUAL:** Git commit: `feat(day-1): project setup + auth + navigation + PWA`

### Phase 3: Exercise Database (Day 2)
- [x] Download and bundle free-exercise-db as `public/exercises.json`
- [x] Create ExerciseService with normalisation layer
- [x] Build searchable exercise list (search bar + filter chips + virtualised list)
- [x] Build exercise detail page
- [x] Add custom exercise creation form (save to Firestore)
- [x] Verify: search exercises → filter → create custom → appears in list
- [x] **MANUAL:** Git commit: `feat(day-2): exercise library + search + custom exercises`

### Phase 4: Core Workout Logging (Day 3)
- [x] Build WorkoutContext (useReducer for active workout state, including live PR tracking)
- [x] Build workoutService (save, fetch history, get last sets + notes for exercise)
- [x] Build Active Workout page with ExerciseCard + SetRow components
- [x] Implement one-tap set completion with auto-fill from previous session
- [x] Implement set type selection UI on SetRow (working/warmup/dropset/failure chip)
- [x] Implement per-exercise notes (icon on ExerciseCard → text input; show previous note when exercise is added)
- [x] Calculate and store `totalVolume` on workout completion (excludes warmup sets)
- [x] Implement live PR detection — compare each completed set against personalRecords, accumulate `prsAchieved` in WorkoutContext
- [x] Show subtle PR indicator on ExerciseCard when mid-workout PR is detected
- [x] Implement draft persistence to localStorage (crash recovery)
- [ ] Verify: start workout → add exercises → log sets ≤15 sec each → set types work → notes save → volume calculated → PRs detected live → finish → saved to Firestore
- [ ] Git commit: `feat(day-3): core workout logging`

### Phase 5: Templates + Rest Timer (Day 4) ✅
- [x] Build templateService (CRUD)
- [x] "Save as Template" flow after workout completion
- [x] "Start from Template" flow on home page
- [x] Build TimerContext with clock-diff recovery (visibilitychange event)
- [x] Manual rest timer button (user-activated, not auto-start)
- [x] Timer UI bar with -15s / Skip / +15s buttons
- [x] Audio alert when timer expires (if tab is focused)
- [ ] Verify: save template → start from template → timer works → timer recovers after tab switch
- [ ] Git commit: `feat(day-4): templates + rest timer`

### Phase 6: History + PR Tracking (Day 5) ✅
- [x] Build workout history list (grouped by date, newest first, showing totalVolume)
- [x] Build workout detail page (exercises + sets + notes + set types)
- [x] Build per-exercise history view (includes notes from past sessions)
- [x] Build prService (getPersonalRecord single-record lookup added)
- [x] PR persistence — update personalRecords on workout completion using `prsAchieved` from WorkoutContext
- [x] PRBadge component (celebration UI)
- [x] PR celebration summary on workout completion screen (list all PRs from the session)
- [x] Display PRs in history and exercise detail
- [x] Volume display in history list and workout detail (totalVolume per session)
- [x] formatters.ts utility (formatDate, formatDateGroup, formatDuration, formatVolume, formatWeight)
- [ ] Verify: heavier weight → PR detected live during workout → badge shown on completion → visible in history → volume displayed
- [ ] Git commit: `feat(day-5): workout history + PR tracking + volume`

### Phase 7: Polish + Offline Testing (Day 6)
- [x] Dark mode consistency audit (text-error tokens, no bare text-red-400 in components)
- [x] Empty states for all lists (all pages covered)
- [x] Loading states for all async operations (all async pages covered)
- [x] Error boundary component (sanitised error messages, wraps entire app)
- [x] SyncStatus indicator (fixed offline banner, race-condition safe hook)
- [x] Format utilities (weight, date, duration, volume) — done in Phase 6
- [ ] Airplane mode full test (start workout → log → complete → reconnect → verify sync)
- [ ] Draft recovery test (refresh page mid-workout → resume)
- [ ] Timer recovery test (switch tabs → come back → correct time shown)
- [ ] Test on real iPhone via Vercel URL
- [ ] Git commit: `feat(day-6): polish + offline verification`

### Phase 8: Deploy + Real-World Test (Day 7)
- [ ] Final Vercel deploy
- [ ] Install PWA on iPhone (Add to Home Screen)
- [ ] Complete a real gym workout using only LiftLog
- [ ] Fix any issues from real-world test
- [ ] Create PWA icons (192x192, 512x512)
- [ ] Verify manifest.json, splash screen, standalone mode
- [ ] Git commit + tag: `feat(day-7): production deploy + first workout` → `v0.1.0-mvp`

### Phase 9: Progress Charts + Body Weight Logging
Context
The app tracks workout volume and PRs but has no visual trend data. Users want to see whether they're getting stronger and lighter over time. This phase adds:

Daily body weight logging on the Profile page with a 30-day trend chart
Per-exercise progress charts on ExerciseDetail (estimated 1RM over time, volume per session)
All chart data is derived from Firestore data that already exists (workoutService.getExerciseHistory) or from a new lightweight subcollection (bodyWeight). No Firestore security rule changes are needed — the existing match /users/{userId}/{document=**} catch-all covers the new subcollection.

Implementation Plan
Step 1 — Install Recharts

cd liftlog && npm install recharts
Recharts v2 ships its own TypeScript types. No @types/recharts needed. SVG-based — no iOS Canvas issues.

Step 2 — Add BodyWeightEntry type
File: liftlog/src/types/user.ts

Append after UserProfile:


export interface BodyWeightEntry {
  /** ISO date string "YYYY-MM-DD" — also used as Firestore document ID */
  date: string;
  weight: number;
  userId: string;
  loggedAt: Timestamp | Date;
}
Note: Timestamp import already exists in user.ts — no new import needed.

Step 3 — Add formatShortDate formatter
File: liftlog/src/utils/formatters.ts

Append at end of file:


/** Compact chart axis label — always "D Mon", never "Today"/"Yesterday". */
export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  return `${day} ${month}`;
}
Step 4 — Create bodyWeightService.ts (new file + new directory)
File: liftlog/src/services/bodyWeight/bodyWeightService.ts

Pattern: follows existing workoutService.ts (private collection ref helper + isXxxData type guard + exported plain object of async methods).

Key design decisions:

Doc ID = YYYY-MM-DD using local date parts (not .toISOString() which is UTC — would shift the day for UTC+ users)
setDoc (not addDoc) → same-day re-log overwrites rather than duplicates
orderBy('loggedAt', 'desc') + .reverse() returns chronological order for chart rendering
isBodyWeightData guard excludes date field (stored as document ID, not inside the doc)
Methods:

logWeight(userId, weight, date?) — upserts today's or a given day's weight
getHistory(userId, max = 30) — returns entries oldest-first for chart rendering
Step 5 — Create ExerciseCharts.tsx (new file + new directory)
File: liftlog/src/components/charts/ExerciseCharts.tsx

Props: { history: ExerciseHistoryEntry[] }

Derives all data from the prop (no Firestore calls). Two tabs: Est. 1RM | Volume

Chart data derivation:

1RM points: For each session, filter completed non-warmup sets → find max estimatedOneRepMax(weight, reps) — reuses existing calculations.ts function
Volume points: For each session, sum weight × reps for completed non-warmup sets
Renders < 2 sessions empty state: "Log this exercise at least twice to see progress charts."

Recharts components used: ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid

Important: The chart wrapper needs style={{ height: 200 }} (one acceptable inline style — ResponsiveContainer reads offsetHeight directly and cannot use Tailwind h-* classes).

Chart colors use hardcoded hex (#6366f1 = indigo-500 ≈ primary, #3f3f46 = zinc-700 for grid, #a1a1aa = zinc-400 for ticks) — CSS custom properties cannot be used in SVG attributes.

Tab buttons: min-h-[44px], flex-1, active state uses border-b-2 border-primary text-primary.

Step 6 — Create BodyWeightCard.tsx (new file + new directory)
File: liftlog/src/components/progress/BodyWeightCard.tsx

Props: { userId: string }

Self-contained card that owns all async state (loading, saving, error, history, inputValue). Profile.tsx stays thin.

Key behaviours:

On mount: loads 30-day history, pre-fills input with today's existing entry if found
Input: type="number" inputMode="decimal" (raises numeric keyboard on iOS)
Validation: isFinite(weight) && weight > 0 && weight <= 500
On log: calls bodyWeightService.logWeight(), then refreshes history
Chart only shown when history.length >= 2; otherwise shows 1-liner prompt
loadHistory wrapped in useCallback([userId]) so it can be called both from useEffect and after a successful save
Parses YYYY-MM-DD doc ID back to local Date with new Date(year, month-1, day) constructor (not new Date('YYYY-MM-DD') which is UTC)
YAxis domain={['auto', 'auto']} — zooms to actual weight range, makes small changes visible
Chart wrapper: style={{ height: 180 }}
Step 7 — Modify ExerciseDetail.tsx
File: liftlog/src/pages/ExerciseDetail.tsx

Two changes:

Increase history max: Change getExerciseHistory(user.uid, id, 10) → getExerciseHistory(user.uid, id, 20)
Add charts: Import ExerciseCharts and insert <ExerciseCharts history={history} /> between <ExerciseDetailView /> and the {/* PR Section */} block
New JSX order: exercise detail info → charts → current PR → full session history list

Step 8 — Modify Profile.tsx
File: liftlog/src/pages/Profile.tsx

Import BodyWeightCard. Add inside the existing <div className="px-6">:


{user && (
  <div className="mt-6">
    <BodyWeightCard userId={user.uid} />
  </div>
)}
Place between the email paragraph and the Sign Out button. Guard with user && so card only renders when authenticated.

Step 9 — Update AGENTS.md
File: AGENTS.md

Add Phase 9 task checklist in the Roadmap (after Phase 8 or Post-MVP section)
Remove "Body weight logging" and "Progress charts" bullets from Post-MVP (now covered by Phase 9)
Update Current State section
Verification
Type check

npx tsc --noEmit
Zero errors required before commit. Watch for:

Recharts Tooltip formatter: cast value explicitly as number ((value: number) => ...)
import type required for type-only imports (strict verbatimModuleSyntax)
No unused imports (strict noUnusedLocals)
Manual tests
Body weight: Profile → enter 85.5 → Log → chart appears. Log again same day → no duplicate point. Enter abc → validation error shown. Navigate away + return → today's value pre-filled.
Exercise charts: ExerciseDetail on exercise with 1 session → placeholder text shown. After 2nd workout → line chart renders. Tab switch 1RM ↔ Volume → chart updates. Touch data point → tooltip shows.
Warmup exclusion: Exercise logged with only warmup sets → volume shows 0 for that session; 1RM chart filters that session entirely.
Offline: Airplane mode → log body weight → reconnect → entry syncs to Firestore.

### Post-MVP (Week 2–3)
- [ ] Progress charts (Chart.js or Recharts) — volume over time graph using stored totalVolume
- [ ] Streak system + calendar heatmap
- [ ] Body weight logging
- [ ] Supersets
- [ ] Unit switching (kg ↔ lbs)
