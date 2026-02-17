# Testing & Verification Strategy

## Philosophy
LiftLog MVP prioritises manual verification and type safety over automated test suites. A 7-day timeline doesn't allow for comprehensive test coverage. We enforce correctness through TypeScript strict mode and structured manual testing in the browser.

## Automated Checks

### Type Checking (Run Before Every Commit)
```bash
npx tsc --noEmit
```
- Must pass with zero errors
- Catches: wrong prop types, missing fields, service return type mismatches
- This is the primary automated safety net for MVP

### Build Check
```bash
npm run build
```
- Verifies the production build completes without errors
- Catches: import resolution issues, Vite config problems

### Pre-Commit Hook (Set Up Day 1)
```bash
# .git/hooks/pre-commit
#!/bin/sh
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "Type check failed. Fix errors before committing."
  exit 1
fi
```

Make executable: `chmod +x .git/hooks/pre-commit`

## Browser Testing Setup

### Chrome DevTools (Primary)
- **Device Mode:** Toggle device toolbar (Ctrl+Shift+M) → select iPhone 12/13 viewport
- **Application tab:** Inspect Service Worker registration, localStorage contents, IndexedDB (Firestore cache)
- **Network tab:** Throttle to "Offline" to test offline behaviour
- **Console:** Watch for errors and warnings

### Real iPhone Testing (Critical — Do Before Each Milestone)
1. Deploy to Vercel: `vercel --prod`
2. Open Vercel URL on iPhone Safari
3. Test touch interactions, input behaviour, scrolling
4. For PWA testing: Add to Home Screen → launch → verify standalone mode

## Manual Verification Checklist

### After Every Feature
1. App builds without errors (`npm run build`)
2. Types check (`npx tsc --noEmit`)
3. Feature works in Chrome DevTools mobile emulation
4. No console errors or warnings related to the feature

### Day 1: Auth + PWA Setup Verification
- [ ] `npm run dev` → opens in browser → no errors
- [ ] Sign up with new email → user appears in Firebase Console
- [ ] Sign in with existing email → navigates to home
- [ ] Wrong password → shows error message (not crash)
- [ ] Session persists → refresh page → still logged in
- [ ] Sign out → redirects to login page
- [ ] Firestore Security Rules deployed → test unauthorized access fails
- [ ] Deploy to Vercel → opens on phone
- [ ] PWA manifest works: name, icons, theme colour correct
- [ ] Add to Home Screen on iPhone → launches in standalone mode (no Safari bar)
- [ ] Service Worker registered (check Application tab in DevTools)

### Day 2: Exercise Library Verification
- [ ] Exercise list loads on app launch
- [ ] Search "bench" → shows bench press variants
- [ ] Filter by "chest" → shows only chest exercises
- [ ] Clear filters → full list returns
- [ ] Exercise detail shows name, muscles, equipment, instructions
- [ ] Create custom exercise → appears in search results
- [ ] Custom exercise persists after page refresh
- [ ] **Offline test:** Chrome DevTools → Network → Offline → exercise list still loads (Service Worker cached)

### Day 3: Workout Logging Verification
- [ ] Start blank workout → elapsed timer begins
- [ ] Add exercise from library → exercise card appears
- [ ] Previous session data shows as auto-fill placeholder
- [ ] One-tap checkmark → fills weight/reps from previous → marks complete
- [ ] Edit weight/reps before confirming → values save correctly
- [ ] Add second exercise → both show in workout
- [ ] Finish workout → saves to Firestore → appears in history
- [ ] **Speed test:** time yourself logging a set → must be ≤15 seconds
- [ ] **Draft test:** log 2 sets → refresh page (F5) → draft recovery prompt → resume → sets intact

### Day 4: Templates + Timer Verification
- [ ] Complete a workout → "Save as Template?" prompt appears
- [ ] Save template with name "Push Day" → appears on home page
- [ ] Start workout from "Push Day" → exercises pre-populated with targets
- [ ] Rest timer auto-starts on set completion
- [ ] Timer counts down correctly (while tab is focused)
- [ ] +15s / -15s buttons work
- [ ] Skip button cancels timer
- [ ] **Clock-diff test:** start timer → switch to different browser tab → wait 30s → switch back → timer shows correct remaining time (jumped forward)
- [ ] **Expiry test:** start timer (set to 10s for testing) → switch tabs → wait 15s → switch back → shows "Rest Complete!" + audio plays

### Day 5: History + PR Verification
- [ ] Workout history shows all completed workouts (newest first)
- [ ] Tap workout → see all exercises and sets
- [ ] Tap exercise name → see per-exercise progression
- [ ] Log a workout with heavier weight than previous → PR badge shown on completion
- [ ] PR badge visible on workout in history list
- [ ] Calculate 1RM manually → compare with app's 1RM → matches (Brzycki formula)

### Day 6: Offline + Polish Verification
- [ ] **CRITICAL: Full Offline Test**
  1. Open app in Chrome
  2. DevTools → Network → check "Offline"
  3. Start a workout
  4. Add exercises, log all sets
  5. Complete workout
  6. Uncheck "Offline"
  7. Wait a few seconds for Firestore sync
  8. Open Firebase Console → verify workout data synced
- [ ] **Real iPhone Offline Test**
  1. Open LiftLog PWA (from home screen)
  2. Enable airplane mode
  3. Start and complete a workout
  4. Disable airplane mode
  5. Force-refresh (close and reopen PWA)
  6. Verify workout is in history
- [ ] **Draft recovery test:** start workout → close browser tab entirely → reopen app → resume prompt
- [ ] Dark mode consistent on all screens
- [ ] Empty state shown for: no workouts yet, no templates yet, no history for exercise
- [ ] Loading spinner shown during: sign in, saving workout, loading history
- [ ] No blank screens anywhere
- [ ] All touch targets at least 44×44px (use Chrome DevTools element inspector)
- [ ] iPhone safe areas respected (content not hidden by notch or home indicator)

### Day 7: Production + Real-World Verification
- [ ] `npm run build` succeeds
- [ ] `vercel --prod` deploys without errors
- [ ] PWA installs from production URL on iPhone
- [ ] Launches in standalone mode (no Safari UI)
- [ ] Complete a real gym workout using only LiftLog
- [ ] All features work in gym conditions (one-handed use, between sets)
- [ ] Timer recovers correctly after screen lock/unlock
- [ ] No crashes during 45+ minute session
- [ ] Data appears in Firebase Console after session

## Automated Testing (Post-MVP)

When adding automated tests after MVP:

### Unit Tests (Vitest)
- Service functions (workoutService, prService, exerciseService)
- Utility functions (1RM calculation, formatters)
- Normalisation layer (exerciseService normalisers)
- Timer clock-diff logic

### Setup Command (When Ready)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Test Structure
```
src/__tests__/
├── services/
│   ├── workoutService.test.ts
│   ├── prService.test.ts
│   └── exerciseService.test.ts
├── utils/
│   └── calculations.test.ts
└── components/
    └── SetRow.test.tsx
```

## Verification Loop Summary
```
After every change:
1. Save file → Vite HMR updates browser instantly
2. Check for TypeScript errors in editor
3. Check browser — does it still work?
4. If adding a feature: test the specific checklist items above
5. If all pass: commit
6. If anything fails: fix before moving on
```
