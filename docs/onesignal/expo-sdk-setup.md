# OneSignal Expo SDK Setup

## Installation

```bash
npx expo install onesignal-expo-plugin react-native-onesignal
```

## App Configuration

### app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      },
      "entitlements": {
        "aps-environment": "development"
      }
    },
    "plugins": [
      [
        "onesignal-expo-plugin",
        {
          "mode": "development",
          "devTeam": "YOUR_APPLE_DEVELOPER_TEAM_ID"
        }
      ]
    ]
  }
}
```

> **Plugin order for Worktrees Studio:** This project has a custom `config/with-firebase-messaging.js` plugin that injects `firebase-messaging:24.0.0` (see [Troubleshooting → SERVICE_NOT_AVAILABLE](troubleshooting.md#1-servicenotavailable--firebase-bom-version-mismatch)). That plugin **must come before** `onesignal-expo-plugin`. See `app.config.ts:112-120` for the actual Worktrees Studio order. For a vanilla OneSignal setup, OneSignal should still be first.

> **Worktrees Studio variant wiring:** The Worktrees Studio app resolves `ONESIGNAL_APP_ID` per-variant from `config/build.ts` (`ONESIGNAL_APP_IDS: { staging: "c5862cfc-...", prod: envVar }`). See [Troubleshooting → Unified Build Config](troubleshooting.md#3-syntaxerror-unexpected-token--unified-configbuildts).

## Plugin Props

| Prop                     | Type                            | Default         | Description                            |
| ------------------------ | ------------------------------- | --------------- | -------------------------------------- |
| `mode`                   | `"development" \| "production"` | `"development"` | Xcode build configuration              |
| `devTeam`                | `string`                        | `""`            | Apple Developer Team ID                |
| `iPhoneDeploymentTarget` | `string`                        | `"16.0"`        | iOS minimum deployment target          |
| `smallIcons`             | `string[]`                      | `[]`            | Small notification icon filenames      |
| `largeIcons`             | `string[]`                      | `[]`            | Large notification icon filenames      |
| `smallIconAccentColor`   | `string`                        | `""`            | Accent color for small icons           |
| `iosNSEFilePath`         | `string`                        | `""`            | Custom NSE file path                   |
| `appGroupName`           | `string`                        | `""`            | App Group name for NSE                 |
| `nseBundleIdentifier`    | `string`                        | `""`            | NSE bundle identifier                  |
| `disableNSE`             | `boolean`                       | `false`         | Disable Notification Service Extension |
| `disableLocation`        | `boolean`                       | `false`         | Disable location collection            |
| `sounds`                 | `string[]`                      | `[]`            | Custom notification sound filenames    |

## Initialization

```typescript
import OneSignal from "react-native-onesignal";

// Initialize OneSignal with your App ID
OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");

// Prompt for push notifications
OneSignal.Notifications.requestPermission();
```

## Expo Router Initialization Pattern

Create a provider component to initialize OneSignal in your app layout:

```typescript
// providers/OneSignalProvider.tsx
import { useEffect } from 'react';
import OneSignal from 'react-native-onesignal';

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    OneSignal.initialize('YOUR_ONESIGNAL_APP_ID');
    OneSignal.Notifications.requestPermission();
  }, []);

  return <>{children}</>;
}
```

Then wrap your root layout:

```typescript
// app/_layout.tsx
import { OneSignalProvider } from '@/providers/OneSignalProvider';

export default function RootLayout() {
  return (
    <OneSignalProvider>
      {/* Your app content */}
    </OneSignalProvider>
  );
}
```

## Notification Channel (Android)

OneSignal creates notification channels server-side via `chnl_lst`. If you reference `android_channel_id` in a REST payload, the channel must already exist in the OneSignal dashboard (Settings → Configure → Android → Notification Categories). If you add `android_channel_id` before the channel exists, the API returns `400 Could not find android_channel_id`. See [Troubleshooting → android_channel_id](troubleshooting.md#4-could-not-find-androidchannelid--channel-must-pre-exist-on-onesignal).

For reliable delivery, the Worktrees Studio payloads include `small_icon` + `priority` + `android_visibility` (see [Troubleshooting → Silent drop](troubleshooting.md#5-silent-drop-after-fcm-tickle--doze--priority--channel)). No custom channel is required for staging; add one when you need High importance or custom sound.

## Emulator vs Physical Device

Android emulators with `google-apis` or `pre-release` system images lack full Google Play Services — FCM token registration silently fails (`onNewToken` never fires). Use a **Google Play** system image or a **physical device** for push testing. See [Troubleshooting → No onNewToken](troubleshooting.md#6-no-onnewtoken--emulator-without-play-services).

## Disable Location (Optional)

To disable location collection, add `disableLocation` to the plugin config:

```json
{
  "expo": {
    "plugins": [
      [
        "onesignal-expo-plugin",
        {
          "disableLocation": true
        }
      ]
    ]
  }
}
```
