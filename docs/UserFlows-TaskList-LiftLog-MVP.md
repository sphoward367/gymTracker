# LiftLog MVP (PWA) — User Flows & Task List

## Part A: User Flows

---

### Flow 1: First Launch & Authentication

```
OPEN APP (browser or home screen PWA)
│
├─ Has saved session? ──YES──→ Load AuthContext → HOME (Flow 6)
│
└─ No session ──→ LOGIN PAGE
                   │
                   ├─ [Tap "Sign Up"] → SIGNUP PAGE
                   │   ├─ Enter email + password + confirm password
                   │   ├─ [Tap "Create Account"]
                   │   ├─ Validate: email format, password ≥ 8 chars, passwords match
                   │   │   ├─ Validation fails → Show inline error, stay on page
                   │   │   └─ Validation passes → Call authService.signUp()
                   │   │       ├─ Firebase error → Show error toast
                   │   │       └─ Success → Create profile doc → HOME
                   │   └─ [Tap "Already have an account?"] → LOGIN PAGE
                   │
                   ├─ Enter email + password
                   ├─ [Tap "Sign In"]
                   │   ├─ Firebase error → Show error toast
                   │   └─ Success → HOME
                   │
                   └─ [Tap "Create Account"] → SIGNUP PAGE
```

---

### Flow 2: Start a Workout

```
HOME
│
├─ [Tap "Start Empty Workout"]
│   └─ Create WorkoutContext (startedAt = now, exercises = [])
│       └─ Save draft to localStorage → ACTIVE WORKOUT (Flow 3)
│
├─ [Tap a Template card]
│   └─ Load template → Pre-populate WorkoutContext
│       └─ Save draft to localStorage → ACTIVE WORKOUT (Flow 3)
│
└─ [Draft recovery on page load]
    └─ App detects draft in localStorage
        └─ Show dialog: "Resume unfinished workout from [time]?"
            ├─ [Resume] → Restore WorkoutContext → ACTIVE WORKOUT
            └─ [Discard] → Clear localStorage draft → HOME
```

---

### Flow 3: Active Workout (Core Logging Loop)

```
ACTIVE WORKOUT PAGE
│
│  Header: Elapsed timer + [Finish] button
│
├─ [Tap "+ Add Exercise"]
│   └─ EXERCISE PICKER (modal/drawer)
│       ├─ Search bar (auto-focus keyboard)
│       ├─ Body part filter chips
│       ├─ Scrollable exercise list
│       └─ [Tap exercise]
│           └─ Fetch previous session → Pre-fill sets
│               └─ Add to workout → Dismiss picker
│
├─ EXERCISE CARD (per exercise)
│   ├─ Exercise name + "Previous: 80kg × 8"
│   ├─ SET ROW (per set)
│   │   │  [Set #] [Weight input] [Reps input] [✓ Checkmark]
│   │   ├─ [Tap weight/reps] → Numeric keyboard (inputMode="decimal"/"numeric")
│   │   ├─ [Tap ✓] → Auto-fill if empty → Mark complete → Save draft → Start timer
│   │   └─ [Long press ✓] → Set type picker (Working/Warmup/Dropset/Failure)
│   ├─ [Tap "+ Add Set"] → New row
│   └─ [Swipe/tap delete] → Remove exercise (confirm)
│
├─ REST TIMER BAR (bottom, when active — Flow 4)
│
└─ [Tap "Finish"] → WORKOUT COMPLETE (Flow 5)
```

---

### Flow 4: Rest Timer (PWA — Clock-Diff)

```
SET COMPLETED (trigger)
│
└─ TimerContext starts (remaining = duration, startedAt = Date.now())
    │
    ├─ Timer bar at bottom: "Rest: 1:23"  [-15s] [Skip] [+15s]
    │
    ├─ Save timer state to localStorage
    │
    ├─ setInterval ticks every 1s (while tab is focused)
    │
    ├─ TAB GOES TO BACKGROUND / SCREEN LOCKS
    │   └─ JS pauses — no ticking, no notification
    │
    ├─ TAB REGAINS FOCUS (visibilitychange event)
    │   └─ Calculate: elapsed = (Date.now() - startedAt) / 1000
    │       ├─ remaining > 0 → Update display to correct time → Resume ticking
    │       └─ remaining ≤ 0 → Show "Rest Complete!" → Play audio alert
    │
    ├─ [Tap -15s] → Subtract 15s (min 0), recalculate startedAt
    ├─ [Tap +15s] → Add 15s, recalculate startedAt
    └─ [Tap Skip] → Cancel timer, hide bar
```

---

### Flow 5: Complete Workout + PR Detection

```
[Tap "Finish"]
│
├─ No completed sets → "No sets logged. Discard?"
│   ├─ [Discard] → Clear draft → HOME
│   └─ [Keep Going] → Back to Active Workout
│
└─ Has completed sets → SAVING...
    ├─ workoutService.saveWorkout() → Firestore (or offline queue)
    ├─ prService.checkForPRs() → Compare against personalRecords
    │   └─ New PRs found → Update Firestore PR docs
    ├─ Clear draft from localStorage
    │
    └─ WORKOUT COMPLETE PAGE
        ├─ Summary: duration, exercises, sets, volume
        ├─ PRs? → Gold PRBadge per new record
        ├─ [Save as Template] → Name dialog → Save
        └─ [Done] → HOME
```

---

### Flow 6: Home Page

```
HOME
├─ QUICK START
│   ├─ [Start Empty Workout] (primary button)
│   └─ Template cards (horizontal scroll)
│       ├─ Tap → Start from template
│       └─ Long press → Edit / Delete
├─ RECENT WORKOUTS (last 3–5)
│   ├─ Tap → Workout detail (Flow 7)
│   └─ [See All] → History page
└─ BOTTOM NAV: Home | Workout | History | Profile
```

---

### Flow 7: Workout History

```
HISTORY PAGE
├─ Workout list (grouped by date, newest first)
│   └─ [Tap row] → WORKOUT DETAIL PAGE
│       ├─ Date, duration, template name
│       ├─ Exercises + sets (with PR badges)
│       └─ [Tap exercise name] → Per-exercise history
│           ├─ All sessions for this exercise
│           ├─ Best set per session
│           └─ Current PR at top
└─ Empty: "No workouts yet. Start your first!"
```

---

### Flow 8: Exercise Library (standalone)

```
EXERCISE LIBRARY (via nav or "+ Add Exercise")
├─ Search bar + filter chips (body part, equipment)
├─ Exercise list
│   ├─ [Tap] → In workout: add + dismiss | Standalone: detail page
│   └─ Exercise detail: name, muscles, equipment, instructions, images, your PR
├─ [+ Create Custom] → Modal form → Save to Firestore
└─ Empty search: "No matches. Create custom?"
```

---

### Flow 9: Profile & Settings

```
PROFILE PAGE
├─ Display name, email
├─ Units: kg / lbs toggle
├─ Default rest timer duration
├─ [Sign Out] → Confirm → Login page
└─ App version
```

---

### Flow 10: PWA Installation

```
FIRST VISIT (Safari on iPhone)
│
├─ App loads in Safari with full browser chrome
├─ (Optional) Show a banner: "Install LiftLog for the best experience"
│
└─ User taps Safari Share button (box with arrow)
    └─ Taps "Add to Home Screen"
        └─ Names it "LiftLog" → Taps Add
            └─ Home screen icon created
                └─ Next launch: opens in standalone mode (no Safari UI)
                    └─ Full-screen PWA experience
```

---

## Part B: Detailed Task List

### How to Read This

- **ID:** Unique task identifier for dependency tracking
- **Depends on:** Which task(s) must be complete before starting this one
- **🔧 MANUAL:** Requires human action outside the codebase (browser console, device testing, account creation)
- **🤖 CODE:** Can be fully delegated to a developer or AI coding agent
- **⏱ Estimate:** Rough time in minutes for an in-between developer with AI assistance
- **Assignable:** Each task can be given to a different developer once dependencies are met

---

### Phase 0: Prerequisites & Environment

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **0.1** | Install Node.js 18+ | 🔧 MANUAL | — | 10m | nodejs.org or nvm |
| **0.2** | Install Firebase CLI | 🤖 CODE | 0.1 | 5m | `npm install -g firebase-tools` |
| **0.3** | Install Vercel CLI | 🤖 CODE | 0.1 | 3m | `npm install -g vercel` |
| **0.4** | Create Firebase project | 🔧 MANUAL | — | 10m | console.firebase.google.com → New Project → "liftlog" → disable Analytics |
| **0.4.1** | Enable Firebase Auth (email/password) | 🔧 MANUAL | 0.4 | 5m | Firebase Console → Authentication → Sign-in method → Enable Email/Password |
| **0.4.2** | Enable Cloud Firestore | 🔧 MANUAL | 0.4 | 5m | Firebase Console → Firestore → Create database → Start in test mode |
| **0.4.3** | Register web app in Firebase | 🔧 MANUAL | 0.4 | 5m | Firebase Console → Project Settings → Add App → Web → Copy config object (apiKey, authDomain, etc.) |
| **0.5** | Create Vercel account | 🔧 MANUAL | — | 5m | vercel.com → Sign up (free) |
| **0.6** | Set up Claude Code | 🔧 MANUAL | 0.1 | 5m | `npm install -g @anthropic-ai/claude-code` or use existing Claude subscription |

**No Android Studio. No Xcode. No Apple Developer account. No Expo.**

---

### Phase 1: Project Setup (Day 1 — Morning)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **1.1** | Create Vite + React + TypeScript project | 🤖 CODE | 0.1 | 5m | `npm create vite@latest liftlog -- --template react-ts && cd liftlog && npm install` |
| **1.2** | Install dependencies | 🤖 CODE | 1.1 | 5m | See subtasks |
| **1.2.1** | Install Firebase SDK | 🤖 CODE | 1.1 | 2m | `npm install firebase` |
| **1.2.2** | Install React Router | 🤖 CODE | 1.1 | 1m | `npm install react-router-dom` |
| **1.2.3** | Install Tailwind CSS | 🤖 CODE | 1.1 | 2m | `npm install -D tailwindcss @tailwindcss/vite` → add plugin to vite.config.ts → add `@import "tailwindcss"` to index.css |
| **1.2.4** | Install PWA plugin | 🤖 CODE | 1.1 | 1m | `npm install -D vite-plugin-pwa` |
| **1.3** | Configure vite.config.ts | 🤖 CODE | 1.2 | 10m | Add react, tailwindcss, VitePWA plugins. Add `@/` path alias. Configure PWA manifest (name, icons, theme_color, display: standalone). |
| **1.4** | Configure TypeScript strict mode | 🤖 CODE | 1.1 | 5m | Update tsconfig.json: `strict: true`, `noImplicitAny: true`, add `@/*` path alias. |
| **1.5** | Create .env.local with Firebase config | 🔧 MANUAL | 0.4.3, 1.1 | 5m | Create `.env.local` with `VITE_FIREBASE_*` variables from Firebase Console web app config. Add `.env.local` to `.gitignore`. |
| **1.6** | Create `lib/firebase.ts` | 🤖 CODE | 1.5, 1.2.1 | 10m | Initialise Firebase app, export `auth` and `db` instances. Call `enablePersistence(db)` for offline support. |
| **1.7** | Create project folder structure | 🤖 CODE | 1.1 | 10m | Create: `src/pages/`, `src/components/workout/`, `src/components/exercises/`, `src/components/history/`, `src/components/ui/`, `src/services/auth/`, `src/services/exercises/`, `src/services/workouts/`, `src/services/templates/`, `src/contexts/`, `src/types/`, `src/utils/`, `src/lib/`, `public/icons/` |
| **1.8** | Create TypeScript type files | 🤖 CODE | 1.7 | 15m | See subtasks |
| **1.8.1** | Create `types/exercise.ts` | 🤖 CODE | 1.7 | 5m | Exercise interface |
| **1.8.2** | Create `types/workout.ts` | 🤖 CODE | 1.7 | 5m | Workout, WorkoutSet, WorkoutExercise, Template, PersonalRecord |
| **1.8.3** | Create `types/user.ts` | 🤖 CODE | 1.7 | 5m | UserProfile interface |
| **1.9** | Set up Tailwind theme | 🤖 CODE | 1.2.3 | 10m | Create CSS custom properties in `index.css` for dark theme colours. Configure tailwind.config.ts with custom colours. Set up safe-area CSS for iPhone. |
| **1.10** | Create index.html with PWA meta tags | 🤖 CODE | 1.1 | 5m | Add `<meta name="viewport" content="..., viewport-fit=cover">`, `<meta name="theme-color" content="#1C1B1F">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<link rel="apple-touch-icon">` |
| **1.11** | Create PWA icons | 🔧 MANUAL | — | 15m | Create 192x192 and 512x512 PNG icons. Can use a simple placeholder (coloured square with "L") for MVP. Save to `public/icons/`. Also create `public/icons/apple-touch-icon.png` (180x180). |
| **1.12** | Set up git + pre-commit hook | 🤖 CODE | 1.1 | 5m | `git init`, `.gitignore` (node_modules, dist, .env.local), pre-commit hook running `npx tsc --noEmit` |
| **1.13** | Copy agent config files | 🔧 MANUAL | 1.1 | 5m | Copy `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `agent_docs/` into project root |
| **1.14** | Verify dev server | 🔧 MANUAL | 1.1–1.6 | 5m | `npm run dev` → opens browser → no errors → Firebase connected |

**Phase 1 checkpoint:** `git commit -m "feat(day-1a): project setup + Vite + Tailwind + Firebase + PWA config"`

---

### Phase 2: Authentication (Day 1 — Afternoon)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **2.1** | Create authService | 🤖 CODE | 1.6, 1.8.3 | 15m | `services/auth/authService.ts` — signUp, signIn, signOut, onAuthStateChanged. Uses Firebase JS SDK modular imports. |
| **2.2** | Create AuthContext | 🤖 CODE | 2.1 | 20m | `contexts/AuthContext.tsx` — provider + `useAuth()` hook. See `agent_docs/code_patterns.md`. |
| **2.3** | Create App.tsx with router + auth gate | 🤖 CODE | 2.2, 1.2.2 | 15m | React Router with protected routes. If no user → redirect to /login. If user → show main layout with BottomNav. |
| **2.4** | Create BottomNav component | 🤖 CODE | 1.9 | 15m | `components/ui/BottomNav.tsx` — fixed bottom bar with 4 tabs: Home, Workout, History, Profile. Active tab highlighted. Uses React Router `NavLink`. Safe area padding for iPhone home indicator. |
| **2.5** | Create login page | 🤖 CODE | 2.2, 1.9 | 20m | `pages/Login.tsx` — email input, password input, "Sign In" button, "Create Account" link. Tailwind dark theme. Validation. Error toast. |
| **2.6** | Create signup page | 🤖 CODE | 2.2, 1.9 | 20m | `pages/Signup.tsx` — email, password, confirm password. Validation. Error handling. |
| **2.7** | Create user profile on signup | 🤖 CODE | 2.1, 1.6 | 10m | After signUp, write profile doc to `users/{uid}/profile` with defaults. |
| **2.8** | Create placeholder pages | 🤖 CODE | 2.3, 2.4 | 10m | Home.tsx, ActiveWorkout.tsx, History.tsx, Profile.tsx — simple text + useAuth() to show user email. |
| **2.9** | Write Firestore Security Rules | 🤖 CODE | — | 10m | `firestore.rules` file — users read/write only their own data. |
| **2.10** | Deploy Firestore Security Rules | 🔧 MANUAL + 🤖 CODE | 0.2, 0.4.2, 2.9 | 5m | `firebase login` (opens browser), then `firebase deploy --only firestore:rules`. |
| **2.11** | Deploy to Vercel (first deploy) | 🤖 CODE + 🔧 MANUAL | 0.3, 0.5, 2.8 | 5m | `vercel` → follow prompts → get preview URL. Verify it works in browser. |
| **2.12** | Test PWA on iPhone | 🔧 MANUAL | 2.11 | 10m | Open Vercel URL on iPhone Safari → Add to Home Screen → launch → verify standalone mode, auth flow works. |
| **2.13** | Test auth flow end-to-end | 🔧 MANUAL | 2.1–2.8, 2.10 | 10m | Sign up → Firebase Console check → sign out → sign in → refresh page → still logged in → wrong password → error shown. |

**Phase 2 checkpoint:** `git commit -m "feat(day-1b): auth + routing + bottom nav + first Vercel deploy"`

---

### Phase 3: Exercise Library (Day 2)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **3.1** | Download and bundle exercise data | 🔧 MANUAL + 🤖 CODE | 1.7 | 15m | Download `exercises.json` from github.com/yuhonas/free-exercise-db `dist/`. Save as `public/exercises.json`. Verify it parses. |
| **3.2** | Create exercise normaliser | 🤖 CODE | 1.8.1, 3.1 | 15m | `services/exercises/normalisers.ts` — maps raw format → Exercise interface. |
| **3.3** | Create ExerciseService | 🤖 CODE | 3.2 | 20m | `services/exercises/exerciseService.ts` — loadExercises() (fetch from `/exercises.json` with cache), search(), getById(), getBodyParts(). |
| **3.4** | Create ExerciseList component | 🤖 CODE | 3.3, 1.9 | 25m | `components/exercises/ExerciseList.tsx` — scrollable list, renders exercise rows. Props: onSelect callback. |
| **3.5** | Create ExerciseSearch component | 🤖 CODE | 3.3 | 15m | `components/exercises/ExerciseSearch.tsx` — `<input>` search bar + horizontal scroll of filter chips. Debounced (300ms). |
| **3.6** | Create exercise library page | 🤖 CODE | 3.4, 3.5 | 15m | `pages/ExerciseLibrary.tsx` — composes search + list. |
| **3.7** | Create ExerciseDetail component | 🤖 CODE | 3.3, 1.9 | 20m | `components/exercises/ExerciseDetailView.tsx` — name, muscles, equipment, instructions. |
| **3.8** | Create exercise detail page | 🤖 CODE | 3.7 | 10m | `pages/ExerciseDetail.tsx` — route `/exercise/:id`, loads from ExerciseService. |
| **3.9** | Create custom exercise form | 🤖 CODE | 3.3, 2.2 | 25m | Modal with: name, body part select, equipment select, instructions textarea. Saves to Firestore `users/{uid}/exercises/`. |
| **3.10** | Merge custom exercises into ExerciseService | 🤖 CODE | 3.9, 3.3 | 15m | On load, fetch custom exercises from Firestore + merge with built-in. |
| **3.11** | Empty state for exercise search | 🤖 CODE | 3.4 | 5m | "No matches. Create custom?" with button. |
| **3.12** | Test exercise library | 🔧 MANUAL | 3.1–3.11 | 10m | Search, filter, create custom, verify detail page. Test offline (exercises load from Service Worker cache). |

**Phase 3 checkpoint:** `git commit -m "feat(day-2): exercise library + search + custom exercises"`

---

### Phase 4: Core Workout Logging (Day 3)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **4.1** | Create WorkoutContext | 🤖 CODE | 1.8.2 | 30m | `contexts/WorkoutContext.tsx` — useReducer: START_WORKOUT, ADD_EXERCISE, UPDATE_SET, COMPLETE_SET, REMOVE_EXERCISE, ADD_SET, FINISH_WORKOUT. `useWorkout()` hook. |
| **4.2** | Create workoutService | 🤖 CODE | 1.8.2, 1.6 | 25m | `services/workouts/workoutService.ts` — saveWorkout, getWorkouts, getLastSetsForExercise, getWorkoutById. Firebase JS SDK modular queries. |
| **4.3** | Create draft persistence utilities | 🤖 CODE | 4.1 | 10m | `utils/draftStorage.ts` — saveDraft, loadDraft, clearDraft using localStorage. WorkoutContext calls saveDraft after every dispatch. |
| **4.4** | Create draft recovery dialog | 🤖 CODE | 4.3 | 10m | On app load, check localStorage for draft → show "Resume workout?" dialog → restore or discard. |
| **4.5** | Create exercise picker (modal) | 🤖 CODE | 3.4, 3.5, 4.1 | 20m | Reuse ExerciseSearch + ExerciseList in a modal/drawer. onSelect adds exercise to WorkoutContext, dismisses. |
| **4.6** | Create SetRow component | 🤖 CODE | 1.8.2, 1.9 | 30m | `components/workout/SetRow.tsx` — row: set # | weight input (inputMode decimal) | reps input (inputMode numeric) | ✓ button. Auto-fill from previous. 44×44px touch targets. See `agent_docs/code_patterns.md` for exact pattern. |
| **4.7** | Create ExerciseCard component | 🤖 CODE | 4.6, 4.1 | 20m | `components/workout/ExerciseCard.tsx` — exercise name + previous data + SetRow list + "+ Add Set". Delete button with confirmation. |
| **4.8** | Create ActiveWorkout page | 🤖 CODE | 4.7, 4.5, 4.1 | 25m | `pages/ActiveWorkout.tsx` — elapsed timer header, exercise cards, "+ Add Exercise", "Finish" button. |
| **4.9** | Implement auto-fill from previous session | 🤖 CODE | 4.2, 4.6 | 15m | On exercise add, fetch workoutService.getLastSetsForExercise(). Pre-fill as placeholders. |
| **4.10** | Create workout completion page | 🤖 CODE | 4.2, 4.1 | 20m | Summary: duration, exercises, sets, volume. "Save as Template" + "Done" buttons. |
| **4.11** | Wire "Start Empty Workout" on home | 🤖 CODE | 4.8, 2.8 | 10m | Home page button dispatches START_WORKOUT → navigate to /workout. |
| **4.12** | Test workout logging | 🔧 MANUAL | 4.6–4.11 | 20m | Start → add exercise → log 3 sets → ≤15 sec/set → finish → in Firestore. Refresh mid-workout → draft recovery works. |

**Phase 4 checkpoint:** `git commit -m "feat(day-3): core workout logging"`

---

### Phase 5: Templates (Day 4 — Morning)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **5.1** | Create templateService | 🤖 CODE | 1.8.2, 1.6 | 15m | `services/templates/templateService.ts` — CRUD. |
| **5.2** | "Save as Template" flow | 🤖 CODE | 5.1, 4.10 | 20m | On completion page: dialog with name input → save. |
| **5.3** | Display templates on Home | 🤖 CODE | 5.1, 2.8 | 20m | Horizontal scrollable cards. Tap → start from template. |
| **5.4** | "Start from Template" flow | 🤖 CODE | 5.3, 4.1 | 15m | Load template → pre-populate WorkoutContext → navigate to /workout. |
| **5.5** | Template edit/delete | 🤖 CODE | 5.1, 5.3 | 15m | Long press / context menu → edit or delete with confirmation. |
| **5.6** | Test templates | 🔧 MANUAL | 5.1–5.5 | 10m | Save → start from → edit → delete. |

---

### Phase 6: Rest Timer (Day 4 — Afternoon)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **6.1** | Create TimerContext (clock-diff) | 🤖 CODE | — | 25m | `contexts/TimerContext.tsx` — useReducer: START_TIMER, TICK, SYNC_TIMER, ADJUST, SKIP, EXPIRE. Stores `startedAt` as `Date.now()`. Registers `visibilitychange` listener for clock-diff recovery. Persists to localStorage. |
| **6.2** | Create RestTimer component | 🤖 CODE | 6.1, 1.9 | 20m | `components/workout/RestTimer.tsx` — bottom bar with countdown, -15s/Skip/+15s. Visible when running. |
| **6.3** | Auto-start on set completion | 🤖 CODE | 6.1, 4.1 | 10m | When COMPLETE_SET dispatches, also START_TIMER with exercise rest duration. |
| **6.4** | Add timer audio alert | 🤖 CODE | 6.1 | 10m | Create or find a short "ding" sound. Play via `new Audio('/timer-done.mp3').play()` on EXPIRE (when tab is focused). Add sound file to `public/`. |
| **6.5** | Integrate RestTimer into ActiveWorkout | 🤖 CODE | 6.2, 4.8 | 5m | Render RestTimer at bottom of ActiveWorkout page. |
| **6.6** | Test timer + clock-diff | 🔧 MANUAL | 6.1–6.5 | 15m | Complete set → timer starts → switch tabs → wait → switch back → correct time shown. Timer expires while away → "Rest Complete!" + audio on return. |

**Phase 5+6 checkpoint:** `git commit -m "feat(day-4): templates + rest timer"`

---

### Phase 7: Workout History (Day 5 — Morning)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **7.1** | Create WorkoutHistoryList component | 🤖 CODE | 4.2, 1.9 | 25m | Scrollable list, grouped by date. Each row: date, template name, exercise count, duration, PR badges. |
| **7.2** | Create History page | 🤖 CODE | 7.1, 2.3 | 10m | `pages/History.tsx` — renders list. Empty state. |
| **7.3** | Create WorkoutDetailView component | 🤖 CODE | 4.2, 1.9 | 25m | Workout metadata + exercises + sets. Tappable exercise names. |
| **7.4** | Create workout detail page | 🤖 CODE | 7.3 | 10m | `pages/WorkoutDetail.tsx` — route `/workout/:id`. |
| **7.5** | Create per-exercise history | 🤖 CODE | 4.2 | 25m | Modal or page showing all sessions for one exercise. Best set, date, current PR. |
| **7.6** | Recent workouts on Home | 🤖 CODE | 7.1, 2.8 | 10m | Last 3–5 workouts on home page. "See All" → /history. |
| **7.7** | Empty states | 🤖 CODE | 7.1, 7.5 | 5m | History: "No workouts yet." Per-exercise: "First time!" |

---

### Phase 8: PR Tracking (Day 5 — Afternoon)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **8.1** | Create calculation utilities | 🤖 CODE | — | 10m | `utils/calculations.ts` — estimatedOneRepMax (Brzycki), setVolume. |
| **8.2** | Create prService | 🤖 CODE | 8.1, 1.8.2, 1.6 | 30m | `services/workouts/prService.ts` — checkForPRs, updatePR, getPR. |
| **8.3** | Integrate PR check into completion | 🤖 CODE | 8.2, 4.10 | 15m | After save, run checkForPRs. Pass results to completion page. |
| **8.4** | Create PRBadge component | 🤖 CODE | 1.9 | 15m | `components/ui/PRBadge.tsx` — gold badge + animation. |
| **8.5** | PRs on completion page | 🤖 CODE | 8.4, 8.3 | 10m | Show PRBadge list. |
| **8.6** | PR badges in history | 🤖 CODE | 8.2, 7.1, 7.3 | 10m | Badge on history rows and detail view. |
| **8.7** | PR on exercise detail | 🤖 CODE | 8.2, 3.7 | 10m | "Your PR: 85kg × 5 (est. 1RM: 96kg)". |
| **8.8** | Test PR accuracy | 🔧 MANUAL | 8.1–8.7 | 15m | Log → verify PR detected → check 1RM math → badge in history. |

**Phase 7+8 checkpoint:** `git commit -m "feat(day-5): workout history + PR tracking"`

---

### Phase 9: Polish + Offline Testing (Day 6)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **9.1** | Dark mode audit | 🤖 CODE | all pages | 15m | All backgrounds, text, borders use theme tokens. No white flashes. |
| **9.2** | Empty states for all lists | 🤖 CODE | 7.7, 3.11 | 10m | Verify every list. |
| **9.3** | Loading states | 🤖 CODE | all services | 10m | Spinner during auth, saves, data loads. |
| **9.4** | Error boundary | 🤖 CODE | — | 10m | Wrap main routes. "Something went wrong" + retry. |
| **9.5** | SyncStatus indicator | 🤖 CODE | 1.6 | 15m | Check `snapshot.metadata.fromCache` and `hasPendingWrites`. Small icon in header. |
| **9.6** | Toast/snackbar component | 🤖 CODE | 1.9 | 10m | Reusable toast for success/error messages. |
| **9.7** | Format utilities | 🤖 CODE | — | 10m | `utils/formatters.ts` — formatWeight, formatDate, formatDuration. |
| **9.8** | Touch target audit | 🤖 CODE | all components | 10m | Verify all buttons/inputs are ≥ 44×44px. |
| **9.9** | iPhone safe area check | 🤖 CODE | 1.10 | 5m | Content not hidden by notch or home indicator. BottomNav has safe-area padding. |
| **9.10** | Chrome offline test | 🔧 MANUAL | all features | 15m | DevTools → Network → Offline → full workout flow → un-offline → verify sync. |
| **9.11** | Real iPhone offline test | 🔧 MANUAL | 2.11 | 15m | Deploy to Vercel → PWA on iPhone → airplane mode → full workout → reconnect → verify. |
| **9.12** | Draft recovery test | 🔧 MANUAL | 4.3 | 5m | Mid-workout → close tab → reopen → resume works. |
| **9.13** | Timer clock-diff test (real device) | 🔧 MANUAL | 6.6 | 10m | On iPhone PWA: start timer → lock screen → unlock → timer shows correct time. |
| **9.14** | Fix issues from testing | 🤖 CODE | 9.10–9.13 | 30m | Address all bugs found. |

**Phase 9 checkpoint:** `git commit -m "feat(day-6): polish + offline verification"`

---

### Phase 10: Production Deploy + Real-World Test (Day 7)

| ID | Task | Type | Depends on | Est. | Details |
|----|------|------|-----------|------|---------|
| **10.1** | Final production build | 🤖 CODE | all phases | 5m | `npm run build` — verify no errors. Check `dist/` output size. |
| **10.2** | Deploy to Vercel production | 🤖 CODE + 🔧 MANUAL | 10.1, 0.5 | 5m | `vercel --prod` or push to linked GitHub repo. |
| **10.3** | Verify PWA manifest + Service Worker | 🔧 MANUAL | 10.2 | 10m | Chrome DevTools → Application → check manifest, service worker registered, exercises.json cached. |
| **10.4** | Install PWA on iPhone | 🔧 MANUAL | 10.2 | 5m | Safari → Share → Add to Home Screen → "LiftLog" → verify standalone launch, icon, splash. |
| **10.5** | Real gym workout | 🔧 MANUAL | 10.4 | 60m | Go to the gym. Use only LiftLog. Note: logging speed, UX friction, timer behaviour, offline resilience. |
| **10.6** | Fix critical issues | 🤖 CODE | 10.5 | varies | Address anything found in real-world use. Re-deploy. |
| **10.7** | Final commit + tag | 🤖 CODE | 10.6 | 5m | `git commit` + `git tag v0.1.0-mvp` |
| **10.8** | (Optional) Connect custom domain | 🔧 MANUAL | 10.2 | 15m | Buy domain → add to Vercel → point nameservers. |

**Phase 10 checkpoint:** MVP complete 🎉

---

### Summary: Manual vs Code Tasks

| Category | Count | Total Est. Time |
|----------|-------|-----------------|
| 🔧 MANUAL (human required) | 19 tasks | ~5 hours |
| 🤖 CODE (delegatable) | 59 tasks | ~12.5 hours |
| **Total** | **78 tasks** | **~17.5 hours** |

Compared to native: **5 fewer tasks, 3 fewer hours, 4 fewer manual steps** (no Xcode, no Android Studio, no EAS, no Development Build).

---

### Critical Path

```
0.4 (Firebase project)
  → 0.4.1–0.4.3 (enable services + get web config)
    → 1.5 (.env.local) → 1.6 (firebase.ts)
      → 2.1–2.13 (auth + first deploy)
        → 4.1–4.12 (workout logging)
          → 5.1–5.6 (templates) + 6.1–6.6 (timer)
            → 7.1–7.7 (history) + 8.1–8.8 (PRs)
              → 9.1–9.14 (polish)
                → 10.1–10.7 (deploy + gym test)
```

**Firebase project (0.4) is the first blocker** — create it before writing any code.

### Parallelisation Opportunities

| Developer A | Developer B | Notes |
|------------|------------|-------|
| Phase 0 + Phase 1 (setup) | Download exercise data (3.1) + PWA icons (1.11) | B prepares assets |
| Phase 2 (auth + routing) | Phase 3 (exercise library) | Independent after 1.7 |
| Phase 4 (workout logging) | Phase 6 (timer context — 6.1) | Timer can be built standalone |
| Phase 5 (templates) | Phase 8 (PR service — 8.1, 8.2) | PR logic is independent |
| Phase 7 (history UI) | Phase 8.3–8.7 (PR integration) | Merge after both done |
| Phase 9 (polish) | Shared | Both test and review |
| Phase 10 (deploy) | — | Single person |
