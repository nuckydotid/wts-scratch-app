#!/bin/bash
set -euo pipefail
# Verifies UIScene lifecycle adoption required for Xcode 27 / iOS 27 SDK (Expo #46664, PR #50205)
# Usage: bash scripts/check-ios-scene.sh [--staged]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PLIST="$APP_DIR/ios/myappstaging/Info.plist"
APP_DELEGATE="$APP_DIR/ios/myappstaging/AppDelegate.swift"

fail() { echo "❌ $1" >&2; exit 1; }
ok() { echo "✅ $1"; }

echo "Checking iOS scene lifecycle..."

[ -f "$PLIST" ] || fail "Missing $PLIST — run: APP_VARIANT=staging expo prebuild --clean"
[ -f "$APP_DELEGATE" ] || fail "Missing $APP_DELEGATE"

# 1. UIApplicationSceneManifest must exist and match expo-build-properties owned manifest
plutil -p "$PLIST" | grep -q "UIApplicationSceneManifest" || fail "Missing UIApplicationSceneManifest in $PLIST (enableSceneSupport not applied)"
plutil -p "$PLIST" | grep -q "EXExpoAppSceneDelegate" || fail "UISceneDelegateClassName != EXExpoAppSceneDelegate"
plutil -p "$PLIST" | grep -q "UIApplicationSupportsMultipleScenes" || fail "Missing UIApplicationSupportsMultipleScenes"
ok "Info.plist has EXExpoAppSceneDelegate scene manifest"

# 2. LSMinimumSystemVersion must align with deploymentTarget (17.0)
LS_MIN=$(plutil -p "$PLIST" | grep -A2 LSMinimumSystemVersion | grep -o '"17.0"' || true)
[ -n "$LS_MIN" ] || fail "LSMinimumSystemVersion != 17.0 (expected 17.0 per app.config.ts ios.deploymentTarget)"
ok "LSMinimumSystemVersion == 17.0"

# 3. AppDelegate must conform to ExpoReactNativeFactoryProvider and NOT contain legacy window startup
grep -q "ExpoReactNativeFactoryProvider" "$APP_DELEGATE" || fail "AppDelegate.swift missing ExpoReactNativeFactoryProvider (scene support not enabled)"
if grep -q "window = UIWindow" "$APP_DELEGATE"; then
  fail "AppDelegate.swift still contains legacy 'window = UIWindow(...)' — scene lifecycle requires factory provider (remove window/startReactNative)"
fi
if grep -q "factory.startReactNative" "$APP_DELEGATE"; then
  fail "AppDelegate.swift still contains factory.startReactNative — should be handled by scene delegate"
fi
ok "AppDelegate.swift conforms to scene lifecycle (no legacy window)"

# 4. expo-build-properties config must declare enableSceneSupport
grep -q "enableSceneSupport.*true" "$APP_DIR/app.config.ts" || fail "app.config.ts missing ios.enableSceneSupport: true (expo-build-properties)"
ok "app.config.ts declares ios.enableSceneSupport: true"

echo "✅ iOS scene check passed (Xcode 27 ready)"
