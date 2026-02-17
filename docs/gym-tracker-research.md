# Gym Workout Tracker — Deep Research Report

*Compiled: February 2026 | Target: Junior developer, React ecosystem, 1-week MVP*

---

## Table of Contents

1. [Competitor Feature Matrix](#1-competitor-feature-matrix)
2. [Exercise Database Comparison & Strategy](#2-exercise-database-comparison--strategy)
3. [Recommended Tech Stack](#3-recommended-tech-stack)
4. [Data Model Design](#4-data-model-design)
5. [Charting Library Comparison](#5-charting-library-comparison)
6. [Offline-First Architecture Guide](#6-offline-first-architecture-guide)
7. [Streak & Calendar System Design](#7-streak--calendar-system-design)
8. [MVP Feature Prioritisation](#8-mvp-feature-prioritisation)
9. [1-Week Development Roadmap](#9-1-week-development-roadmap)
10. [Budget Forecast](#10-budget-forecast)

---

## 1. Competitor Feature Matrix

### Feature Comparison

| Feature | Strong | Hevy | JEFIT | FitNotes |
|---|---|---|---|---|
| **Platform** | iOS, Android, Apple Watch | iOS, Android, Wear OS | iOS, Android, Apple Watch | Android only |
| **Pricing** | Free (3 routines) / $29.99/yr or $99.99 lifetime | Free (generous) / ~$36/yr premium | Free w/ ads / ~$70/yr Elite | Completely free, no ads |
| **Exercise Library** | Large, built-in descriptions + muscle diagrams | Large, video demos | 1,400+ exercises w/ video | Moderate, user-extensible |
| **Custom Exercises** | Yes (Pro) | Yes (Premium) | Yes | Yes (free) |
| **Workout Templates** | Yes (3 free, unlimited Pro) | Yes (4 free, unlimited premium) | 2,500+ community routines | Yes (unlimited free) |
| **Rest Timer** | Auto countdown, customizable per exercise | Yes, customizable | Yes | Yes |
| **Supersets** | Yes | Yes | Yes | Limited |
| **PR Tracking** | Auto-detect, notifications | Auto-detect, trophy alerts | Yes, with analytics | Yes |
| **Volume Tracking** | Total volume per session + over time | Volume charts, session totals | Detailed volume analytics | Basic volume tracking |
| **Progress Charts** | 1RM + Volume (Pro only) | 1RM, volume, body weight | Extensive analytics suite | Charts included free |
| **Body Measurements** | Weight + body parts | Weight + body parts (Premium) | Weight, BMI, body parts, photos | Weight tracking |
| **Data Export** | CSV | CSV | CSV | CSV + database backup |
| **Cloud Sync** | Yes | Yes | Yes | No (local only) |
| **Social Features** | Workout sharing | Social feed, follow friends, like/comment | Community challenges, shared routines | None |
| **Offline Support** | Full offline logging | Full offline logging | Full offline logging | Fully offline (no cloud) |
| **Apple Health / Google Fit** | Yes | Yes | Yes | Google Fit only |
| **Plate Calculator** | Yes (Pro) | No | Yes | No |
| **Warm-up Calculator** | Yes | No | No | No |
| **RPE Tracking** | Yes | Yes | No | No |
| **Unit Switching** | lbs / kg, auto-convert history | lbs / kg | lbs / kg | lbs / kg |

### User Sentiment Summary

**Strong** — Users universally praise its clean, minimal interface and fast logging. Lifehacker, CNET, and The Guardian have all recommended it. Common complaints include the paywall for charts/unlimited routines, no built-in workout programming or guidance, and an interface some feel is "dated" compared to newer competitors. Over 3 million downloads. Reddit communities (r/fitness, r/weightroom) frequently recommend it for experienced lifters who build their own programs.

**Hevy** — The rising challenger. Users love the generous free tier, modern UI, social feed, and PR celebrations. One Reddit user noted Hevy has "a slightly better free tier, nicer UI, more free templates, better device integrations" than Strong. Rapidly growing with active development. Weaknesses include fewer advanced metrics for periodisation and the social features can feel distracting to some.

**JEFIT** — The veteran all-in-one platform. Its 1,400+ exercise library with videos is unmatched. Reviewers praise the depth but consistently criticise the cluttered, dated interface and aggressive advertising in the free tier. The $70/year Elite pricing is steep. Best suited for users who want extensive community routines and don't mind the learning curve.

**FitNotes** — The community favourite for simplicity. Entirely free with no ads — a passion project by a solo developer. Reddit's r/Fitness frequently recommends it for Android users who want a "fancy diary" without distractions. No cloud sync is the major limitation; data lives on-device only.

### Key Gaps and Opportunities

- **No competitor does streak/calendar gamification well.** None of these apps offer a GitHub-style contribution graph or split-aware streak tracking. This is your primary differentiator.
- **Offline-first is table stakes** — all major competitors support it. You must too.
- **Social features are polarising.** Hevy users love them; Strong/FitNotes users actively avoid them. Consider making social optional/future.
- **Guided programming** is a gap in Strong/FitNotes. AI-generated workout suggestions could be a future differentiator, but skip for MVP.
- **Fast logging UX is the #1 feature.** Every successful tracker prioritises speed. If logging a set takes more than 10–15 seconds, users will abandon the app.

---

## 2. Exercise Database Comparison & Strategy

### Decision: Start with Static 800, Architect for Easy Upgrade

**MVP (Week 1):** Bundle the `free-exercise-db` dataset (800+ exercises, public domain, JSON format) directly into the app as a static asset. Zero API dependency, fully offline from first launch, no rate limits, no cost.

**Post-MVP upgrade:** Swap to ExerciseDB v2 (11,000+ exercises with animated GIFs, videos, coaching tips) by self-hosting on Vercel. The architecture below makes this a few hours of work — change one data source, zero component changes.

### Database Comparison

| Database | Exercises | Media | License | Cost | Notes |
|---|---|---|---|---|---|
| **free-exercise-db** (yuhonas/GitHub) | 800+ | 2 static images per exercise (start/end position) | **Unlicense (public domain)** | Free | Clean JSON, easy to bundle, no restrictions |
| **ExerciseDB v1** (RapidAPI) | ~1,300 | Animated GIFs | AGPL-3.0 | Free tier (limited calls), paid plans | Popular with tutorial projects, rate-limited |
| **ExerciseDB v2** (GitHub, self-host) | 11,000+ | Images, GIFs, videos | AGPL-3.0 | Free (self-hosted on Vercel) | Best long-term option, one-click Vercel deploy |
| **wger API** | ~400 | Some images (CC-BY-SA) | AGPL-3.0 + CC-BY-SA 3.0 | Free (self-host or public API) | Multilingual, but smallest dataset |

### What Each Dataset Actually Contains

**free-exercise-db record example:**

```json
{
  "id": "Alternate_Incline_Dumbbell_Curl",
  "name": "Alternate Incline Dumbbell Curl",
  "force": "pull",
  "level": "beginner",
  "mechanic": "isolation",
  "equipment": "dumbbell",
  "primaryMuscles": ["biceps"],
  "secondaryMuscles": ["forearms"],
  "instructions": ["Sit down on an incline bench with a dumbbell in each hand..."],
  "category": "strength",
  "images": ["Alternate_Incline_Dumbbell_Curl/0.jpg", "Alternate_Incline_Dumbbell_Curl/1.jpg"]
}
```

**ExerciseDB v2 record example:**

```json
{
  "exerciseId": "K6NnTv0",
  "name": "Bench Press",
  "imageUrl": "Barbell-Bench-Press_Chest.png",
  "equipments": ["Barbell"],
  "bodyParts": ["Chest"],
  "exerciseType": "weight_reps",
  "targetMuscles": ["Pectoralis Major Clavicular Head"],
  "secondaryMuscles": ["Deltoid Anterior", "Triceps Brachii"],
  "videoUrl": "Barbell-Bench-Press_Chest_.mp4",
  "keywords": ["Chest workout with barbell", "Barbell bench press exercise"],
  "overview": "The Bench Press is a classic strength training exercise...",
  "instructions": ["Grip the barbell with your hands slightly wider..."],
  "exerciseTips": ["Avoid Arching Your Back: One common mistake..."]
}
```

### Field-by-Field Comparison

| Field | free-exercise-db (800) | ExerciseDB v2 (11,000+) | MVP Essential? |
|---|---|---|---|
| Exercise name | ✅ | ✅ | Yes |
| Primary muscles | ✅ (generic: "biceps") | ✅ (precise: "Pectoralis Major Clavicular Head") | Generic is fine for MVP |
| Secondary muscles | ✅ | ✅ | Nice to have |
| Equipment | ✅ (sometimes null) | ✅ | Yes — for filtering |
| Instructions | ✅ (text steps) | ✅ (text steps) | Yes — form reference |
| Tips / common mistakes | ❌ | ✅ | Nice to have |
| Force (push/pull) | ✅ (sometimes null) | ❌ | Useful for PPL filtering |
| Level (beginner/etc.) | ✅ | ❌ | Useful for filtering |
| Mechanic (compound/isolation) | ✅ (sometimes null) | ❌ | Useful for programming |
| Category (strength/cardio) | ✅ | ✅ (`exerciseType`) | Yes — for logging mode |
| Static images | ✅ (2 per exercise) | ✅ | Yes — visual reference |
| Animated GIF | ❌ | ✅ | **Big UX upgrade, not MVP-critical** |
| Video | ❌ | ✅ | Big UX upgrade, not MVP-critical |
| Keywords / synonyms | ❌ | ✅ | Improves search, not essential |
| Overview text | ❌ | ✅ | Nice context, not essential |

**Key insight:** The datasets are complementary, not a strict superset. free-exercise-db has `force`, `level`, and `mechanic` fields that ExerciseDB lacks. An ideal long-term library merges both (match by exercise name, enrich ExerciseDB records with the extra free-exercise-db fields).

### Architecture for Easy Upgrade

The exercise database is a **read-only data source** — your app only consumes it, never writes to it. This makes swapping trivial as long as you normalise the data at the boundary.

**Step 1: Define one internal Exercise type (used everywhere in the app)**

```typescript
// types/exercise.ts — your app's canonical format
interface Exercise {
  id: string;
  name: string;
  bodyPart: string;            // normalised: "chest", "back", "legs", "arms", "shoulders", "core"
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;           // "barbell", "dumbbell", "bodyweight", "machine", "cable"
  category: string;            // "strength", "cardio", "stretching"
  instructions: string[];
  tips?: string[];             // ExerciseDB only (initially)
  level?: string;              // free-exercise-db only: "beginner", "intermediate", "advanced"
  force?: string;              // free-exercise-db only: "push", "pull", "static"
  mechanic?: string;           // free-exercise-db only: "compound", "isolation"
  imageUrls: string[];         // static images
  gifUrl?: string;             // animated demonstration (ExerciseDB only, initially)
  videoUrl?: string;           // video (ExerciseDB only, initially)
  source: "built-in" | "custom";
  userId?: string;             // null for built-in, user ID for custom exercises
}
```

**Step 2: Write a normaliser for each data source**

```typescript
// services/exercises/normalisers.ts

function normaliseFromFreeDb(raw: FreeExerciseDbEntry): Exercise {
  return {
    id: raw.id,
    name: raw.name,
    bodyPart: normaliseMuscleToBodyPart(raw.primaryMuscles[0]),
    primaryMuscles: raw.primaryMuscles,
    secondaryMuscles: raw.secondaryMuscles,
    equipment: raw.equipment ?? "bodyweight",
    category: raw.category,
    instructions: raw.instructions,
    level: raw.level,
    force: raw.force,
    mechanic: raw.mechanic,
    imageUrls: raw.images.map(
      img => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`
    ),
    source: "built-in",
  };
}

function normaliseFromExerciseDb(raw: ExerciseDbEntry): Exercise {
  return {
    id: raw.exerciseId,
    name: raw.name,
    bodyPart: raw.bodyParts[0]?.toLowerCase() ?? "other",
    primaryMuscles: raw.targetMuscles,
    secondaryMuscles: raw.secondaryMuscles,
    equipment: raw.equipments[0]?.toLowerCase() ?? "bodyweight",
    category: mapExerciseType(raw.exerciseType), // "weight_reps" → "strength"
    instructions: raw.instructions,
    tips: raw.exerciseTips,
    imageUrls: raw.imageUrl ? [raw.imageUrl] : [],
    gifUrl: raw.imageUrl,
    videoUrl: raw.videoUrl,
    source: "built-in",
  };
}

function normaliseMuscleToBodyPart(muscle: string): string {
  const mapping: Record<string, string> = {
    "chest": "chest",
    "biceps": "arms", "triceps": "arms", "forearms": "arms",
    "lats": "back", "middle back": "back", "lower back": "back", "traps": "back",
    "quadriceps": "legs", "hamstrings": "legs", "calves": "legs", "glutes": "legs",
    "shoulders": "shoulders",
    "abdominals": "core", "obliques": "core",
    "neck": "other",
  };
  return mapping[muscle.toLowerCase()] ?? "other";
}
```

**Step 3: Build an ExerciseService that all components call**

```typescript
// services/exercises/exerciseService.ts
import freeDbData from "../../assets/exercises.json";

class ExerciseService {
  private exercises: Exercise[] = [];
  private loaded = false;

  async loadExercises(): Promise<void> {
    if (this.loaded) return;

    // === MVP: load from bundled JSON ===
    this.exercises = freeDbData.map(normaliseFromFreeDb);

    // === POST-MVP: swap to this instead (uncomment) ===
    // const res = await fetch("https://your-exercisedb.vercel.app/api/v1/exercises");
    // const data = await res.json();
    // this.exercises = data.map(normaliseFromExerciseDb);

    this.loaded = true;
  }

  search(query: string): Exercise[] {
    const q = query.toLowerCase();
    return this.exercises.filter(
      ex => ex.name.toLowerCase().includes(q)
        || ex.bodyPart.includes(q)
        || ex.primaryMuscles.some(m => m.toLowerCase().includes(q))
        || ex.equipment.toLowerCase().includes(q)
    );
  }

  getByBodyPart(bodyPart: string): Exercise[] {
    return this.exercises.filter(ex => ex.bodyPart === bodyPart);
  }

  getById(id: string): Exercise | undefined {
    return this.exercises.find(ex => ex.id === id);
  }
}

export const exerciseService = new ExerciseService();
```

**The swap is literally uncommenting two lines and commenting out one.** Your exercise list screen, search, workout logger, history views — nothing changes. They all consume `Exercise` objects from `exerciseService`.

**Step 4: Protect historical workout data across the swap**

When you swap data sources, built-in exercise IDs change (free-exercise-db uses `Alternate_Incline_Dumbbell_Curl`, ExerciseDB uses `K6NnTv0`). This is already handled by the data model design — every logged workout stores `exerciseName` denormalised alongside `exerciseId`. Historical workouts display correctly regardless of which library is active:

```typescript
function resolveExercise(exerciseId: string, exerciseName: string): Exercise | null {
  // Try exact ID match first
  const byId = exerciseService.getById(exerciseId);
  if (byId) return byId;

  // Fallback: fuzzy name match (handles data source swaps)
  const byName = exerciseService.search(exerciseName);
  if (byName.length === 1) return byName[0];

  // No match — exercise was custom or removed. Display with stored name.
  return null;
}
```

### Post-MVP Migration Checklist

When ready to upgrade from the static 800 to ExerciseDB (recommended timing: month 2):

1. **Self-host ExerciseDB v2 on Vercel** — one-click deploy from the GitHub repo. Gives you the full 11,000+ dataset as your own API with no rate limits.
2. **Update `exerciseService.loadExercises()`** — swap the data source (two lines of code).
3. **Optionally merge datasets** — match exercises by name between free-exercise-db and ExerciseDB, enrich ExerciseDB records with `force`, `level`, and `mechanic` fields that only the static dataset has.
4. **Update exercise detail UI** — add GIF/video display components (these can be optional renders that only show when `gifUrl`/`videoUrl` exist, so the UI already works with the static data).
5. **Ship an app update** — users see the same exercises plus thousands more, with animated demos and videos. Workout history, PRs, and custom exercises are completely unaffected.

**Estimated effort:** 2–4 hours for the basic swap, an additional half-day if merging field data from both sources.

### Custom Exercise Integration

Custom exercises use the same `Exercise` type with `source: "custom"` and the user's ID. They're stored in Firestore (`users/{userId}/exercises/{exerciseId}`) and merged into the exercise service at load time:

```typescript
async loadExercises(userId: string): Promise<void> {
  // Load built-in exercises (from bundled JSON or ExerciseDB API)
  const builtIn = freeDbData.map(normaliseFromFreeDb);

  // Load user's custom exercises from Firestore
  const snap = await firestore()
    .collection("users").doc(userId)
    .collection("exercises").get();
  const custom = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));

  // Merge: custom exercises appear alongside built-in
  this.exercises = [...builtIn, ...custom];
  this.loaded = true;
}
```

**Important note on ExerciseDB:** The v2 API docs warn that public playground endpoints have "strict rate limits and potential instability" and are "not recommended for production integration." Always self-host for production use. The v1 API via RapidAPI has free and paid tiers but introduces an external dependency.

### Image Hosting Strategy

**MVP:** Load images from GitHub's CDN at runtime (`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{path}`). Avoids bundling ~100 MB of images into the app binary. Consider caching with `expo-image` for offline access after first load.

**Post-MVP:** ExerciseDB v2 self-hosted on Vercel serves its own images/GIFs/videos. Alternatively, use a CDN like ImageKit or Cloudflare Images for dynamic resizing and format optimisation (WebP on supported devices, smaller thumbnails for list views, full-size for detail views).

---

## 3. Recommended Tech Stack

### Primary Recommendation: React Native + Expo + Firebase

| Layer | Technology | Justification |
|---|---|---|
| **Framework** | React Native with Expo (SDK 53+) | Closest to your React skills. Expo simplifies builds, OTA updates, and native module access. Write once, deploy iOS + Android. |
| **Backend / BaaS** | Firebase (Firestore + Auth) | You already know Firebase. Firestore has built-in offline persistence. Auth is turnkey. Free tier is generous for MVP. |
| **Native Firebase SDK** | `@react-native-firebase/*` | As of Expo SDK 53, the Firebase JS SDK has compatibility issues with Auth. Use React Native Firebase (native SDK) for reliable offline support and better performance. Requires Expo Development Build (not Expo Go). |
| **Local Storage (fast)** | `react-native-mmkv` | For user preferences, cached UI state, and timer data. 20x faster than AsyncStorage. |
| **State Management** | React Context + `useReducer` | Sufficient for workout logging. Avoids Redux complexity. Zustand is a lightweight alternative if you need more. |
| **Navigation** | Expo Router (file-based) | Built into Expo, similar to Next.js. Convention-based routing reduces boilerplate. |
| **Charts** | `react-native-gifted-charts` | Best balance of features, maintenance, and Expo compatibility. See Section 5. |
| **UI Components** | React Native Paper or Tamagui | Material Design components that work well on both platforms. |

### Why Not the Alternatives?

**Flutter:** Excellent framework, but requires learning Dart. Given your React/TypeScript background and 1-week timeline, the context-switching cost is too high. Flutter would be a strong choice for a future rebuild.

**PWA (Progressive Web App):** Tempting because you already know React for web. However, PWAs have critical limitations for a gym tracker: no reliable background timers (rest timer would stop when screen locks), limited offline storage compared to native, no haptic feedback, and poor performance perception. Native apps from Strong/Hevy/JEFIT set the expectation. A PWA would feel inferior.

**Supabase vs Firebase:** Supabase is excellent (PostgreSQL, SQL queries, open-source, predictable pricing). However, Firebase wins for your specific situation because you already know it, Firestore's offline persistence is mature and battle-tested for mobile, and the NoSQL document model maps naturally to workout data (sessions with nested sets). If you were starting with SQL experience and cared about avoiding vendor lock-in, Supabase would be the better choice. Keep it as a migration option.

### Critical Setup Decision: Expo Development Build

Since Expo SDK 53, the Firebase JS SDK has Auth compatibility issues on mobile. You must use `@react-native-firebase/*` (native SDK), which requires an Expo Development Build rather than Expo Go.

```bash
# Project setup
npx create-expo-app gym-tracker --template blank-typescript
cd gym-tracker

# Install React Native Firebase
npx expo install @react-native-firebase/app
npx expo install @react-native-firebase/auth
npx expo install @react-native-firebase/firestore

# Install other essentials
npx expo install react-native-mmkv
npx expo install react-native-gifted-charts react-native-svg expo-linear-gradient

# Build development client (replaces Expo Go)
npx expo run:android  # or npx expo run:ios
```

---

## 4. Data Model Design

### Firestore Collection Structure

```
users/
  {userId}/
    profile: { displayName, units, timezone, createdAt }
    
    exercises/
      {exerciseId}: {
        name, bodyPart, targetMuscles[], equipment,
        source: "built-in" | "custom",
        instructions?, imageUrl?,
        createdAt
      }
    
    templates/
      {templateId}: {
        name: "Push Day",
        splitType: "PPL" | "531" | "custom",
        exercises: [
          { exerciseId, targetSets, targetReps, restSeconds }
        ],
        createdAt, updatedAt
      }
    
    workouts/
      {workoutId}: {
        templateId?,
        startedAt: Timestamp,
        completedAt: Timestamp,
        durationSeconds: number,
        notes?: string,
        exercises: [
          {
            exerciseId,
            exerciseName,   // denormalized for offline/speed
            sets: [
              {
                setNumber: 1,
                weight: 100,       // in user's preferred unit
                reps: 8,
                type: "working" | "warmup" | "dropset" | "failure",
                rpe?: number,
                completed: true
              }
            ]
          }
        ]
      }
    
    personalRecords/
      {exerciseId}: {
        maxWeight: { value, date, workoutId },
        max1RM: { value, date, workoutId },
        maxVolume: { value, date, workoutId },
        history: [
          { date, weight, reps, estimated1RM }
        ]
      }
    
    bodyMetrics/
      {date_YYYY-MM-DD}: {
        weight?: number,
        bodyFat?: number,
        measurements?: {
          chest?, waist?, hips?, bicepL?, bicepR?,
          thighL?, thighR?, neck?, shoulders?
        },
        notes?: string,
        date: Timestamp
      }
    
    streakData/
      current: {
        currentStreak: number,
        longestStreak: number,
        lastWorkoutDate: string,    // "YYYY-MM-DD"
        splitConfig: {
          type: "PPL" | "UL" | "bro" | "custom",
          daysOn: 6,
          daysOff: 1,
          restDaysPerWeek: 1
        }
      }
      calendar/
        {YYYY-MM}: {
          days: {
            "01": { status: "workout" | "rest" | "missed", workoutId? },
            "02": { status: "rest" },
            ...
          }
        }
```

### Key Design Decisions

**Denormalized exercise names in workouts:** Firestore queries can't join collections. Storing `exerciseName` directly in each workout entry means the workout history screen loads without additional reads. This is critical for offline performance.

**PR tracking as a separate subcollection:** Calculating PRs by scanning all historical workouts would be expensive. Instead, update the `personalRecords` document after each completed workout. This gives O(1) reads for "what's my bench PR?"

**Calendar data by month:** Grouping streak/calendar data into monthly documents keeps each document small while allowing efficient queries for the calendar view ("show me January 2026").

### Volume Calculation Logic

```typescript
// Volume per set
const setVolume = set.weight * set.reps;

// Volume per exercise (in a session)
const exerciseVolume = exercise.sets
  .filter(s => s.type === "working" && s.completed)
  .reduce((sum, s) => sum + s.weight * s.reps, 0);

// Total session volume
const sessionVolume = workout.exercises
  .reduce((sum, ex) => sum + calculateExerciseVolume(ex), 0);

// Estimated 1RM (Brzycki formula)
const estimated1RM = weight * (36 / (37 - reps)); // valid for reps <= 10
```

---

## 5. Charting Library Comparison

| Library | Chart Types | Expo Support | Animations | Maintenance | Bundle Size | Best For |
|---|---|---|---|---|---|---|
| **react-native-gifted-charts** ⭐ | Line, bar, area, pie, donut, stacked bar, radar, bubble | Full (Expo Go + native) | Smooth, LayoutAnimation | Actively maintained (updated Apr 2025) | Moderate | **Best all-rounder; recommended** |
| **Victory Native** | Line, bar, pie, scatter, area, + composable | Full | 100+ FPS, Skia-based | Maintained by Nearform (formerly Formidable) | Moderate–large | Cross-platform consistency, advanced customisation |
| **react-native-chart-kit** | Line, bar, pie, progress ring, contribution graph (heatmap!) | Full (Expo Go) | Basic bezier | Less actively maintained | Small | Quick setup, built-in contribution graph |
| **react-native-svg (D3 custom)** | Anything (manual) | Full | Custom (complex) | react-native-svg is stable | Minimal | Full control, steep learning curve |

### Recommendation for Your Charts

| Chart Need | Library | Why |
|---|---|---|
| **PR graph** (1RM over time) | `react-native-gifted-charts` LineChart | Scrollable, tooltips, smooth bezier curves |
| **Volume per session** (bar chart over time) | `react-native-gifted-charts` BarChart | Clear comparison, supports stacked bars by muscle group |
| **Body weight trends** | `react-native-gifted-charts` LineChart | Area fill shows trend direction clearly |
| **Calendar heatmap** (streak view) | Custom component using `react-native-svg` OR `react-native-chart-kit` ContributionGraph | The ContributionGraph in chart-kit is a quick GitHub-style heatmap. For full customisation, build with SVG. |

**Setup for react-native-gifted-charts:**

```bash
npx expo install react-native-gifted-charts react-native-svg expo-linear-gradient
```

```tsx
import { LineChart } from "react-native-gifted-charts";

const PRGraph = ({ data }) => (
  <LineChart
    data={data.map(d => ({ value: d.weight, label: d.date }))}
    curved
    color="#4A90D9"
    thickness={2}
    hideDataPoints={false}
    dataPointsColor="#4A90D9"
    yAxisTextStyle={{ color: "#999" }}
    xAxisLabelTextStyle={{ color: "#999", fontSize: 10 }}
    scrollToEnd
    isAnimated
  />
);
```

**For the calendar heatmap specifically,** consider `@symbiot.dev/react-native-heatmap` — a newer library built for React Native that supports iOS, Android, Web, and Expo, with theming and date-awareness built in. Alternatively, `react-native-chart-kit`'s `ContributionGraph` component provides a quick GitHub-style heatmap out of the box.

---

## 6. Offline-First Architecture Guide

### Strategy: Firestore Native SDK + MMKV Hybrid

Gym environments typically have poor cellular signal and unreliable Wi-Fi. Your app must function fully offline and sync transparently when connectivity returns.

**Architecture Overview:**

```
┌─────────────────────────────────────┐
│          React Native App           │
├─────────────┬───────────────────────┤
│   MMKV      │    Firestore SDK      │
│  (fast)     │  (offline cache)      │
│             │                       │
│ • Timer     │ • Workouts            │
│ • UI state  │ • Exercises           │
│ • Prefs     │ • Templates           │
│ • Draft set │ • PRs                 │
│   data      │ • Body metrics        │
│             │ • Streak data         │
├─────────────┴───────────────────────┤
│       Network Available?            │
│  Yes → Firestore syncs to cloud    │
│  No  → Writes queued in local cache │
└─────────────────────────────────────┘
```

### Implementation with @react-native-firebase/firestore

Firestore's native SDK (via React Native Firebase) has built-in offline persistence **enabled by default** on mobile. When the device is offline, reads serve from the local cache, writes are queued locally, and when connectivity returns, all pending writes sync to the server automatically using a last-write-wins strategy.

```typescript
// firebaseConfig.ts
import firestore from '@react-native-firebase/firestore';

// Offline persistence is ON by default for native SDK.
// Configure cache size (default 100MB, -1 for unlimited)
firestore().settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});
```

```typescript
// Writing data works identically online and offline
async function saveWorkout(userId: string, workout: Workout) {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('workouts')
    .add({
      ...workout,
      completedAt: firestore.FieldValue.serverTimestamp(),
    });
  // If offline, this write is cached and synced later.
  // serverTimestamp() resolves to actual server time on sync.
}
```

### Conflict Resolution

Firestore uses **last-write-wins** for conflicts. For a single-user workout tracker, conflicts are rare (you're only writing from one device at a time). If you add multi-device support later, consider these strategies:

- **Workout sessions:** Each session has a unique ID and is typically written from one device. Conflicts are unlikely.
- **PR records:** Use Firestore transactions to ensure PRs are only updated if the new value is higher.
- **Streak data:** Use server timestamps and Cloud Functions to reconcile if needed.

### MMKV for Fast Local State

Use MMKV for data that needs instant read/write without Firestore overhead:

```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Save active workout timer state
storage.set('activeTimer.remaining', 90);
storage.set('activeTimer.exerciseId', 'bench-press');

// Read instantly (synchronous, < 1ms)
const remaining = storage.getNumber('activeTimer.remaining');

// Save draft set data (in case app crashes mid-workout)
storage.set('draftWorkout', JSON.stringify(currentWorkout));
```

### Key Offline Patterns

1. **Optimistic UI:** Update the UI immediately on user action. Don't wait for Firestore confirmation. The native SDK handles this automatically — `onSnapshot` listeners fire with local changes before server sync.

2. **Draft workout persistence:** Save the in-progress workout to MMKV every time the user logs a set. If the app crashes or is killed, the workout can be recovered on next launch.

3. **Pending indicator:** Show a subtle sync status indicator. Use `firestore().waitForPendingWrites()` or check `snapshot.metadata.hasPendingWrites` to know when data has synced.

4. **Initial data load:** Bundle the exercise database as a JSON asset in the app. Don't require a network fetch for first launch.

---

## 7. Streak & Calendar System Design

### Core Concepts

A streak system for a workout tracker needs to account for the user's training split. Unlike Duolingo (where every day is an "on" day), a gym streak should understand that rest days are part of the plan.

### Data Model

```typescript
interface SplitConfig {
  type: "PPL" | "UL" | "fullBody" | "bro" | "custom";
  daysOn: number;          // e.g., 6 for PPL
  daysOff: number;         // e.g., 1 for PPL
  maxRestDaysPerWeek: number;
  scheduledRestDays?: number[];  // 0=Sun, 6=Sat (optional)
}

interface DayStatus {
  date: string;            // "YYYY-MM-DD"
  status: "workout" | "rest" | "missed" | "unplanned_rest";
  workoutId?: string;
  workoutType?: string;    // "Push", "Pull", "Legs"
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string;
  splitConfig: SplitConfig;
  weekRestDaysUsed: number;  // resets each Monday
}
```

### Streak Calculation Logic

```typescript
function calculateDayStatus(
  date: string,
  hasWorkout: boolean,
  streakState: StreakState
): DayStatus {
  const { splitConfig } = streakState;
  const dayOfWeek = new Date(date).getDay();
  
  // Check if this is a scheduled rest day
  const isScheduledRest = splitConfig.scheduledRestDays?.includes(dayOfWeek);
  
  if (hasWorkout) {
    return { date, status: "workout" };
  }
  
  if (isScheduledRest) {
    // Scheduled rest day — doesn't break streak
    return { date, status: "rest" };
  }
  
  if (streakState.weekRestDaysUsed < splitConfig.maxRestDaysPerWeek) {
    // Unplanned rest day — allowed, counts as rest, doesn't break streak
    return { date, status: "unplanned_rest" };
  }
  
  // No workout, no rest days left — streak broken
  return { date, status: "missed" };
}

function updateStreak(
  streakState: StreakState,
  dayStatus: DayStatus
): StreakState {
  const newState = { ...streakState };
  
  if (dayStatus.status === "workout") {
    newState.currentStreak += 1;
    newState.lastWorkoutDate = dayStatus.date;
    newState.longestStreak = Math.max(
      newState.longestStreak,
      newState.currentStreak
    );
  } else if (dayStatus.status === "missed") {
    newState.currentStreak = 0;
  }
  // "rest" and "unplanned_rest" maintain current streak
  
  return newState;
}
```

### Edge Cases

| Edge Case | Solution |
|---|---|
| **Timezone changes** | Store all dates in the user's configured timezone (from profile). Use `date-fns-tz` or `luxon` for timezone-aware date handling. Don't rely on device timezone alone. |
| **Missed days discovered retroactively** | Run streak recalculation nightly via a Cloud Function, or recalculate on app open by scanning from `lastWorkoutDate` to today. |
| **Split change mid-week** | Apply new split config from the current day forward. Don't retroactively re-evaluate past days. Store the `splitConfig` version with each calendar entry. |
| **Multiple workouts per day** | Count as one workout day. Don't double-count for streak purposes. |
| **App not opened for days** | On next app open, iterate from `lastWorkoutDate + 1` to today, marking each day. If days exceed allowed rest, streak resets. |

### Calendar Heatmap Display

Use a GitHub-style contribution graph with three colours:

- **Green (dark/light):** Workout completed (darker = higher volume)
- **Grey/neutral:** Scheduled rest day
- **Red/empty:** Missed day (streak break)

```tsx
// Using react-native-chart-kit's ContributionGraph
import { ContributionGraph } from "react-native-chart-kit";

const calendarData = workoutDays.map(day => ({
  date: day.date,
  count: day.status === "workout" ? day.volume / 1000 : 0,
}));

<ContributionGraph
  values={calendarData}
  endDate={new Date()}
  numDays={90}
  width={screenWidth - 32}
  height={220}
  chartConfig={{
    backgroundGradientFrom: "#1a1a2e",
    backgroundGradientTo: "#1a1a2e",
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  }}
/>
```

For more control, build a custom heatmap grid using `react-native-svg` with `<Rect>` elements, or use `@symbiot.dev/react-native-heatmap` which is purpose-built for this.

---

## 8. MVP Feature Prioritisation

### Must-Have (Week 1 MVP)

These features define the minimum product that is useful in a gym:

1. **Workout logging** — Start workout, select exercises, log sets (weight × reps), complete workout. This is the core product.
2. **Exercise library** — Bundled 800+ exercise database with search and filter by body part/equipment. Plus ability to add custom exercises.
3. **Workout templates** — Save and reuse routines (e.g., "Push Day"). Start a workout from a template with pre-filled exercises.
4. **Rest timer** — Configurable countdown timer between sets with notification/vibration. Must work when screen is locked.
5. **Workout history** — View past workouts with dates, exercises, and sets.
6. **Basic PR tracking** — Auto-detect when a new weight PR is set for an exercise. Show a celebratory indicator.
7. **User auth** — Email/password sign-up via Firebase Auth. Required for cloud sync.
8. **Offline support** — Full functionality without network. Sync when connectivity returns.

### Nice-to-Have (Weeks 2–4)

9. **Progress charts** — 1RM and volume over time graphs per exercise.
10. **Streak system** — Basic streak counter and calendar heatmap view.
11. **Body weight logging** — Simple weight tracker with trend line.
12. **Supersets** — Group exercises together in a workout.
13. **Set tagging** — Mark sets as warmup, drop set, or to-failure.
14. **Workout notes** — Free-text notes per workout.
15. **Unit switching** — Toggle between lbs and kg with automatic conversion of historical data.

### Future Features (Month 2+)

16. **Full body measurements** — Arms, waist, chest, etc.
17. **Advanced charts** — Volume by muscle group, workout frequency analysis.
18. **Workout programs** — Multi-week structured programs (5/3/1, PPL, etc.) with progression rules.
19. **Data export** — CSV export of all workout data.
20. **Social features** — Share workouts, follow friends, leaderboards.
21. **AI workout suggestions** — Generate programs based on goals and history.
22. **Apple Watch / Wear OS** — Wrist-based set logging.
23. **Progress photos** — Before/after photo gallery with date tagging.
24. **Plate calculator** — Visual plate-loading guide for barbell weights.

### What Strong Does Exceptionally Well (Replicate This)

- **One-tap set completion:** In Strong, you tap a set row and it auto-fills with the previous workout's weight/reps. One tap to confirm. This speed is essential.
- **Clean workout screen:** The active workout screen shows the current exercise, sets in a table, and a rest timer. Nothing else. No distractions.
- **Previous performance visible:** When logging, you can see what you did last time for each exercise. This is the simplest form of progressive overload encouragement.
- **Rest timer auto-start:** Timer begins automatically when you complete a set. No manual triggering needed.

---

## 9. 1-Week Development Roadmap

### AI Assistance Strategy

Use **Claude Code** (Anthropic's CLI tool) or **Cursor** as your primary coding assistant. Both excel at generating React Native components, Firestore queries, and TypeScript interfaces from natural language descriptions. Expect AI to handle 50–70% of boilerplate code, but you'll need to integrate, test, and debug yourself.

Key AI acceleration points: generating Firestore CRUD functions, creating UI component skeletons, writing TypeScript interfaces from your data model, and implementing chart configurations.

### Day-by-Day Plan

**Day 1 (Monday): Project Setup + Auth + Navigation**

- Create Expo project with TypeScript template
- Install and configure `@react-native-firebase/*` (app, auth, firestore)
- Set up Expo Development Build (not Expo Go)
- Implement Firebase Auth (email/password sign-up, login, logout)
- Set up Expo Router with tab navigation: Home, Workout, History, Profile
- Create Firebase project, enable Firestore + Auth in console
- **Milestone:** App launches, user can sign up and log in, see empty tab screens

**Day 2 (Tuesday): Exercise Database + Search**

- Bundle `free-exercise-db` JSON as a static asset
- Build exercise list screen with search (filter by name, body part, equipment)
- Create the exercise detail view
- Implement custom exercise creation form
- Store custom exercises in Firestore `users/{uid}/exercises/`
- **Milestone:** User can browse 800+ exercises, search, and create custom ones

**Day 3 (Wednesday): Core Workout Logging**

- Build the active workout screen (the most critical UI)
- Implement: select exercises → log sets (weight + reps) → complete workout
- Auto-fill previous workout data for each exercise
- Save completed workouts to Firestore `users/{uid}/workouts/`
- Implement draft workout persistence to MMKV (crash recovery)
- **Milestone:** User can log a full workout with multiple exercises and sets. Data persists.

**Day 4 (Thursday): Templates + Rest Timer**

- Build template creation: save current workout as a reusable template
- "Start from template" flow: populate workout with template exercises
- Implement rest timer: configurable per exercise, auto-start on set completion
- Timer must work when app is backgrounded (use `expo-notifications` for alerts)
- **Milestone:** User can create templates, start workouts from templates, rest timer works

**Day 5 (Friday): History + PR Tracking**

- Build workout history list (grouped by date, showing exercise summaries)
- Workout detail view (tap a past workout to see all sets)
- Per-exercise history (tap an exercise to see all sessions for that exercise)
- Implement PR detection: after completing a workout, check if any weight PRs were set
- Show PR badge/notification when a new record is achieved
- **Milestone:** Full workout history browsing, PRs auto-detected and highlighted

**Day 6 (Saturday): Polish + Offline Testing**

- Test offline mode: airplane mode → log workout → reconnect → verify sync
- UI polish: dark mode, loading states, empty states, error handling
- Performance testing on a real device
- Fix bugs from days 1–5
- Add basic onboarding flow (unit selection, optional exercise categories)
- **Milestone:** App works reliably offline, looks polished, no critical bugs

**Day 7 (Sunday): Build + Deploy**

- Final bug fixes and testing
- Build APK/IPA using EAS Build (`eas build --platform all`)
- Internal testing distribution via EAS or TestFlight/Internal Testing
- Write basic README and document the data model
- **Milestone:** Installable build ready for personal use and testing

### What to Skip in Week 1

- Charts and progress visualisation (add in week 2)
- Streak/calendar system (add in week 2)
- Body measurements
- Social features
- Data export
- Supersets
- Apple Watch support

---

## 10. Budget Forecast

### Free Tier (MVP + Early Users, 0–100 users)

| Service | Free Tier Limits | Monthly Cost |
|---|---|---|
| **Firebase Firestore** | 1 GB storage, 50K reads/day, 20K writes/day, 20K deletes/day | $0 |
| **Firebase Auth** | 50K monthly active users | $0 |
| **Firebase Hosting** (if needed) | 10 GB transfer/month | $0 |
| **Expo / EAS Build** | 30 builds/month (free tier) | $0 |
| **Apple Developer Account** | Required for iOS App Store | $99/year |
| **Google Play Developer** | One-time registration fee | $25 one-time |
| **Cursor / AI Coding** | Free tier (limited) or $20/month | $0–20/month |
| **ExerciseDB** | Bundled JSON (no API calls) | $0 |
| **Domain (optional)** | For landing page | ~$12/year |
| **Total (MVP phase)** | | **$0–20/month** + $124 one-time |

### Scaled (1,000–10,000 users)

| Service | Estimated Usage | Monthly Cost |
|---|---|---|
| **Firebase Firestore** | ~5 GB storage, ~500K reads/day | $25–75/month |
| **Firebase Auth** | Still free under 50K MAU | $0 |
| **EAS Build** | Production plan for more builds | $0–99/month |
| **Cloud Functions** (for streak calc, PR aggregation) | Light usage | $0–10/month |
| **Push Notifications** (Firebase Cloud Messaging) | Free | $0 |
| **Total (scaled)** | | **$25–185/month** |

### Cost Risks to Watch

- **Firestore reads** are the biggest cost driver. Poorly structured queries or real-time listeners on large collections can cause read explosions. Denormalise data (as in the data model above) and use pagination.
- **EAS Build** costs increase if you need frequent builds. Use OTA updates (Expo Updates) for JavaScript-only changes to reduce build frequency.
- **Switching to Supabase later** would offer more predictable pricing (charges by storage, unlimited API calls) but requires data migration. The data model above is portable — export Firestore documents as JSON and import to Supabase tables.

### Development Tool Costs

| Tool | Cost | Value for This Project |
|---|---|---|
| **Claude Pro** (for research + code help) | $20/month | High — use for architecture decisions, debugging, code generation |
| **Cursor Pro** (AI-powered editor) | $20/month | High — inline code generation, codebase-aware suggestions |
| **GitHub Copilot** | $10/month | Moderate — good for boilerplate, less context-aware than Cursor |
| **Expo EAS** (Production) | $99/month | Not needed for MVP; free tier is sufficient |
| **Figma** (for design) | Free (personal use) | Useful for planning screens before coding |

---

## Appendix: Sources and Access Dates

| Resource | URL | Accessed |
|---|---|---|
| ExerciseDB API (GitHub) | https://github.com/ExerciseDB/exercisedb-api | Feb 2026 |
| ExerciseDB v1 Docs | https://www.exercisedb.dev/docs | Feb 2026 |
| free-exercise-db (public domain) | https://github.com/yuhonas/free-exercise-db | Feb 2026 |
| wger Workout Manager API | https://wger.de/en/software/api | Feb 2026 |
| wger Documentation | https://wger.readthedocs.io/ | Feb 2026 |
| Strong App (App Store) | https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577 | Feb 2026 |
| Strong App (Google Play) | https://play.google.com/store/apps/details?id=io.strongapp.strong | Feb 2026 |
| Strong App Website | https://www.strong.app/ | Feb 2026 |
| Hevy (Garage Gym Reviews) | https://www.garagegymreviews.com/best-weightlifting-app | Feb 2026 |
| Competitor Comparison (Setgraph) | https://setgraph.app/articles/best-strong-app-alternatives-(2025) | Feb 2026 |
| Expo Firebase Guide | https://docs.expo.dev/guides/using-firebase/ | Feb 2026 |
| Expo SDK 53 Firebase Migration | https://medium.com/@lawrencenorman7hills/ (article on SDK 53 migration) | Feb 2026 |
| React Native Firebase | https://github.com/invertase/react-native-firebase | Feb 2026 |
| Firestore Offline (Expo polyfill) | https://github.com/nandorojo/expo-firestore-offline-persistence | Feb 2026 |
| react-native-gifted-charts (npm) | https://www.npmjs.com/package/react-native-gifted-charts | Feb 2026 |
| Victory Native | https://nearform.com/open-source/victory-native/ | Feb 2026 |
| react-native-chart-kit (GitHub) | https://github.com/indiespirit/react-native-chart-kit | Feb 2026 |
| React Native Chart Libraries (LogRocket) | https://blog.logrocket.com/top-react-native-chart-libraries/ | Feb 2026 |
| React Native Chart Libraries (OpenReplay) | https://blog.openreplay.com/react-native-chart-libraries-2025/ | Feb 2026 |
| WatermelonDB (GitHub) | https://github.com/Nozbe/WatermelonDB | Feb 2026 |
| MMKV Storage Benchmark | https://github.com/mrousavy/StorageBenchmark | Feb 2026 |
| React Native Local Databases (PowerSync) | https://www.powersync.com/blog/react-native-local-database-options | Feb 2026 |
| Supabase vs Firebase (Bytebase) | https://www.bytebase.com/blog/supabase-vs-firebase/ | Feb 2026 |
| Supabase vs Firebase (Netguru) | https://www.netguru.com/blog/supabase-vs-firebase | Feb 2026 |
| react-native-calendar-heatmap | https://github.com/ayooby/react-native-calendar-heatmap | Feb 2026 |
| @symbiot.dev/react-native-heatmap | https://www.npmjs.com/package/@symbiot.dev/react-native-heatmap | Feb 2026 |
| react-calendar-heatmap | https://github.com/kevinsqi/react-calendar-heatmap | Feb 2026 |
| Lifting App Reviews (Gymscore) | https://www.gymscore.ai/best-lifting-apps-2025 | Feb 2026 |

### Notes on Source Disagreements

- **ExerciseDB exercise count:** The v1 (open-source) API lists ~1,300 exercises. The v2/commercial API claims 11,000+. The GitHub README mentions both figures. The v1 dataset is sufficient for an MVP.
- **Firebase JS SDK vs Native SDK for Expo:** Multiple sources (Expo docs, Medium articles, GitHub issues) confirm that as of Expo SDK 53 (mid-2025), the Firebase JS SDK has Auth compatibility issues. The community consensus is to migrate to `@react-native-firebase/*`. One Medium article documents this migration in detail.
- **Firestore offline on mobile with JS SDK:** The Firebase JS SDK's offline persistence uses IndexedDB/LocalStorage, which works on web but **not reliably on React Native mobile**. Multiple sources confirm the native SDK (`@react-native-firebase/firestore`) is required for proper mobile offline support.
- **react-native-chart-kit maintenance:** Several 2025 articles note it is "less actively maintained" compared to gifted-charts and Victory Native. It still works but may lag on new React Native versions.
