# Infrastructure (Google Cloud)

One Terraform root for everything this project runs on, in **one GCP project** you own. **Not applied against a live project
yet** (`terraform validate` passes): run `terraform plan` first and read it.

| Resource | Purpose |
| --- | --- |
| Cloud Run `<slug>-api-staging` / `<slug>-api-prod` | the app's REST + WebSocket API; staging scales to zero, prod uses `min_instances` |
| Cloud Run `<slug>-team` | the **team server**: office, chat, design room. Exactly one instance (`team_min_instances`, default 1) |
| Cloud SQL Postgres `<slug>-pg` | **one instance**, databases `staging` and `prod`, one user per database |
| Firestore `(default)` | the team server's state |
| Firebase project, web app, Hosting site `<slug>-design` | sign-in config for the app and the design site |
| Cloud Storage `<project>-<slug>-ota-<env>` | uploads, OTA bundles, remote assets per environment (private, signed URLs) |
| Secret Manager | `database-url-<env>`, `ota-script-token-<env>`, `onesignal-api-key-<env>` (only when `onesignal_api_key` is set), `team-webhook-secret` |
| Artifact Registry `images` | `api` and `team` images |
| Cloud Scheduler | `/internal/cron/chat-retention` per API environment, OIDC with its own service account |
| Workload Identity Federation | keyless CI: see below |

Each runtime has its own service account; an environment can read only its own secrets, so a compromised staging service
cannot read production credentials.

## Who may deploy

Only workflows of `github_repo` can exchange a GitHub token, and each deployer service account is bound to a **branch**:

| Service account (`terraform output`) | Usable by | Can update |
| --- | --- | --- |
| `GCP_DEPLOY_SA_STAGING` | workflows running on `refs/heads/staging` | api-staging |
| `GCP_DEPLOY_SA_PROD` | workflows running on `refs/heads/main` | api-prod, team server |
| `GCP_DEPLOY_SA` | any workflow of the repo (PR previews) | Firebase Hosting only |

With branch protection on `main` and `staging` (`scripts/ship/protect-branches.sh`), nothing reaches an environment without
the owner's review.

## First run

```bash
cp example.tfvars my.tfvars          # fill in; use deletion_protection = false for a scratch project
terraform init && terraform apply -var-file=my.tfvars
```

Expect the first apply to need a re-run (API enablement and IAM propagate with a delay; Cloud SQL takes 10+ minutes).

Then, once:

1. Console → Firebase → Authentication → Sign-in method → **Google → Enable** (needs your OAuth consent screen; not automated).
2. `terraform output firebase_web_config` → `firebase.apiKey` / `firebase.appId` in `project.config.json`; `terraform output api_prod_url`
   → `api.url`; `terraform output team_url` → `designRoom.studioUrl` (and `designRoom.projectId` = `main`).
3. Repository variables (`gh variable set NAME --body VALUE`): `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`, `GCP_DEPLOY_SA_STAGING`,
   `GCP_DEPLOY_SA_PROD`, and `STUDIO_URL` = the team URL (so previews and live deploys are announced to the design room).
4. Repository webhook: payload `<team_url>/hooks/github`, content type JSON, event *Pull requests*, secret =
   `gcloud secrets versions access latest --secret team-webhook-secret`.
5. First images (CI does this later): `bash scripts/ship/deploy-service.sh team`, `api-staging`, `api-prod`.
6. `bash scripts/ship/deploy-design.sh` for the first design site deploy.
7. `bash scripts/ship/protect-branches.sh <owner/repo>`.
8. Push notifications (optional): set `onesignal_app_id` and `onesignal_api_key` in `my.tfvars` and apply again. Without them the APIs run and log pushes instead of sending.

## Cost notes

Cloud SQL (`db-f1-micro`) and the always-on team server instance dominate. `team_min_instances = 0` removes the latter
but drops everyone's sockets whenever it scales to zero and loses in-memory room state not yet persisted.
