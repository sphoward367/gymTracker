# Product Requirements Document: LiftLog MVP

## Overview

**Product Name:** LiftLog (working title)
**Problem Statement:** Gym-goers who track their own workouts are stuck choosing between apps that paywall essential features (Strong), overwhelm with clutter and ads (JEFIT), or lack cloud sync entirely (FitNotes). None of them offer split-aware streak tracking or a GitHub-style training calendar. There's room for a fast, offline-first tracker that respects the user's time and doesn't gate core functionality behind a subscription.
**MVP Goal:** A fully functional workout tracker that replaces an existing app (Strong/Hevy/FitNotes) for personal daily use within 2 weeks of first build.
**Target Launch:** 1-week development sprint → personal use immediately, app store submission as a stretch goal.

## Target Users

### Primary User Profile
**Who:** Intermediate-to-advanced gym-goer who follows a structured program (PPL, Upper/Lower, etc.) and wants to log workouts quickly between sets without friction.
**Problem:** Current trackers either lock charts and templates behind paywalls, bombard with ads, feel dated/sluggish, or don't sync across devices.
**Current Solution:** Strong (free tier with 3-routine limit), Hevy, a spreadsheet, or pen-and-paper.
**Why They'll Switch:** Faster logging, no paywall on core features, offline-first reliability, and a streak/calendar system that actually understands rest days.

### User Persona: Alex
- **Demographics:** 20–35, goes to the gym 4–6 days/week, follows a structured split
- **Tech Level:** Intermediate — comfortable installing apps, expects things to "just work", not interested in fiddling with settings
- **Goals:** Progressive overload (lift more over time), stay consistent, see long-term trends
- **Frustrations:** Strong's 3-routine limit on free tier, losing data when offline, no visual representation of training consistency, clunky UX that wastes time between sets

## User Journey

### The Story
Alex arrives at the gym and opens LiftLog. They tap "Start Workout" and select their saved "Push Day" template. The app pre-fills all exercises with last session's weight and reps. Alex does their first set of bench press, taps the set row to confirm (weight and reps auto-filled from last time), and the rest timer starts automatically. Between sets, Alex can see what they lifted last session right on screen. After their final exercise, they tap "Finish Workout." LiftLog detects a new bench press PR and shows a quick celebration. The workout is saved locally and syncs to the cloud when Alex gets home on Wi-Fi. Later that evening, Alex opens the app to check their streak — 14 days and counting, with rest days properly accounted for.

### Key Touchpoints
1. **Discovery:** Personal build / word of mouth / app store search for "workout tracker"
2. **First Contact:** Open app → sign up with email → select preferred units (kg/lbs)
3. **Onboarding:** Browse exercise library, create first template from scratch or log a freestyle workout
4. **Core Loop:** Start workout → log sets (10–15 sec per set max) → complete → see PR celebrations → check streak
5. **Retention:** Streak counter, PR history, visible progress over time, templates that make logging effortless

## MVP Features

### Core Features (Must Have)

#### 1. Workout Logging
- **Description:** Start a workout, add exercises, log sets (weight × reps), complete and save. The active workout screen is the most critical piece of UI in the entire app — it must be fast, minimal, and distraction-free.
- **User Value:** The entire reason the app exists. If this isn't fast and reliable, nothing else matters.
- **Success Criteria:**
  - User can start a freestyle workout or start from a template
  - User can add exercises from the library mid-workout
  - Each set logs weight and reps with one-tap confirmation
  - Previous session's data auto-fills for each exercise (progressive overload reference)
  - Draft workout persists to local storage (MMKV) — if the app crashes mid-workout, data is recoverable
  - Completed workout saves to Firestore with offline queuing
  - Logging a single set takes ≤ 15 seconds
- **Priority:** P0 — Critical

#### 2. Exercise Library (800+ bundled)
- **Description:** A searchable, filterable library of 800+ exercises bundled as a static JSON asset (free-exercise-db, public domain). Users can also create custom exercises. Architected with a normalisation layer so the data source can be swapped to ExerciseDB (11,000+ with GIFs/videos) post-MVP without changing any UI components.
- **User Value:** Users can find any common gym exercise instantly without network access. Custom exercises fill gaps for unusual movements or home equipment.
- **Success Criteria:**
  - Search by exercise name, body part, or equipment
  - Filter by body part category (chest, back, legs, arms, shoulders, core)
  - Exercise detail view showing instructions and images
  - Create custom exercise (name, body part, equipment, optional instructions)
  - Custom exercises appear seamlessly alongside built-in library
  - All exercise data available offline from first launch (zero API dependency)
- **Priority:** P0 — Critical

#### 3. Workout Templates
- **Description:** Save a workout as a reusable template (e.g., "Push Day", "Leg Day"). Start future workouts from a template to pre-populate exercises with target sets/reps.
- **User Value:** Users who follow a structured split (PPL, Upper/Lower, Bro split) don't want to manually add exercises every session. Templates turn a 2-minute setup into a single tap.
- **Success Criteria:**
  - Save current workout as a new template
  - Create template from scratch (pick exercises, set target sets/reps/rest time)
  - Start a workout from a template — exercises pre-filled
  - Edit and delete existing templates
  - Unlimited templates (no paywall — this is a key differentiator vs Strong's 3-routine free limit)
- **Priority:** P0 — Critical

#### 4. Rest Timer
- **Description:** Configurable countdown timer between sets. Auto-starts when a set is completed. Notification/vibration when time expires. Must work when the screen is locked or the app is backgrounded.
- **User Value:** Rest timing is critical for hypertrophy and strength training. Users currently rely on phone stopwatches or mental counting — both are unreliable.
- **Success Criteria:**
  - Timer auto-starts on set completion
  - Default rest time configurable per exercise (e.g., 90s for compounds, 60s for isolation)
  - Global default rest time in settings
  - Timer continues when app is backgrounded or screen locks
  - Notification with vibration when rest period ends (via expo-notifications)
  - Quick-adjust buttons (+15s, -15s) during countdown
  - Timer state persists across app restarts (saved to MMKV)
- **Priority:** P0 — Critical

#### 5. Workout History
- **Description:** Chronological list of all past workouts with the ability to drill into any session and see every exercise and set.
- **User Value:** Users need to reference past performance to plan progressive overload. "What did I bench last Tuesday?" must be answerable in 2 taps.
- **Success Criteria:**
  - History list grouped by date, showing workout name/template, duration, and exercise count
  - Tap a workout to see full detail (all exercises, all sets with weight/reps)
  - Per-exercise history view — see all sessions for a specific exercise over time
  - History loads from Firestore cache (fast, works offline)
  - Pagination for users with extensive history
- **Priority:** P0 — Critical

#### 6. Basic PR Tracking
- **Description:** Automatically detect when a user sets a new personal record for an exercise (heaviest weight for a given rep count). Show a celebratory indicator in-workout and badge in history.
- **User Value:** PRs are the most motivating moment in a lifter's week. Automated detection removes the mental load of remembering past bests, and the celebration creates a positive feedback loop.
- **Success Criteria:**
  - After completing a workout, compare each set against stored PRs
  - Detect new max weight PRs per exercise
  - Show in-workout celebration (badge/animation) when a PR is set
  - PR badge visible in workout history for PR sessions
  - Store PRs in a dedicated Firestore subcollection for O(1) reads
  - Calculate estimated 1RM using Brzycki formula (weight × 36 / (37 - reps)) for reps ≤ 10
- **Priority:** P0 — Critical

#### 7. User Authentication
- **Description:** Email/password sign-up and login via Firebase Auth. Required for cloud sync and data persistence across devices.
- **User Value:** Users don't lose their data if they switch phones or reinstall the app.
- **Success Criteria:**
  - Email/password registration and login
  - Persistent login session (don't require re-login on app restart)
  - Logout functionality
  - Basic error handling (invalid email, wrong password, account exists)
  - User profile with display name and unit preference (kg/lbs)
- **Priority:** P0 — Critical

#### 8. Offline-First Architecture
- **Description:** The app must work fully without a network connection. All reads serve from local Firestore cache. All writes queue locally and sync when connectivity returns. The exercise database is bundled — no network needed on first launch.
- **User Value:** Gyms frequently have poor cell reception. If the app breaks without Wi-Fi, users will abandon it immediately. Every major competitor (Strong, Hevy, JEFIT) handles this well — it's table stakes.
- **Success Criteria:**
  - Full workout logging in airplane mode
  - Reads serve from Firestore's local cache
  - Writes queue and sync automatically when online
  - Sync status indicator (subtle "pending sync" badge)
  - Exercise library available offline from first launch (bundled JSON)
  - Draft workout recovery from MMKV after crash/kill
  - Firestore cache set to unlimited (`CACHE_SIZE_UNLIMITED`)
- **Priority:** P0 — Critical

### Future Features (Not in MVP)

| Feature | Why Wait | Planned For |
|---------|----------|-------------|
| Progress charts (1RM, volume over time) | Requires charting library integration and meaningful historical data to be useful | Week 2–3 |
| Streak system + calendar heatmap | High-value differentiator but not blocking daily use | Week 2–3 |
| Body weight logging | Useful for cuts/bulks but not core to workout tracking | Week 3–4 |
| Supersets | UX complexity — need to get basic logging right first | Week 3–4 |
| Set tagging (warmup, drop set, failure) | Nice metadata but doesn't block core logging flow | Week 2 |
| Unit switching with history conversion | lbs ↔ kg toggle with retroactive conversion is fiddly to implement correctly | Week 2 |
| Workout notes | Free-text per session — simple but not essential for tracking | Week 2 |
| Full body measurements | Arms, waist, chest — separate tracking concern | Month 2 |
| Advanced analytics (volume by muscle group, frequency) | Needs substantial data accumulation first | Month 2 |
| Structured programs (5/3/1, PPL with auto-progression) | Complex programming logic, better suited for a dedicated feature cycle | Month 2+ |
| Data export (CSV) | Important for data portability but not urgent for personal use | Month 2 |
| Social features (share, follow, leaderboards) | Polarising — Hevy users love it, Strong/FitNotes users avoid it. Evaluate demand first | Month 3+ |
| AI workout suggestions | Interesting differentiator, requires backend ML/LLM integration | Month 3+ |
| Apple Watch / Wear OS | Wrist-based logging is a big UX win but requires separate codebase effort | Month 3+ |
| Progress photos | Before/after gallery with date tags — separate media management concern | Month 2+ |
| Plate calculator | Visual plate-loading guide — nice-to-have utility | Month 2 |

## Success Metrics

### Primary Metrics
1. **Personal replacement:** Using LiftLog as sole workout tracker for 14+ consecutive sessions
   - How to measure: Check workout history count and consistency
   - Why it matters: The entire MVP goal — if I go back to Strong/Hevy, something is wrong

2. **Logging speed:** Average time to log a single set ≤ 15 seconds
   - How to measure: Timestamp between set completions during active workout
   - Why it matters: Speed is the #1 feature of every successful tracker. Strong's one-tap confirmation sets the bar.

### Secondary Metrics
- Workout completion rate: > 90% of started workouts are finished (not abandoned)
- Offline reliability: Zero data loss during offline sessions
- PR detection accuracy: 100% of actual weight PRs correctly identified
- App crash rate: < 1% of sessions

## UI/UX Direction

**Design Feel:** Clean, fast, dark-mode-first, minimal — closer to Strong's focused simplicity than JEFIT's feature overload.
**Inspiration:** Strong (logging speed, clean workout screen), Hevy (modern UI, PR celebrations), GitHub (contribution heatmap for future streak feature)

### Key Screens
1. **Home / Dashboard**
   - Purpose: Entry point — start a new workout or continue a draft
   - Key Elements: "Start Workout" button, recent workouts list, streak counter (post-MVP), quick stats
   - User Actions: Start freestyle workout, start from template, view recent history

2. **Active Workout**
   - Purpose: The core screen — where sets are logged during a gym session
   - Key Elements: Current exercise name, sets table (set #, previous weight/reps, current weight/reps, completion check), rest timer, add exercise button
   - User Actions: Log sets, complete sets (one-tap auto-fill), skip/reorder exercises, start rest timer, finish workout
   - Design Principle: Nothing on screen that isn't needed between sets. No ads, no social feed, no tips.

3. **Exercise Library**
   - Purpose: Browse and search exercises to add to a workout or template
   - Key Elements: Search bar, body part filter chips, exercise list with name + primary muscle + equipment, exercise detail with instructions and images
   - User Actions: Search, filter, select exercise to add, create custom exercise

4. **Workout History**
   - Purpose: Review past sessions, check what was lifted, see PRs
   - Key Elements: Date-grouped list of workouts, workout detail view, per-exercise history, PR badges
   - User Actions: Browse history, tap workout for detail, tap exercise for progression over time

5. **Profile / Settings**
   - Purpose: Account and app configuration
   - Key Elements: Display name, unit preference (kg/lbs), default rest time, logout
   - User Actions: Change settings, manage account

### Design Principles
- **Speed over beauty:** Every interaction should feel instant. Prioritise performance over animation.
- **Gym-proof:** Large tap targets, high contrast, readable at arm's length on a bench. Dark mode default (most gyms have low lighting).
- **Progressive disclosure:** Show only what's needed for the current task. Details available on tap, not on default view.

## Technical Considerations

**Platform:** iOS + Android (React Native with Expo SDK 53+)
**Responsive:** Mobile-first and mobile-only for MVP. Tablet optimised: No.
**Performance Goals:**
- App launch to interactive: < 2 seconds
- Set logging (tap to confirmed): < 500ms perceived
- Exercise search results: < 200ms
- Works smoothly on 3-year-old mid-range devices

**Security/Privacy:**
- Firebase Auth for user authentication (email/password)
- Firestore Security Rules: users can only read/write their own data (`request.auth.uid == userId`)
- No sensitive health data beyond workout logs — no medical information
- No third-party analytics or ad SDKs in MVP

**Scalability:**
- MVP: Single user (personal use). Architecture supports multi-user from day 1 via Firebase.
- 0–100 users: Firebase free tier covers everything
- 1,000+ users: Firestore costs scale with reads/writes — data model is denormalised to minimise reads
- Backend migration path to Supabase documented if Firebase costs become unpredictable at scale

**Tech Stack (from research):**

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React Native + Expo (SDK 53+) | Closest to existing React/TS skills, cross-platform |
| Backend | Firebase (Firestore + Auth) | Existing knowledge, mature mobile offline support |
| Native SDK | @react-native-firebase/* | Required for Expo SDK 53+ Auth compatibility + reliable offline |
| Local storage | react-native-mmkv | Timer state, draft workouts, UI prefs — 20x faster than AsyncStorage |
| State management | React Context + useReducer | Sufficient for MVP, avoids Redux complexity |
| Navigation | Expo Router (file-based) | Built into Expo, convention-based |
| Charts (post-MVP) | react-native-gifted-charts | Best balance of features, maintenance, Expo compatibility |
| Exercise data (MVP) | free-exercise-db (800+ exercises, bundled JSON) | Public domain, zero API dependency, offline from first launch |
| Exercise data (future) | ExerciseDB v2 (11,000+ with GIFs/videos, self-hosted on Vercel) | Swap via normalisation layer — 2–4 hours of work, zero UI changes |
| Build | Expo Development Build + EAS Build | Required for native Firebase SDK (not Expo Go) |

## Constraints & Requirements

### Budget
- Development tools (Cursor/Claude): $0–20/month
- Firebase (Firestore + Auth): $0/month (free tier)
- Expo / EAS Build: $0/month (free tier, 30 builds/month)
- Apple Developer Account: $99/year
- Google Play Developer: $25 one-time
- **Total (MVP phase):** $0–20/month + $124 one-time

### Timeline
- MVP Development: 7 days (1 sprint)
- Personal beta testing: 1–2 weeks post-build
- Launch Target: End of Week 1 for personal use build

### Day-by-Day Roadmap

| Day | Focus | Milestone |
|-----|-------|-----------|
| 1 (Mon) | Project setup + Auth + Navigation | App launches, user can sign up/login, empty tab screens |
| 2 (Tue) | Exercise database + Search | Browse 800+ exercises, search, create custom |
| 3 (Wed) | Core workout logging | Log full workout with multiple exercises/sets, data persists |
| 4 (Thu) | Templates + Rest timer | Create/use templates, rest timer works when backgrounded |
| 5 (Fri) | History + PR tracking | Full history browsing, PRs auto-detected |
| 6 (Sat) | Polish + Offline testing | Reliable offline mode, dark mode, error handling, no critical bugs |
| 7 (Sun) | Build + Deploy | Installable APK/IPA via EAS Build for personal use |

### Technical Constraints
- Must use Expo Development Build (not Expo Go) due to @react-native-firebase native modules
- Firebase JS SDK not compatible with Expo SDK 53+ for Auth — native SDK required
- Exercise images loaded from GitHub CDN at runtime (not bundled — saves ~100 MB app size)
- AI coding assistance (Claude Code / Cursor) expected to handle 50–70% of boilerplate

## Open Questions & Assumptions

### Assumptions
- 800 bundled exercises covers all common gym movements (gaps filled by custom exercises)
- Single-user personal use means Firestore conflict resolution (last-write-wins) is sufficient
- Dark mode is the primary theme (gym lighting conditions)
- Users follow a repeating weekly split (PPL, UL, etc.) — informs future streak logic

### Open Questions
- App name — "LiftLog" is a working title. Finalise before app store submission.
- Apple Sign-In / Google Sign-In — add alongside email/password, or keep email-only for MVP?
- Onboarding flow depth — minimal (just unit selection) or guided (pick a split, create first template)?
- Image bundling vs CDN — should exercise images be cached locally after first load for full offline image access, or is text-only offline acceptable?

## Quality Standards

**Code Quality:**
- TypeScript strict mode — no `any` types
- Service layer abstraction (components never call Firestore directly)
- Exercise data accessed through ExerciseService with normalisation layer (enables data source swap)
- Error boundaries on all screens — crashes in one screen don't kill the app

**Design Quality:**
- Consistent spacing and colour tokens (no raw hex values scattered through components)
- All interactive elements have minimum 44×44pt tap targets
- Dark mode tested as primary theme
- Empty states for all lists (no blank screens)
- Loading states for all async operations

**What This Project Will NOT Accept:**
- Placeholder content ("Lorem ipsum") at launch
- Features that half-work — complete or cut entirely
- Skipping offline testing before considering MVP done
- Exercise data source tightly coupled to components (must go through normalisation layer)

## Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Expo Development Build setup issues (native modules) | High — blocks all development | Follow Expo docs precisely, budget Day 1 entirely for setup. Have bare React Native CLI as fallback. |
| Firebase offline persistence not working reliably | High — core requirement | Use @react-native-firebase (native SDK), not JS SDK. Test offline on Day 1 before building features on top. |
| Rest timer stops when app backgrounded | Medium — poor UX | Use expo-notifications for timer alerts. Test background behaviour on both iOS and Android early. |
| Logging UX too slow (> 15 sec/set) | High — primary success metric | Prototype the active workout screen on Day 3, get real-gym feedback Day 4. Iterate on set input pattern. |
| Exercise library too large for smooth search | Low — 800 exercises is manageable | Pre-index exercises at load time. If slow, add debounced search or FlatList virtualisation. |
| Firestore costs spike at scale | Low (MVP) / Medium (future) | Data model denormalised to minimise reads. Supabase migration path documented. Monitor billing alerts. |
| 1-week timeline too ambitious | Medium — scope creep risk | Strict feature cut discipline. If a feature slips past its day, it moves to Week 2, not the next day. |

## MVP Completion Checklist

### Development Complete
- [ ] All 8 core features working end-to-end
- [ ] Basic error handling on all screens
- [ ] Dark mode themed consistently
- [ ] Tested on at least one real Android device and one iOS device (or simulator)

### Offline Verified
- [ ] Airplane mode → start workout → log sets → complete workout → reconnect → data syncs
- [ ] Exercise library fully browsable offline
- [ ] Draft workout recoverable after app kill
- [ ] Rest timer works when screen locked

### Quality Checks
- [ ] Set logging takes ≤ 15 seconds per set
- [ ] No critical bugs or data loss scenarios
- [ ] Empty states for all lists
- [ ] Loading states for all async operations
- [ ] PR detection correctly identifies new records

### Launch Ready
- [ ] Installable build via EAS Build (APK for Android, IPA for iOS)
- [ ] Firebase Security Rules deployed (users can only access own data)
- [ ] README documenting data model and setup steps
- [ ] Personal use for 3+ sessions without reverting to old tracker

## Appendices

### A. Competitive Analysis Summary

| Aspect | Strong | Hevy | JEFIT | FitNotes | **LiftLog (target)** |
|--------|--------|------|-------|----------|---------------------|
| Free tier limits | 3 routines, no charts | Generous | Ads, limited | Fully free | Fully free, no limits |
| Logging speed | Excellent | Good | Moderate | Good | Target: Match Strong |
| Offline support | Full | Full | Full | Full (local only) | Full + cloud sync |
| Exercise library | Large | Large | 1,400+ with video | Moderate | 800+ bundled, expandable to 11,000+ |
| Streak/calendar | No | No | No | No | **Post-MVP differentiator** |
| Cloud sync | Yes | Yes | Yes | No | Yes |
| PR celebrations | Basic | Good (trophy) | Basic | Basic | Yes — auto-detect + celebration |

### B. Data Model Reference

```
users/{userId}/
  profile: { displayName, units, timezone, createdAt }
  exercises/{exerciseId}: { name, bodyPart, targetMuscles[], equipment, source, instructions?, imageUrl? }
  templates/{templateId}: { name, exercises: [{ exerciseId, targetSets, targetReps, restSeconds }] }
  workouts/{workoutId}: { templateId?, startedAt, completedAt, durationSeconds, notes?,
    exercises: [{ exerciseId, exerciseName, sets: [{ setNumber, weight, reps, type, completed }] }] }
  personalRecords/{exerciseId}: { maxWeight: { value, date, workoutId }, max1RM, history[] }
```

Key design decisions: exerciseName denormalised in workouts (no Firestore joins, offline performance), PRs in separate subcollection (O(1) reads), exercise data accessed through ExerciseService normalisation layer (enables data source swap).

### C. Exercise Data Source Upgrade Path

MVP bundles free-exercise-db (800 exercises, public domain JSON). All access goes through ExerciseService with a normalisation layer. Post-MVP upgrade to ExerciseDB v2 (11,000+ exercises with animated GIFs and videos) requires: (1) self-host on Vercel, (2) swap two lines in ExerciseService, (3) add GIF/video display to exercise detail screen. Estimated effort: 2–4 hours. Zero changes to workout logging, history, templates, or PR tracking. Historical workout data unaffected because exerciseName is stored denormalised in each workout document.

## Next Steps

1. **Immediate:** Review and approve this PRD
2. **Next:** Create Technical Design Document (Part 3) — detailed component architecture, Firestore security rules, screen-by-screen specs
3. **Then:** Day 1 of development — project setup, Firebase config, auth flow
4. **Build:** Follow the 7-day roadmap with AI coding assistance
5. **Test:** Personal use for 1–2 weeks, fix issues as they arise
6. **Iterate:** Add Week 2–3 features (charts, streaks, body weight) based on personal usage patterns

---
*Created: February 2026*
*Status: Draft — Ready for Technical Design*
*Based on: Part 1 Research Report (gym-tracker-research.md)*
