#!/usr/bin/env bash
# Upload the release APK to Firebase App Distribution (uses your `firebase login` / ADC; no tokens in the repo).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APK="$ROOT/apps/app/android/app/build/outputs/apk/release/app-release.apk"
APP_ID="${FIREBASE_APP_ID:-$(node -e "console.log(require('$ROOT/project.config.json').firebase.appId||'')")}"
[ -f "$APK" ] || { echo "APK not found: $APK (run 'Android release APK (local)' first)"; exit 1; }
[ -n "$APP_ID" ] || { echo "Set firebase.appId in project.config.json or FIREBASE_APP_ID"; exit 1; }
firebase appdistribution:distribute "$APK" --app "$APP_ID" --groups "${FIREBASE_TESTER_GROUP:-testers}" \
  --release-notes "${RELEASE_NOTES:-Build from $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo local)}"
