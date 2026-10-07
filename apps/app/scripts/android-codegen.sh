#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID="$ROOT/android"

PROJECTS=(
  :app
  :react-native-gesture-handler
  :react-native-keyboard-controller
  :react-native-reanimated
  :react-native-safe-area-context
  :react-native-screens
  :react-native-svg
  :react-native-teleport
  :react-native-worklets
)

TASKS=()
for project in "${PROJECTS[@]}"; do
  TASKS+=("${project}:generateCodegenArtifactsFromSchema")
done

(cd "$ANDROID" && ./gradlew "${TASKS[@]}" --configure-on-demand)

echo "Generated New Architecture codegen artifacts for ${#PROJECTS[@]} Android modules"
