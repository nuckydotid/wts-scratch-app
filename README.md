# App monorepo (Worktrees Studio template)

Expo (React Native) + HeroUI Native design system + one Hono API on **Google Cloud** (Cloud Run, Cloud SQL Postgres,
Cloud Storage, Firebase Auth, realtime chat over WebSocket) with self-hosted **OTA updates** and **OneSignal** push.
No EAS, no other third-party services.

```
apps/app                           Expo app: sign-in (Google / email link), home, realtime chat (expo-router, Uniwind, HeroUI Native)
packages/worktrees-studio-ds       Design system, story gallery and flow canvas (bun run stories → :8085)
packages/worktrees-studio-shared-ids   screen ids / testIDs / TC-* test-case id format
packages/ds-collab                 Realtime design room for the story web (cursors, follow, chat, pins, "new version")
backend/                           Hono API for Cloud Run: auth, CRUD sample, uploads, push, OTA, assets, chat (REST + WebSocket)
modules/                           Native Expo modules (mmkv, asset-cache, google-sign-in, ota-updates, system-bars)
flows/worktrees-studio             Navigation graph canvas (React Flow)
infra/terraform                    Cloud Run, Cloud SQL, Cloud Storage, Secret Manager, Cloud Scheduler, keyless CI identity
.github/workflows                  quality gates, per-PR design preview, live design deploy
project.config.json                app identity (name, bundle ids, brand, GCP project, API url, Firebase, OneSignal, design room)
.worktree/commands.yaml            dev/ship commands used by Worktrees Studio
```

## Quick start
```bash
bun install
bun scripts/apply-project-config.ts --name "My App" --bundle com.acme.myapp --primary "#2f9e44"
bun run stories        # design system + flow canvas on :8085
AUTH_DEV=1 bun run dev:api   # API on :8080 (dev tokens `dev:<uid>`, in-memory PGlite, no GCP needed)
bun run web            # the app in the browser: with Firebase unconfigured it signs you in as a dev user
```
Open the app in two browser tabs as different dev users, create a chat with the other user's id and talk: messages
travel over the API WebSocket.

## Google Cloud
`infra/terraform/README.md` creates everything (including Workload Identity Federation for GitHub Actions). Worktrees Studio runs it
for you from the project's *Cloud* step and copies the CI identity to the repository's Actions variables.

* **Auth**: Firebase Auth (Google, email link). The role of a user is the custom claim `role` (`cd backend && bun run set-claims -- --uid … --role admin`), enforced with `requireRole`.
* **Chat**: `backend/src/chat.ts`. WebSocket at `/ws/chat` (token in the first frame), history and unread over REST, fan-out across instances with Postgres `LISTEN/NOTIFY`.
* **Push**: OneSignal, addressed by Firebase uid (`OneSignal.login(uid)`); the API key lives in Secret Manager.
* **Cron**: Cloud Scheduler calls `/internal/cron/<task>` with an OIDC token (`chat-retention` built in).
* **Logs**: JSON on stdout → Cloud Logging; errors are reported to Error Reporting automatically.

## Design together
`packages/ds-collab` turns the story web into a shared room. Set `designRoom.studioUrl` / `designRoom.projectId` (the Cloud step does)
and deploy with `bash scripts/ship/deploy-design.sh`. Each pull request gets a preview URL; a merge deploys the live site and
everyone with it open is offered a reload. See Worktrees Studio's `docs/design-room.md`.

## Rules (see AGENTS.md)
Trunk-based development (short-lived branches, squash merge) · Test-driven: write the test case first (IDs `TC-<FEATURE>-<NNN>` in `tests/cases.json`) · Design system tokens only (no raw hex) · testIDs from `@repo/worktrees-studio-shared-ids`.

`packages/ds-collab/src/core` is generated from the Worktrees Studio repo; do not edit it here.
