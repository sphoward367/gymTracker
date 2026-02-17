# Technical Design Document: LiftLog MVP (PWA)

## Overview

This document explains how we'll build LiftLog — a mobile-first gym workout tracker as a Progressive Web App. It translates the PRD's feature requirements into concrete technical decisions, project structure, and implementation guidance.

**Based on:** PRD-LiftLog-MVP.md (Part 2) and gym-tracker-research.md (Part 1)
**Updated:** Switched from React Native to PWA to eliminate $99/year Apple Developer cost and leverage existing React/web knowledge.

## Recommended Approach

### Best Path for You: React + Vite + Tailwind + Firebase PWA

Based on your existing React/TypeScript/Firebase knowledge, 1-week timeline, and goal of avoiding Apple Developer fees:

**Primary Approach: Full-code PWA with heavy AI assistance (Claude Code)**
- **Why this works:** You already know React and Firebase. Zero new framework to learn. Deploy to Vercel in 30 seconds. Install on iPhone via "Add to Home Screen" — no app store, no developer account, $0.
- **Time to MVP:** 7 days (more achievable than native — no build toolchain setup)
- **Learning curve:** Very low. Tailwind is the only new tool, and it's CSS utility classes.
- **Cost:** $0/month (Vercel free tier + Firebase free tier)

### Why PWA Over Native (For Your Situation)

| Factor | Native (React Native + Expo) | PWA (React + Vite) | Winner |
|--------|------------------------------|---------------------|--------|
| **Cost to get on iPhone** | $99/year Apple Developer | $0 — "Add to Home Screen" | PWA |
| **Your learning curve** | Moderate — new RN primitives | Almost zero — it's React | PWA |
| **Dev setup time** | ~1 hour (Development Build) | 2 minutes (`npm run dev`) | PWA |
| **Deploy speed** | ~10 min cloud build | ~30 seconds to Vercel | PWA |
| **Offline workout logging** | Native Firestore cache | Firestore JS persistence + Service Worker | Tie |
| **Rest timer (screen on)** | ✅ Perfect | ✅ Perfect | Tie |
| **Rest timer (screen locked)** | ✅ Background notification | ❌ JS pauses — use clock-diff on refocus | Native |
| **Haptic feedback** | ✅ expo-haptics | ❌ Not available on iOS Safari | Native |

**The one real trade-off:** No background notification when the rest timer expires and the screen is locked. Workaround: check system clock on focus recovery and show the correct remaining time. Keep screen on during workouts (most people do).

**Escape hatch:** If you later want background notifications, all services, types, and Firebase logic port directly to React Native — only the UI components need rewriting.

### Trade-offs Acknowledged

- **No background notifications on iOS:** Timer notifications won't fire when the screen is locked. Mitigated by clock-diff recovery on focus.
- **iOS storage eviction:** Safari may purge PWA storage after ~2 weeks of inactivity. You train 3-5x/week so this won't happen. Firestore re-syncs on next launch regardless.
- **No haptic feedback:** iOS Safari doesn't support the Vibration API for PWAs. Minor UX loss.
- **"Add to Home Screen" friction:** Users must manually add the PWA via Safari share menu. Acceptable for personal use.
- **Firestore JS SDK offline is less robust than native SDK:** Works well but the native SDK's offline queue is more battle-tested. For personal use, this is a non-issue.

## Tech Stack (Detailed)

### Frontend

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | React 18 + Vite 5 | You already know React. Vite is the fastest dev server. |
| **Language** | TypeScript (strict mode) | Same as before — catches errors at compile time |
| **Routing** | React Router v6 | Standard routing for React SPAs, familiar API |
| **Styling** | Tailwind CSS 3 | Utility-first, dark mode built-in (`dark:` prefix), fast to iterate |
| **UI Components** | Custom components + Tailwind | Keeps bundle small. shadcn/ui patterns for reference. |
| **State Management** | React Context + useReducer | Same as before — sufficient for MVP |
| **PWA** | vite-plugin-pwa (Workbox) | Auto-generates Service Worker for offline static assets |

### Backend (BaaS)

| Layer | Choice | Why |
|-------|--------|-----|
| **Database** | Cloud Firestore (JS SDK v9+ modular) | Same data model. Use `enablePersistence()` for offline. |
| **Auth** | Firebase Auth (JS SDK v9+ modular) | Email/password, persistent sessions in browser |
| **Local Storage** | localStorage | Draft workouts, timer state, UI preferences. Synchronous. Simple. |
| **Cloud Functions** | Firebase Cloud Functions (post-MVP) | Same as before — streak recalculation, push notifications |

### Exercise Data

| Phase | Source | Details |
|-------|--------|---------|
| **MVP** | free-exercise-db (bundled JSON) | Same — 800+ exercises, imported at build time, cached by Service Worker |
| **Post-MVP** | ExerciseDB v2 (self-hosted on Vercel) | Same upgrade path via normalisation layer |

### Build & Deploy

| Layer | Choice | Why |
|-------|--------|-----|
| **Build** | Vite | Fast builds, tree-shaking, optimised chunks |
| **Hosting** | Vercel (free tier) | Git push = deployed. HTTPS included. Global CDN. |
| **PWA install** | Safari → Share → "Add to Home Screen" | Full-screen app experience, home screen icon, splash screen |
| **OTA Updates** | Automatic | Every Vercel deploy updates the app. Service Worker handles cache refresh. |

### Development Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **VS Code or Cursor** | Code editor | Free / $20 month |
| **Claude Code** | AI coding agent (primary) | Included in Claude subscription |
| **Chrome DevTools** | Debugging, network, Application tab for SW/storage | Free |
| **Vite dev server** | Hot module replacement, instant feedback | Free |
| **Firebase Console** | Database viewer, auth management | Free |

## Project Structure

```
liftlog/
├── public/
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   └── exercises.json            # Bundled exercise database (800+)
├── src/
│   ├── pages/                    # Route-level components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Home.tsx
│   │   ├── ActiveWorkout.tsx
│   │   ├── History.tsx
│   │   ├── WorkoutDetail.tsx
│   │   ├── ExerciseLibrary.tsx
│   │   ├── ExerciseDetail.tsx
│   │   └── Profile.tsx
│   ├── components/
│   │   ├── workout/              # Workout-specific components
│   │   │   ├── ActiveWorkoutView.tsx
│   │   │   ├── SetRow.tsx        # Single set input row (THE critical component)
│   │   │   ├── ExerciseCard.tsx
│   │   │   └── RestTimer.tsx
│   │   ├── exercises/
│   │   │   ├── ExerciseList.tsx
│   │   │   ├── ExerciseSearch.tsx
│   │   │   └── ExerciseDetailView.tsx
│   │   ├── history/
│   │   │   ├── WorkoutHistoryList.tsx
│   │   │   └── WorkoutDetailView.tsx
│   │   └── ui/                   # Shared UI primitives
│   │       ├── PRBadge.tsx
│   │       ├── SyncStatus.tsx
│   │       ├── BottomNav.tsx     # Tab bar navigation
│   │       ├── EmptyState.tsx
│   │       └── LoadingSpinner.tsx
│   ├── services/                 # Business logic — NO Firestore in components
│   │   ├── exercises/
│   │   │   ├── exerciseService.ts
│   │   │   └── normalisers.ts
│   │   ├── workouts/
│   │   │   ├── workoutService.ts
│   │   │   └── prService.ts
│   │   ├── templates/
│   │   │   └── templateService.ts
│   │   └── auth/
│   │       └── authService.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── WorkoutContext.tsx
│   │   └── TimerContext.tsx
│   ├── types/                    # TypeScript interfaces (IDENTICAL to native version)
│   │   ├── exercise.ts
│   │   ├── workout.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── calculations.ts      # 1RM Brzycki, volume calc
│   ├── lib/
│   │   └── firebase.ts          # Firebase app init + Firestore/Auth instances
│   ├── App.tsx                   # Router + providers
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind directives
├── index.html
├── vite.config.ts                # Vite + PWA plugin config
├── tailwind.config.ts
├── tsconfig.json
├── firebase.json                 # Firebase project config
├── firestore.rules               # Security rules
├── .env.local                    # Firebase config keys (not committed)
└── package.json
```

**Why this structure:**
- `services/` layer is identical to the native version — all Firestore calls isolated here
- `pages/` = route-level components, `components/` = reusable UI pieces
- `types/` are 100% the same TypeScript interfaces — no changes from the native design
- `public/exercises.json` is pre-cached by the Service Worker for offline use

## Data Model (Firestore) — NO CHANGES

The data model is identical to the native version. Firestore is backend-agnostic — same collections, same documents, same security rules.

```
users/{userId}/
  profile/                        → Single document
  exercises/{exerciseId}          → Custom exercises only
  templates/{templateId}          → Saved workout routines
  workouts/{workoutId}            → Completed workout sessions
  personalRecords/{exerciseId}    → PR data per exercise
```

All TypeScript interfaces (Exercise, Workout, WorkoutSet, Template, PersonalRecord, UserProfile) remain identical. See `agent_docs/code_patterns.md` for exact interfaces.

### Firestore Security Rules — NO CHANGES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## PWA-Specific Implementation

### Service Worker (Offline Static Assets)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'exercises.json'],
      manifest: {
        name: 'LiftLog',
        short_name: 'LiftLog',
        description: 'Gym workout tracker',
        theme_color: '#1C1B1F',
        background_color: '#1C1B1F',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'firebase-storage', expiration: { maxEntries: 100 } },
          },
        ],
      },
    }),
  ],
});
```

### Firestore Offline Persistence

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enablePersistence } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence — Firestore caches data locally
enablePersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence can only be enabled in one tab
    console.warn('Firestore persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Firestore persistence not available in this browser');
  }
});
```

### Rest Timer (Clock-Diff Recovery)

```typescript
// contexts/TimerContext.tsx — key difference from native version
// Instead of background notifications, we use system clock comparison

interface TimerState {
  isRunning: boolean;
  remaining: number;        // seconds remaining
  totalDuration: number;
  startedAt: number | null; // Date.now() when timer started — THE KEY FIELD
  exerciseId: string;
}

// On every focus/visibility change:
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && timerState.isRunning && timerState.startedAt) {
    const elapsed = Math.floor((Date.now() - timerState.startedAt) / 1000);
    const remaining = Math.max(0, timerState.totalDuration - elapsed);
    dispatch({ type: 'SYNC_TIMER', remaining });
    if (remaining === 0) {
      dispatch({ type: 'EXPIRE' });
      // Play sound if available
      try { new Audio('/timer-done.mp3').play(); } catch (e) { /* silent fail */ }
    }
  }
});
```

**How it works:** Instead of relying on `setInterval` surviving in the background (it won't), we store `startedAt` as an absolute timestamp. When the app regains focus, we calculate elapsed time from the system clock and instantly show the correct remaining time. If the timer expired while backgrounded, we show "Rest Complete!" immediately.

### Draft Persistence (localStorage)

```typescript
// Replaces react-native-mmkv — same API pattern, just localStorage
const DRAFT_KEY = 'liftlog_draft_workout';

export function saveDraft(state: WorkoutState): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

export function loadDraft(): WorkoutState | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
```

## Building Each Feature

### Feature 1: User Authentication

**Complexity:** Easy — Firebase Auth JS SDK
**Day:** 1

#### Key Difference from Native

```typescript
// services/auth/authService.ts — uses Firebase JS SDK (modular v9+)
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export const authService = {
  async signUp(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  },
  async signIn(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },
  async signOut() {
    await firebaseSignOut(auth);
  },
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
```

Everything else (AuthContext, login/signup screens, auth gating) follows the same pattern as the native version, just with HTML elements and Tailwind instead of React Native components.

### Feature 2: Exercise Library — NO LOGIC CHANGES

Same ExerciseService, same normalisation layer, same search. UI changes: `<div>` instead of `<View>`, `<input>` instead of `<TextInput>`, Tailwind classes instead of StyleSheet.

### Feature 3: Core Workout Logging — NO LOGIC CHANGES

Same WorkoutContext, same workoutService, same draft persistence pattern. The SetRow component is HTML inputs with Tailwind styling. The one-tap completion pattern works identically.

### Feature 4: Templates — NO CHANGES

Same templateService, same flows.

### Feature 5: Rest Timer — CLOCK-DIFF APPROACH

See "Rest Timer (Clock-Diff Recovery)" above. The TimerContext stores `startedAt` as absolute timestamp. Uses `visibilitychange` event to recover correct time on refocus. No background notification.

### Feature 6: History + PR Tracking — NO LOGIC CHANGES

Same workoutService queries, same prService, same Brzycki formula.

### Feature 7: Offline-First — SERVICE WORKER + FIRESTORE PERSISTENCE

1. **Static assets** — vite-plugin-pwa pre-caches all JS, CSS, HTML, and exercises.json
2. **Firestore data** — `enablePersistence()` caches Firestore documents in IndexedDB
3. **Draft workouts** — localStorage (survives page refresh and offline)
4. **Sync status** — check `snapshot.metadata.fromCache` and `hasPendingWrites`

## Development Setup

### Required Tools (Much Simpler Than Native)

1. **Node.js 18+** — runtime
2. **VS Code or Cursor** — code editor
3. **Chrome** — testing with DevTools (Application tab for Service Worker inspection)
4. **Firebase CLI** — `npm install -g firebase-tools`

No Android Studio. No Xcode. No Expo. No EAS.

### Project Initialisation (Day 1 — First 15 Minutes)

```bash
# 1. Create Vite project
npm create vite@latest liftlog -- --template react-ts
cd liftlog

# 2. Install dependencies
npm install react-router-dom firebase
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa

# 3. Configure Tailwind (add to vite.config.ts plugins)
# Add @import "tailwindcss" to src/index.css

# 4. Create .env.local with Firebase config
cat > .env.local << 'EOF'
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-id
VITE_FIREBASE_APP_ID=your-app-id
EOF

# 5. Run dev server
npm run dev
# Open http://localhost:5173 — done!
```

**That's it.** No Development Build. No cloud compilation. No native modules. Just `npm run dev`.

### Testing on iPhone During Development

During development, access your local dev server from your iPhone:

1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On iPhone Safari: go to `http://192.168.x.x:5173`
3. Test mobile layout, touch interactions, input behaviour

For production testing: deploy to Vercel (free) and open the URL on your iPhone.

## Deployment Plan

### Deploy to Vercel (30 Seconds)

```bash
# First time
npm install -g vercel
vercel

# Every subsequent deploy
vercel --prod
# Or: connect GitHub repo → auto-deploys on push
```

### Install as PWA on iPhone

1. Open your Vercel URL in Safari on iPhone
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Name it "LiftLog"
5. Tap Add

The app now has a home screen icon, launches full-screen (no Safari UI), and works offline.

### Custom Domain (Optional)

- Buy domain: ~$10/year (Namecheap, Cloudflare)
- Add to Vercel: Settings → Domains
- HTTPS automatic

## Cost Breakdown

### Development Phase

| Service | Cost | Notes |
|---------|------|-------|
| Vite + React | $0 | Open source |
| Firebase (Auth + Firestore) | $0 | Free tier: 1GB storage, 50K reads/day |
| Vercel hosting | $0 | Free tier: 100GB bandwidth/month |
| Claude Code / Cursor | $0–20/month | Optional but recommended |
| **Total** | **$0–20/month** | |

No Apple Developer fee. No Google Play fee.

### Production Phase

| Users | Monthly Cost | Notes |
|-------|-------------|-------|
| 0–100 | $0 | Everything on free tiers |
| 100–1,000 | $0–25 | May hit Firestore free tier limits |
| 1,000+ | $25–100 | Firestore paid tier |

### Scaling Triggers

| Trigger | Action |
|---------|--------|
| Vercel bandwidth > 100GB/month | Upgrade to Pro ($20/month) or use Cloudflare Pages (free) |
| Firestore reads > 50K/day | Switch to Blaze plan, set billing alerts |
| Need background notifications | Port UI to React Native, keep all services/Firebase logic |
| Want Apple Watch integration | Port to native (separate effort) |

## Important Limitations

### What This PWA CAN'T Do

1. **Background notifications** — Timer won't alert when screen is locked. Mitigated by clock-diff recovery. Most gym users keep phone screen visible between sets.

2. **Haptic feedback** — iOS Safari doesn't support vibration API. Minor UX loss. Visual feedback (animations, colour changes) compensates.

3. **iOS storage eviction** — Safari may purge PWA data after ~2 weeks of inactivity. You train 3-5x/week so this won't trigger. Firestore re-syncs everything on next launch.

4. **No app store presence** — Can't be discovered in App Store. Not relevant for personal use.

### When You'd Upgrade to Native

| Trigger | Action |
|---------|--------|
| Background timer notification is essential | Port to React Native (UI rewrite, services stay) |
| Want Apple Watch companion | React Native + WatchKit (separate codebase) |
| Want App Store distribution | React Native + $99/year Apple Developer |
| Need push notifications for social features | React Native for reliability |

## Security Considerations

- **Firestore Security Rules** — identical to native version
- **Environment variables** — `VITE_` prefix means they're in the client bundle (this is expected for Firebase public config — API keys are safe to expose, security is enforced by Firestore Rules)
- **HTTPS** — Vercel provides it automatically, required for Service Worker
- **No PII beyond email** — same as native
- **localStorage** — draft workouts stored on-device only

## Quality Gates

### Before Calling MVP "Done"

**Functional:**
- [ ] All 8 P0 features work end-to-end
- [ ] Logging a set takes ≤15 seconds
- [ ] PR detection correctly identifies new records
- [ ] Templates pre-fill exercises correctly

**Offline:**
- [ ] Full workout logged in airplane mode → syncs on reconnect
- [ ] Exercise library browsable offline (Service Worker caches exercises.json)
- [ ] Draft workout recoverable after page refresh
- [ ] Timer recovers correct time after tab switch / screen lock

**PWA:**
- [ ] "Add to Home Screen" works on iPhone Safari
- [ ] App launches in standalone mode (no Safari UI)
- [ ] Service Worker registered and caching static assets
- [ ] App icon and splash screen display correctly
- [ ] Works on Chrome (Android) and Safari (iOS)

**Quality:**
- [ ] No `any` types in TypeScript
- [ ] All Firestore calls go through service layer
- [ ] Exercise data accessed through ExerciseService normalisation layer
- [ ] Dark mode consistent across all screens
- [ ] Touch targets minimum 44×44px
- [ ] Empty states for all lists
- [ ] Loading states for all async operations

**Deployment:**
- [ ] Deployed to Vercel
- [ ] Firestore Security Rules deployed
- [ ] 3+ personal workout sessions completed

---
*Technical Design for: LiftLog MVP (PWA)*
*Approach: React + Vite + Tailwind + Firebase PWA*
*Estimated Time to MVP: 7 days*
*Estimated Cost: $0–20/month (no app store fees)*
*Based on: PRD-LiftLog-MVP.md + gym-tracker-research.md*
*Updated: February 2026 — switched from React Native to PWA*
