#!/usr/bin/env bash
# Build a service image and roll it out to Cloud Run. The services themselves (scaling, secrets, Cloud SQL, identities) are
# defined in infra/terraform; this only swaps the image.
#
#   bash scripts/ship/deploy-service.sh api-staging   # <slug>-api-staging   (CI: pushes to the `staging` branch)
#   bash scripts/ship/deploy-service.sh api-prod      # <slug>-api-prod      (CI: pushes to `main`)
#   bash scripts/ship/deploy-service.sh team          # <slug>-team          (CI: pushes to `main`)
#
# BUILDER=cloudbuild (default) builds in Google Cloud Build, which needs no Docker locally.
# BUILDER=docker builds with the local/runner Docker and pushes to Artifact Registry (what CI uses: no Cloud Build rights needed).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cfg() { node -e "const c=require('$ROOT/project.config.json');const v=process.argv[1].split('.').reduce((o,k)=>o?.[k],c);console.log(v??'')" "$1"; }

TARGET="${1:-}"
case "$TARGET" in
  api-staging|api-prod) DIR=backend; IMAGE_NAME=api ;;
  team) DIR=team-server; IMAGE_NAME=team ;;
  *) echo "usage: $0 api-staging|api-prod|team" >&2; exit 2 ;;
esac

PROJECT="${GCP_PROJECT:-$(cfg gcp.projectId)}"
REGION="${GCP_REGION:-$(cfg gcp.region)}"
SLUG="$(cfg slug)"
[ -n "$PROJECT" ] || { echo "Set gcp.projectId in project.config.json" >&2; exit 1; }
SERVICE="$SLUG-$TARGET"
TAG="${IMAGE_TAG:-$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || date +%s)}"
IMAGE="$REGION-docker.pkg.dev/$PROJECT/images/$IMAGE_NAME:$TAG"

echo "→ building $IMAGE"
if [ "${BUILDER:-cloudbuild}" = docker ]; then
  gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
  docker build -f "$ROOT/$DIR/Dockerfile" -t "$IMAGE" "$ROOT"
  docker push "$IMAGE"
else
  gcloud builds submit "$ROOT" --project "$PROJECT" --config "$ROOT/$DIR/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE"
fi

echo "→ deploying $SERVICE"
gcloud run deploy "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE" --quiet
URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format 'value(status.url)')"
# /health, not /healthz: Cloud Run's front end reserves /healthz on *.run.app and answers 404 itself.
echo "→ checking $URL/health"
curl -fsS --retry 6 --retry-delay 5 --retry-all-errors "$URL/health" >/dev/null || { echo "health check failed: $URL/health" >&2; exit 1; }
echo "$URL"
