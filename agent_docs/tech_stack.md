# Tech Stack & Tools

## Core Framework
- **React 19** — UI framework (automatic JSX transform — no `import React` needed)
- **Vite 7** — Build tool + dev server (HMR, fast builds, tree-shaking)
- **TypeScript 5.9** — Strict mode (`"strict": true` in tsconfig.json), no `any` types

## Routing
- **React Router v7** (library mode — uses BrowserRouter/Routes/Route pattern)
  - Pages directory: `src/pages/`
  - Auth pages: Login.tsx, Signup.tsx
  - Main pages: Home.tsx, ActiveWorkout.tsx, History.tsx, WorkoutDetail.tsx, ExerciseLibrary.tsx, ExerciseDetail.tsx, Profile.tsx
  - Route protection via AuthContext (redirect to /login if not authenticated)

## Styling
- **Tailwind CSS 4** — utility-first CSS framework (CSS-first configuration)
  - Dark mode: app is dark-first — colours defined as CSS custom properties in `:root`, no `dark:` prefix needed
  - No `tailwind.config.ts` — Tailwind v4 uses `@theme` block in `src/index.css` instead
  - No inline styles, no CSS modules, no styled-components
  - All colours via CSS custom properties defined in index.css + registered in `@theme` block
  - Install: `npm install -D tailwindcss @tailwindcss/vite`
  - Add `@import "tailwindcss"` to `src/index.css`

## State Management
- **React Context + useReducer** — Global state for:
  - `AuthContext` — current user, auth loading state
  - `WorkoutContext` — active workout exercises, sets, timing
  - `TimerContext` — rest timer countdown, clock-diff recovery
- **No external state library** — Context + useReducer is sufficient for this scale

## Backend & Database

### Firebase Auth (JS SDK v9+ modular)
```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
```
- Email/password authentication
- Persistent sessions (default in browser — uses IndexedDB)
- Install: included in `firebase` package

### Cloud Firestore (JS SDK v9+ modular)
```typescript
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
```
- Document-based NoSQL database
- Offline persistence via `initializeFirestore` with `persistentLocalCache` — caches in IndexedDB
- Install: included in `firebase` package

### CRITICAL: Use modular imports (v9+), NOT compat
```typescript
// ✅ Correct — modular, tree-shakable
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// ❌ Wrong — compat, larger bundle, deprecated pattern
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
```

## Local Storage
- **localStorage** — Synchronous key-value store (built into browser)
  - Use for: draft workouts, timer state, UI preferences
  - Usage:
    ```typescript
    localStorage.setItem('key', JSON.stringify(data));
    const value = JSON.parse(localStorage.getItem('key') || 'null');
    ```
  - Limits: ~5MB per origin (more than enough for drafts)

## PWA (Progressive Web App)
- **vite-plugin-pwa** — Auto-generates Service Worker via Workbox
  - Pre-caches all static assets (JS, CSS, HTML, JSON, icons)
  - `registerType: 'autoUpdate'` — new deploys update automatically
  - Install: `npm install -D vite-plugin-pwa`
  - Manifest configured in vite.config.ts (app name, icons, theme colour, display: standalone)

## Exercise Data
- **MVP:** `free-exercise-db` — 800+ exercises, placed in `public/exercises.json`
  - Source: https://github.com/yuhonas/free-exercise-db
  - Licence: Public domain
  - Pre-cached by Service Worker — works offline
- **Post-MVP upgrade:** ExerciseDB v2 — 11,000+ exercises with GIFs/videos
  - Self-hosted on Vercel
  - Swap via ExerciseService normalisation layer (2–4 hour effort)

## Charts (Post-MVP)
- **Recharts** or **Chart.js** — when progress charts are needed
  - Install when needed: `npm install recharts` or `npm install chart.js react-chartjs-2`

## Build & Deploy
- **Vite** — `npm run build` → optimised production bundle in `dist/`
- **Vercel** — `vercel --prod` or auto-deploy on git push
  - Free tier: 100GB bandwidth/month, HTTPS, global CDN
  - Custom domain supported ($0 if you have one)

## Development Tools
- **VS Code or Cursor** — Code editor with AI
- **Claude Code** — Primary AI coding agent
- **Chrome DevTools** — Debugging, mobile emulation, Application tab for Service Worker + localStorage inspection
- **Firebase Console** — Database viewer, auth management

## Commands Reference
```bash
# Development
npm run dev                             # Start Vite dev server (localhost:5173)
npm run build                           # Production build → dist/
npm run preview                         # Preview production build locally

# Type checking
npx tsc --noEmit                        # Check types without emitting JS

# Firebase
firebase login                          # Authenticate CLI (one-time, opens browser)
firebase deploy --only firestore:rules  # Deploy security rules

# Deployment
vercel                                  # Deploy to preview URL
vercel --prod                           # Deploy to production

# Dependency management
npm install [package]                   # Add runtime dependency
npm install -D [package]               # Add dev dependency
```

## Firebase Configuration
```typescript
// .env.local (NOT committed to git)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=liftlog-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=liftlog-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=liftlog-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
```

## Key Configuration Files

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['exercises.json', 'icons/*.png'],
      manifest: {
        name: 'LiftLog',
        short_name: 'LiftLog',
        theme_color: '#1C1B1F',
        background_color: '#1C1B1F',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

```json
// tsconfig.json (key settings)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```
