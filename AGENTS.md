# AGENTS.md — Master Plan for LiftLog

## Project Overview
**App:** LiftLog (PWA)
**Goal:** Mobile-first gym workout tracker with fast set logging (≤15 sec/set), offline-first architecture, and PR tracking — delivered as a Progressive Web App
**Stack:** React 19 + Vite 7 / TypeScript 5.9 (strict) / Tailwind CSS 4 / Firebase JS SDK v12+ (Auth + Firestore) / vite-plugin-pwa / React Router v7
**Deploy:** Vercel (free tier) → Install via Safari "Add to Home Screen"
**Current Phase:** Phase 2 — Exercise Database (Day 2)

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
**Last Updated:** 2026-02-17
**Working On:** Phase 2 wrap-up — manual tasks remaining before moving to Phase 3
**Recently Completed:** Phase 2 — Authentication + Navigation (authService, AuthContext, Login/Signup, Router, BottomNav, Firestore rules, security review, pre-commit hook)
**Blocked By:** Manual tasks: `firebase deploy --only firestore:rules`, `vercel --prod`, iPhone Safari Add to Home Screen test, git commit

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
- [x] Security review completed (error enumeration fix, CSP recommendations noted for Phase 6)
- [x] Architecture review completed (doc version mismatches fixed across AGENTS.md, tech_stack.md, code_patterns.md, CLAUDE.md)
- [x] `npx tsc --noEmit` passes with zero errors
- [ ] **MANUAL:** Deploy Firestore rules (`firebase deploy --only firestore:rules`)
- [ ] **MANUAL:** Deploy to Vercel (`vercel --prod`) and verify it works
- [ ] **MANUAL:** Test on iPhone Safari: Add to Home Screen → verify standalone mode
- [ ] **MANUAL:** Git commit: `feat(day-1): project setup + auth + navigation + PWA`

### Phase 2: Exercise Database (Day 2)
- [ ] Download and bundle free-exercise-db as `public/exercises.json`
- [ ] Create ExerciseService with normalisation layer
- [ ] Build searchable exercise list (search bar + filter chips + virtualised list)
- [ ] Build exercise detail page
- [ ] Add custom exercise creation form (save to Firestore)
- [ ] Verify: search exercises → filter → create custom → appears in list
- [ ] Git commit: `feat(day-2): exercise library + search + custom exercises`

### Phase 3: Core Workout Logging (Day 3)
- [ ] Build WorkoutContext (useReducer for active workout state, including live PR tracking)
- [ ] Build workoutService (save, fetch history, get last sets + notes for exercise)
- [ ] Build Active Workout page with ExerciseCard + SetRow components
- [ ] Implement one-tap set completion with auto-fill from previous session
- [ ] Implement set type selection UI on SetRow (working/warmup/dropset/failure chip)
- [ ] Implement per-exercise notes (icon on ExerciseCard → text input; show previous note when exercise is added)
- [ ] Calculate and store `totalVolume` on workout completion (excludes warmup sets)
- [ ] Implement live PR detection — compare each completed set against personalRecords, accumulate `prsAchieved` in WorkoutContext
- [ ] Show subtle PR indicator on ExerciseCard when mid-workout PR is detected
- [ ] Implement draft persistence to localStorage (crash recovery)
- [ ] Verify: start workout → add exercises → log sets ≤15 sec each → set types work → notes save → volume calculated → PRs detected live → finish → saved to Firestore
- [ ] Git commit: `feat(day-3): core workout logging`

### Phase 4: Templates + Rest Timer (Day 4)
- [ ] Build templateService (CRUD)
- [ ] "Save as Template" flow after workout completion
- [ ] "Start from Template" flow on home page
- [ ] Build TimerContext with clock-diff recovery (visibilitychange event)
- [ ] Auto-start timer on set completion
- [ ] Timer UI bar with -15s / Skip / +15s buttons
- [ ] Audio alert when timer expires (if tab is focused)
- [ ] Verify: save template → start from template → timer works → timer recovers after tab switch
- [ ] Git commit: `feat(day-4): templates + rest timer`

### Phase 5: History + PR Tracking (Day 5)
- [ ] Build workout history list (grouped by date, newest first, showing totalVolume)
- [ ] Build workout detail page (exercises + sets + notes + set types)
- [ ] Build per-exercise history view (includes notes from past sessions)
- [ ] Build prService (PR detection: max weight, estimated 1RM via Brzycki, excludes warmup sets)
- [ ] PR persistence — update personalRecords on workout completion using `prsAchieved` from WorkoutContext
- [ ] PRBadge component (celebration UI)
- [ ] PR celebration summary on workout completion screen (list all PRs from the session)
- [ ] Display PRs in history and exercise detail
- [ ] Volume display in history list and workout detail (totalVolume per session)
- [ ] Verify: heavier weight → PR detected live during workout → badge shown on completion → visible in history → volume displayed
- [ ] Git commit: `feat(day-5): workout history + PR tracking + volume`

### Phase 6: Polish + Offline Testing (Day 6)
- [ ] Dark mode consistency audit
- [ ] Empty states for all lists
- [ ] Loading states for all async operations
- [ ] Error boundary component
- [ ] SyncStatus indicator
- [ ] Format utilities (weight, date, duration, volume)
- [ ] Airplane mode full test (start workout → log → complete → reconnect → verify sync)
- [ ] Draft recovery test (refresh page mid-workout → resume)
- [ ] Timer recovery test (switch tabs → come back → correct time shown)
- [ ] Test on real iPhone via Vercel URL
- [ ] Git commit: `feat(day-6): polish + offline verification`

### Phase 7: Deploy + Real-World Test (Day 7)
- [ ] Final Vercel deploy
- [ ] Install PWA on iPhone (Add to Home Screen)
- [ ] Complete a real gym workout using only LiftLog
- [ ] Fix any issues from real-world test
- [ ] Create PWA icons (192x192, 512x512)
- [ ] Verify manifest.json, splash screen, standalone mode
- [ ] Git commit + tag: `feat(day-7): production deploy + first workout` → `v0.1.0-mvp`

### Post-MVP (Week 2–3)
- [ ] Progress charts (Chart.js or Recharts) — volume over time graph using stored totalVolume
- [ ] Streak system + calendar heatmap
- [ ] Body weight logging
- [ ] Supersets
- [ ] Unit switching (kg ↔ lbs)
