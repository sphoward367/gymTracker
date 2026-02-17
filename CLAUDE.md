# CLAUDE.md — Claude Code Configuration for LiftLog

## Project Context
**App:** LiftLog — Mobile gym workout tracker (PWA)
**Stack:** React 18 + Vite 5 / TypeScript (strict) / Tailwind CSS / Firebase JS SDK v9+ (Auth + Firestore) / vite-plugin-pwa / React Router v6
**Deploy:** Vercel (free tier)
**Stage:** MVP Development (7-day sprint)
**User Level:** In-Between (knows React/TypeScript/Firebase, learning Tailwind)

## Directives
1. **Master Plan:** Always read `AGENTS.md` first. It contains the current phase, task checklist, and architecture rules.
2. **Documentation:** Refer to `agent_docs/` for details — load only the file you need:
   - `tech_stack.md` — libraries, versions, install commands, Firebase config
   - `code_patterns.md` — component structure, service layer, Context pattern, Tailwind conventions
   - `product_requirements.md` — features, user stories, success metrics
   - `testing.md` — verification checklists per day
   - `project_brief.md` — conventions, budget, timeline
3. **Plan-First:** Propose a brief plan (3–5 bullets) and wait for approval before writing code.
4. **Incremental Build:** One feature at a time. Verify it works before starting the next.
5. **Pre-Commit:** Run `npx tsc --noEmit` before suggesting a commit. Fix type errors first.
6. **No Linting Role:** Do not act as a linter or formatter. Use `npx tsc --noEmit` for type checking.
7. **Communication:** Be concise. If context is missing, ask ONE specific question.

## Architecture Constraints (Non-Negotiable)
- Components NEVER call Firestore directly — always use `services/` layer
- Exercise data access ONLY through `exerciseService` normalisation layer
- `any` type is FORBIDDEN — use proper types or `unknown` with type guards
- Use Firebase JS SDK v9+ modular imports — NOT compat SDK
- Use Tailwind classes — never inline styles or CSS modules
- Dark mode is the primary theme — use Tailwind `dark:` utilities and CSS custom properties
- Minimum 44×44px touch targets on all interactive elements
- Rest timer uses clock-diff recovery (Date.now() on visibilitychange) — NOT background JS

## Commands
```bash
npm run dev                             # Start Vite dev server (http://localhost:5173)
npm run build                           # Production build
npx tsc --noEmit                        # Type check (run before commits)
vercel --prod                           # Deploy to production
firebase deploy --only firestore:rules  # Deploy security rules
```

## Key Files
- `AGENTS.md` — Current phase + roadmap (update after completing tasks)
- `src/types/` — TypeScript interfaces (Exercise, Workout, WorkoutSet, Template, UserProfile)
- `src/services/` — All Firestore + data access logic
- `src/contexts/` — AuthContext, WorkoutContext, TimerContext
- `src/lib/firebase.ts` — Firebase initialisation + Firestore persistence
- `public/exercises.json` — Bundled exercise database (800+)
- `vite.config.ts` — Vite + PWA plugin configuration

## What NOT To Do
- Do NOT use Firebase compat SDK — use modular v9+ imports only
- Do NOT put Firestore calls in components
- Do NOT add features not in the current AGENTS.md phase
- Do NOT use `any` type
- Do NOT use inline styles — use Tailwind
- Do NOT rely on background JS for the timer — it pauses when tab/screen is inactive on iOS
- Do NOT delete files without asking
- Do NOT install packages without checking existing deps first
