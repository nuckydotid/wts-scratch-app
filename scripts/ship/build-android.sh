#!/usr/bin/env bash
# Local Android release build (no EAS): prebuild native project, then Gradle.
set -euo pipefail
cd "$(dirname "$0")/../../apps/app"
bunx expo prebuild --platform android --no-install
cd android
./gradlew assembleRelease
APK="app/build/outputs/apk/release/app-release.apk"
echo "Built: $(pwd)/$APK"
