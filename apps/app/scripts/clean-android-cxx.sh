#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

rm -rf "$ROOT/android/app/.cxx" "$ROOT/android/app/build"

find "$ROOT/node_modules" -path "*/android/build/intermediates/cxx" -type d -prune -exec rm -rf {} + 2>/dev/null || true

# New Architecture codegen headers live under node_modules/**/android/build/generated.
# Clearing them avoids stale/partial codegen after CMake cache wipes.
find "$ROOT/node_modules" -path "*/android/build/generated/source/codegen" -type d -prune -exec rm -rf {} + 2>/dev/null || true

echo "Cleaned Android CMake caches and node_modules New Architecture codegen outputs"
