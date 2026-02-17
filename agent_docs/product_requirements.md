# Product Requirements

## Primary User Story
> As an intermediate gym-goer who trains 3–5 times per week, I want a workout tracker that lets me log sets in under 15 seconds, works perfectly offline, and automatically tracks my PRs — so I can focus on lifting instead of fighting my app.

## Must-Have Features (P0 — All Required for MVP)

### 1. Workout Logging
- Start a new workout (blank or from template)
- Add exercises from the library
- Log weight × reps for each set
- One-tap set completion (auto-fills from previous session)
- Elapsed time display
- Finish and save workout
- **Target:** ≤15 seconds per set logged

### 2. Exercise Library
- 800+ built-in exercises (free-exercise-db, bundled JSON in `public/`)
- Search by name (with debounced autocomplete)
- Filter by body part (Chest, Back, Legs, Arms, Shoulders, Core)
- Filter by equipment (Barbell, Dumbbell, Machine, Cable, Bodyweight)
- View exercise details (muscles targeted, instructions, images)
- Create custom exercises
- **Architecture:** All access through ExerciseService normalisation layer

### 3. Workout Templates
- Save any completed workout as a reusable template
- Unlimited templates (no paywall like Strong's 3-routine limit)
- Start a workout pre-populated from a template
- Edit template (add/remove/reorder exercises)
- Delete template

### 4. Rest Timer
- Auto-starts when a set is marked complete
- Configurable duration per exercise (default 90 seconds)
- Countdown display visible during workout
- Quick-adjust: +15s / -15s / Skip buttons
- Timer state persists in localStorage (survives page refresh)
- **PWA behaviour:** Timer uses clock-diff recovery. When the tab is backgrounded or screen locks, JS pauses. On refocus, the timer recalculates remaining time from system clock and shows correct value. Audio alert plays if timer expired while away. No background push notification.
- **Workaround:** Keep phone screen on between sets (most gym users do this)

### 5. Workout History
- Chronological list of completed workouts (newest first)
- Each entry shows: date, template name (if any), exercises count, duration
- Drill-down: tap workout to see all exercises and sets
- Per-exercise history: tap exercise name to see progression over time

### 6. PR Tracking
- Auto-detect personal records on workout completion
- Track: max weight per exercise, estimated 1RM (Brzycki formula)
- PR celebration UI (gold badge + animation)
- 1RM formula: `weight × (36 / (37 - reps))` — valid for 1–10 reps
- PR data stored in `personalRecords/{exerciseId}` subcollection

### 7. User Authentication
- Email/password sign-up and sign-in (Firebase Auth JS SDK)
- Persistent sessions (Firebase Auth uses IndexedDB in browser)
- Sign-out functionality
- Future: password reset, social login

### 8. Offline-First
- All features work in airplane mode
- Firestore offline persistence via `enablePersistence()` (IndexedDB cache)
- Exercise library pre-cached by Service Worker (`public/exercises.json`)
- Draft workout persisted to localStorage (crash/refresh recovery)
- Automatic sync when connectivity returns
- SyncStatus indicator (shows pending writes)
- **Note:** iOS Safari may evict PWA storage after ~2 weeks of inactivity. You train 3-5x/week so this won't trigger. Firestore re-syncs on next launch.

## Nice-to-Have (Post-MVP — Week 2–3)
- Progress charts (Recharts or Chart.js)
- Streak system with calendar heatmap
- Body weight logging
- Supersets (group exercises)
- Set tagging (warmup, dropset, failure)
- Unit switching (kg ↔ lbs)

## NOT in MVP
- Body measurements
- Advanced analytics (volume per muscle group)
- Structured programs (5/3/1, nSuns)
- Data export (CSV/JSON)
- Social features (friends, sharing)
- AI-powered suggestions
- Wearable integration (Apple Watch, Wear OS)
- Progress photos
- Plate calculator
- Background push notifications (PWA limitation on iOS)

## Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Personal replacement | 14+ consecutive sessions using LiftLog exclusively | Self-tracking |
| Logging speed | ≤15 seconds per set | Stopwatch test during real workout |
| Workout completion rate | >90% of started workouts finished | Firestore query: completedAt not null |
| Offline data loss | Zero | Airplane mode → full workout → reconnect → verify |
| PR detection accuracy | 100% | Compare with manual calculation |

## UI/UX Requirements
- **Theme:** Dark mode primary, clean and minimal
- **Design feel:** Strong's simplicity, not JEFIT's clutter
- **Key screens:** Home, Active Workout (most critical), Exercise Library, Workout History, Profile
- **Tap targets:** 44×44px minimum
- **Typography:** High contrast on dark backgrounds
- **Empty states:** Every list must show helpful empty state, not blank screen
- **Loading states:** Every async operation must show loading indicator
- **Mobile-first:** Designed for phone screens, `viewport-fit=cover` for iPhone notch/home indicator
- **PWA standalone:** No browser chrome when launched from home screen
