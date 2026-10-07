# team-server

The single-tenant **team server** of a Worktrees Studio project: the virtual office (presence, chat, desks), the design
room (cursors, pins, chat, PR/CI announcements) and, later, live Kanban/docs. It runs on **Cloud Run in the project
owner's own GCP project**; there is no shared Studio server. Hono for HTTP, Bun-native WebSockets.

## How people get in

1. The user signs in to the project's **Firebase** (Google) → a Firebase ID token.
2. The desktop app already holds their **GitHub** token (device flow). The `hello` message carries both.
3. The server verifies the Firebase token against Google's public keys (`jose`, no Admin SDK) and asks GitHub, **with the
   user's own token**, what permissions they have on `PROJECT_REPO`:

| GitHub permission | Team role | Office role |
| --- | --- | --- |
| admin | `founder` | owner (can edit the office) |
| maintain | `pm` | admin (can edit the office) |
| push (write) | `frontend` | member |
| read / triage / none | refused (`not_a_member`) | |

Collaborators are therefore managed only on GitHub. Results are cached for 5 minutes (30 s for refusals), so removing
someone takes effect within minutes. The server holds **no GitHub secret and no user database**. Roles refresh on every join.

## Configuration (environment)

| Variable | Meaning |
| --- | --- |
| `PROJECT_REPO` | `owner/name` of the project's repository (required) |
| `FIREBASE_PROJECT_ID` | Firebase/GCP project that issues sign-in tokens and holds Firestore (required) |
| `DESIGN_URL` | the design site (Firebase Hosting); its origin and preview channels may open the design socket |
| `ALLOWED_ORIGINS` | comma list; default is the desktop app's origins |
| `GITHUB_WEBHOOK_SECRET` | HMAC secret for `/hooks/github` (empty → 503) |
| `OIDC_AUDIENCE` / `PUBLIC_URL` | audience CI's GitHub OIDC tokens must carry for `/hooks/ci` |
| `TEAM_STORE` | `firestore` (default when `FIREBASE_PROJECT_ID` is set) or `memory` |
| `MAX_PLAYERS` | office capacity, default 100 |
| `TEAM_DEV_AUTH=1` | **local only**: tokens are `dev:<uid>:<name>`, GitHub token is `dev:<role>` |

## Endpoints

`GET /healthz`, `GET /config` (repo, design URL, Firebase project id — nothing secret), `WS /ws` (office),
`WS /design`, `POST /hooks/github`, `POST /hooks/ci`.

## Run and test

```bash
bun run dev:team          # from the template root; TEAM_DEV_AUTH=1, in-memory store, port 8080
bun run --filter team-server test
```

`src/shared/` is a generated copy of Worktrees Studio's shared protocol code (`npm run template:sync-core` in the Studio
repo); do not edit it here.

## Deploy

One instance only (`max_instances = 1`): room state lives in memory and is persisted through Firestore. Whether
`min_instances` must be 1 (WebSockets drop when the instance scales to zero) is to be decided from the Gate 4 run in
`docs/local-mac-plan.md`. The Terraform for this service is phase P2; the `Dockerfile` here builds from the template root.

## Not here (by design)

No `/ai/generate`, no Vertex/Gemini key, no projects/invites API, no billing. Office teammates are decoration: `agent.chat`
answers with an error. Agents run locally (`agy`) or in the cloud (Jules) under each user's own subscription.
