#!/usr/bin/env bash
# Export the design-system story web (packages/worktrees-studio-ds) and deploy it to Firebase Hosting so the whole team can
# open the same site, see each other's cursors and chat. Uses `firebase login` / ADC (or Workload Identity in CI); no tokens in the repo.
#
#   bash scripts/ship/deploy-design.sh                       # live site:  https://<slug>-design.web.app
#   DESIGN_CHANNEL=pr-12 bash scripts/ship/deploy-design.sh  # preview:    https://<slug>-design--pr-12-<hash>.web.app (7 days)
#
# Prints `LIVE_URL=…` / `PREVIEW_URL=…` and, under GitHub Actions, also writes `url=…` to $GITHUB_OUTPUT.
#
# The Studio server must know the site: the Founder sets "designUrl" on the project (Worktrees Studio does this for you),
# which is also what allows the site (and its preview channels) to open the realtime socket.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cfg() { node -e "const c=require('$ROOT/project.config.json');const v=process.argv[1].split('.').reduce((o,k)=>o?.[k],c);console.log(v??'')" "$1"; }

PROJECT="${GCP_PROJECT:-$(cfg gcp.projectId)}"
SLUG="$(cfg slug)"
SITE="${DESIGN_SITE:-$SLUG-design}"
[ -n "$PROJECT" ] || { echo "Set gcp.projectId in project.config.json"; exit 1; }

# Compiled into the web build (Metro inlines EXPO_PUBLIC_*): where the room lives and who may sign in.
export EXPO_PUBLIC_STUDIO_URL="${EXPO_PUBLIC_STUDIO_URL:-$(cfg designRoom.studioUrl)}"
export EXPO_PUBLIC_STUDIO_PROJECT_ID="${EXPO_PUBLIC_STUDIO_PROJECT_ID:-$(cfg designRoom.projectId)}"
export EXPO_PUBLIC_PROJECT_NAME="${EXPO_PUBLIC_PROJECT_NAME:-$(cfg name)}"
export EXPO_PUBLIC_FIREBASE_API_KEY="${EXPO_PUBLIC_FIREBASE_API_KEY:-$(cfg firebase.apiKey)}"
export EXPO_PUBLIC_FIREBASE_APP_ID="${EXPO_PUBLIC_FIREBASE_APP_ID:-$(cfg firebase.appId)}"
export EXPO_PUBLIC_FIREBASE_PROJECT_ID="${EXPO_PUBLIC_FIREBASE_PROJECT_ID:-$PROJECT}"
# The commit this build comes from: the page compares it with the "live" announcement to offer "new version — reload".
export EXPO_PUBLIC_BUILD_SHA="${EXPO_PUBLIC_BUILD_SHA:-${GITHUB_SHA:-$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || true)}}"

echo "→ exporting the design site"
(cd "$ROOT/packages/worktrees-studio-ds" && bunx expo export --platform web --output-dir dist-web)

echo "→ making sure the hosting site '$SITE' exists"
firebase hosting:sites:create "$SITE" --project "$PROJECT" >/dev/null 2>&1 || true
firebase target:apply hosting design "$SITE" --project "$PROJECT" >/dev/null

emit() { echo "$1=$2"; [ -z "${GITHUB_OUTPUT:-}" ] || echo "url=$2" >> "$GITHUB_OUTPUT"; }

if [ -n "${DESIGN_CHANNEL:-}" ]; then
  OUT="$(firebase hosting:channel:deploy "$DESIGN_CHANNEL" --only design --expires 7d --project "$PROJECT" --json)"
  # {"status":"success","result":{"design":{"url":"https://…","expireTime":"…"}}}
  URL="$(printf '%s' "$OUT" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s).result||{};const e=r.design||Object.values(r)[0];if(!e||!e.url){console.error('no preview URL in firebase output');process.exit(1)}console.log(e.url)})")"
  emit PREVIEW_URL "$URL"
else
  firebase deploy --only hosting:design --project "$PROJECT"
  emit LIVE_URL "https://$SITE.web.app"
fi
