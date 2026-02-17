# Project Brief (Persistent)

## Product Vision
LiftLog is a personal gym workout tracker delivered as a PWA that replaces existing apps (Strong, Hevy, JEFIT) by providing fast set logging (≤15 sec/set), full offline functionality, unlimited templates, and automatic PR tracking — all without paywalls or app store fees.

## Target User
Intermediate gym-goer (3–5 sessions/week) frustrated by:
- Strong's 3-routine free limit and paywalled charts
- JEFIT's cluttered UI and $70/yr pricing
- FitNotes' lack of cloud sync
- Hevy's limited advanced metrics

## Why PWA (Not Native)
- $0 to get on iPhone (vs $99/year Apple Developer)
- Zero new framework to learn (it's just React)
- Deploy in 30 seconds (vs 10-min cloud builds)
- One trade-off: no background timer notification (clock-diff recovery instead)
- Escape hatch: services/types/Firebase logic port directly to React Native if ever needed

## Design Philosophy
- **Speed over beauty** — every interaction optimised for gym use with sweaty hands
- **Gym-proof** — large tap targets (44×44px min), high contrast, dark mode
- **Progressive disclosure** — show what's needed now, hide complexity behind taps
- **Offline-first** — app works identically with no network
- **Mobile-first** — designed for phone screens, tested on iPhone Safari

## Coding Conventions
- **Language:** TypeScript strict mode — no `any` types
- **Architecture:** Service layer pattern — components → services → Firestore
- **State:** React Context + useReducer (no external state libraries)
- **Styling:** Tailwind CSS with CSS custom properties for theme tokens
- **Firebase:** JS SDK v9+ modular imports only (not compat)
- **Exports:** Named exports for components and services
- **Path aliases:** `@/` maps to `src/`

## Quality Gates
- `npx tsc --noEmit` must pass before every commit
- All Firestore access goes through `services/` layer
- All exercise access goes through `exerciseService` normalisation layer
- Every list has an empty state
- Every async operation has a loading state
- Every error is caught and shown to the user
- Dark mode consistent across all screens
- Tested on iPhone Safari (real device via Vercel URL)

## Key Commands
```bash
npm run dev                             # Dev server (localhost:5173)
npm run build                           # Production build
npx tsc --noEmit                        # Type check
vercel --prod                           # Deploy
firebase deploy --only firestore:rules  # Deploy security rules
```

## Budget Constraints
- **Monthly:** $0 (Vercel free + Firebase free)
- **Optional:** $20/month (Cursor Pro or Claude subscription)
- **No Apple Developer fee** — PWA installed via "Add to Home Screen"
- **No paid APIs** in MVP — exercise data is bundled

## Timeline
- **MVP:** 7 days (1 feature area per day)
- **Post-MVP (Week 2–3):** Charts, streaks, body weight, supersets, unit switching
- **Future (if needed):** Port to React Native for background notifications

## Update Cadence
Update this brief and AGENTS.md whenever:
- A new library is added to the project
- An architectural pattern changes
- A new phase begins
- Commands change
