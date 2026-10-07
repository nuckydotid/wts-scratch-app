#!/usr/bin/env bash
# Recent logs of a Cloud Run service:  bash scripts/ship/api-logs.sh [api-staging|api-prod|team]   (default api-prod)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROJECT="$(node -e "console.log(require('$ROOT/project.config.json').gcp.projectId)")"
SLUG="$(node -e "console.log(require('$ROOT/project.config.json').slug)")"
TARGET="${1:-api-prod}"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SLUG-$TARGET" --project "$PROJECT" --limit 50 --format 'value(timestamp,textPayload,jsonPayload.message)'
