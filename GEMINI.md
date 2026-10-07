# Agent guide (template)

- Package manager: **bun** only.
- UI: HeroUI Native + Tailwind v4 tokens from `@repo/worktrees-studio-ds`; no raw hex, no `StyleSheet`.
- Routing: Expo Router file-based typed routes.
- API: typed Hono client from `backend` (`AppType`); no raw `fetch`/`axios` in screens.
- Backend runs on **Google Cloud** (Cloud Run, Cloud SQL Postgres via Drizzle, Cloud Storage, Firebase Auth) plus **OneSignal** for push (addressed by Firebase uid). Do not add other hosted services.
- State: Zustand v5. Forms: React Hook Form + Zod.
- Every interactive element gets a `testID` from `@repo/worktrees-studio-shared-ids`; tests reference `TC-*` ids from `tests/cases.json`.
- Workflow: trunk-based, Conventional Commits, test first.
