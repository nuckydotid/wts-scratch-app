---
name: onesignal-expo-setup
description: OneSignal Expo SDK installation, plugin configuration, app.json setup, and initialization in Expo Router layouts.
---

# OneSignal Expo SDK Setup Skill

Use this skill when installing, configuring, or debugging the OneSignal Expo SDK in a React Native Expo project.

Your documentation references:

- Expo SDK setup: `docs/onesignal/expo-sdk-setup.md`
- **Troubleshooting: `docs/onesignal/troubleshooting.md`** — full setup-journey runbook (FCM pinning, channel, Node compat, prebuild, emulator)
- Firebase messaging compat: `config/with-firebase-messaging.js`
- Build variant config: `config/build.ts` + `config/build.js`
- Keys & IDs: `docs/onesignal/keys-and-ids.md`
- Mobile SDK reference: `docs/onesignal/mobile-sdk-reference.md`

## Quick Reference

### Installation

```bash
npx expo install onesignal-expo-plugin
npm install --save react-native-onesignal
```

### Plugin Configuration

This project uses a custom `config/with-firebase-messaging.js` plugin that injects `firebase-messaging:24.0.0`. It **must come before** `onesignal-expo-plugin` (see [Troubleshooting → SERVICE_NOT_AVAILABLE](troubleshooting.md#1-servicenotavailable--firebase-bom-version-mismatch) for the `firebase-bom:25.0.2` → range-mismatch root cause).

```typescript
// app.config.ts
import withOneSignal from "onesignal-expo-plugin/plugin";

plugins: [
  "./config/with-firebase-messaging.js", // Firebase compat — must be before OneSignal
  withOneSignal({
    mode: "development", // or "production"
    disableLocation: true, // if not using location tracking
  }),
  // ... other plugins
];
```

> **After any plugin-order change, a clean prebuild is required:** `npx expo prebuild --clean`. Incremental `prebuild` does not re-run `withAppBuildGradle` injections — `android/app/build.gradle` will still miss the Firebase dep.

### Staging / Prod Variant Wiring

`config/build.ts` + `config/build.js` dual-file pattern (Node 20 compat — see [Troubleshooting → Node 20](troubleshooting.md#3-syntaxerror-unexpected-token--node-20-compat-configbuildts-vs-configbuildjs)):

```typescript
// config/build.ts — ONESIGNAL_APP_IDS per variant
export const ONESIGNAL_APP_IDS = {
  prod: process.env.ONESIGNAL_APP_ID_PROD ?? "",
  staging: "c5862cfc-9634-4431-8162-42a43ddb61af",
} as const;

// app.config.ts — variant-aware wiring
onesignalAppId: isStaging ? ONESIGNAL_APP_IDS.staging : ONESIGNAL_APP_IDS.prod,
mode: isStaging ? "development" : "production",
```

`ONESIGNAL_APP_ID_PROD` must be exported before `prebuild:prod` or the prod build initializes OneSignal with `""` and subscribers never register.

### Required iOS Config

```typescript
ios: {
  bundleIdentifier: "com.yourcompany.yourapp",
  infoPlist: {
    UIBackgroundModes: ["remote-notification"],
  },
  entitlements: {
    "aps-environment": "development",
  },
}
```

### Initialization (Expo Router)

```typescript
// app/_layout.tsx
import { useEffect } from "react";
import { OneSignal, LogLevel } from "react-native-onesignal";

export default function RootLayout() {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize("YOUR_APP_ID");
    OneSignal.Notifications.requestPermission(false);
  }, []);
}
```

### Key Rules

- Call `OneSignal.initialize()` once at app startup
- Call `OneSignal.login(userId)` after authentication
- Call `OneSignal.logout()` on sign-out
- Remove verbose logging before production builds
- Push notifications do NOT work in Expo Go — use development builds
- **Emulator testing:** Android emulators need a **Google Play** system image (not Google APIs or pre-release) for FCM `onNewToken` to fire — see [Troubleshooting → No onNewToken](troubleshooting.md#6-no-onnewtoken--emulator-without-play-services)
- **Deep links:** After init, also wire `onesignal-push-config` (click → `resolveNotificationRoute`) and `expo-linking` (Universal/App Links, `assetlinks.json`, AASA) — see [Troubleshooting](troubleshooting.md)

### See Also

- `onesignal-push-config` — click handler + `resolveNotificationRoute` + payload fields (`small_icon`, `priority`)
- `expo-linking` — Universal Links / App Links, `intentFilters` / `associatedDomains`, `+native-intent.tsx`
- `docs/onesignal/troubleshooting.md` — full 11-section runbook for setup failures

### Troubleshooting Quick Table

| Error                               | Fix                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `SERVICE_NOT_AVAILABLE`             | Pin `firebase-messaging:24.0.0` via `with-firebase-messaging.js`       |
| `OneSignal.h not found`             | Move `with-firebase-messaging.js` before OneSignal; `prebuild --clean` |
| `SyntaxError: Unexpected token ':'` | Dual `build.js`/`build.ts` — see Troubleshooting §3                    |
| `Could not find android_channel_id` | Remove field or create channel in OneSignal dashboard                  |
| No `onNewToken` on emulator         | Switch to Google Play system image                                     |
| `401 Unauthorized`                  | Use `Authorization: Key ${key}` for `os_v2_app_*`                      |
| No channel in dumpsys               | Add `small_icon` + `priority` + `android_visibility` to payload        |
