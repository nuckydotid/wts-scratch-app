# Push Notifications (OneSignal)

OneSignal push notification management for iOS and Android.

## Platforms

iOS and Android (via OneSignal Expo SDK).

## Setup

See [docs/onesignal/expo-sdk-setup.md](../onesignal/expo-sdk-setup.md) for full setup instructions.

### Quick Start

```bash
npx expo install onesignal-expo-plugin
npm install --save react-native-onesignal
```

### Plugin Config (`app.config.ts`)

```typescript
import withOneSignal from "onesignal-expo-plugin/plugin";

plugins: [
  withOneSignal({
    mode: "development",
    disableLocation: true,
    smallIcons: ["./assets/images/ic_onesignal_small_icon_default.png"],
    largeIcons: ["./assets/images/ic_onesignal_large_icon_default.png"],
    smallIconAccentColor: "#079789",
  }),
];
```

## API

```typescript
import { OneSignal } from "react-native-onesignal";

// Initialize (in root layout)
OneSignal.initialize("ONESIGNAL_APP_ID");

// User identification (after login)
OneSignal.login(userId);
OneSignal.logout();

// Tags for segmentation
OneSignal.User.addTags({ role: "teacher", semester: "2026-1" });

// Push permission
OneSignal.Notifications.requestPermission(true);

// Notification events
OneSignal.Notifications.addEventListener("click", handler);
OneSignal.Notifications.addEventListener("foregroundWillDisplay", handler);
```

## Backend (Google Cloud Workers)

Notifications are sent via OneSignal REST API from `api/src/lib/notifications.ts`.

### Environment Variables

| Variable            | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `ONESIGNAL_APP_ID`  | Public app ID (safe for client)                        |
| `ONESIGNAL_API_KEY` | Secret API key (server only, starts with `os_v2_app_`) |

### Send Push

```typescript
import { notifyUsers } from "./lib/notifications";

await notifyUsers(env, db, userIds, title, body, data);
```

## Key Docs

- [Expo SDK Setup](../onesignal/expo-sdk-setup.md)
- [Mobile SDK Reference](../onesignal/mobile-sdk-reference.md)
- [Push Permissions](../onesignal/push-permissions.md)
