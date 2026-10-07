---
name: expo-linking
description: Expo deep linking, Universal Links, App Links, URL schemes, and Expo Router native-intent configuration for React Native apps.
---

# Expo Linking Skill

Use this skill when implementing deep linking, universal links, custom URL schemes, or navigation from external URLs in an Expo/React Native app.

Your documentation references:

- Linking overview: `docs/expo/linking-overview.md`
- Deep links (into your app): `docs/expo/linking-deep-links.md`
- Outgoing links (into other apps): `docs/expo/linking-outgoing.md`
- Android App Links: `docs/expo/linking-android-app-links.md`
- iOS Universal Links: `docs/expo/linking-ios-universal-links.md`
- expo-linking SDK reference: `docs/expo/linking-sdk-reference.md`
- Customizing links (+native-intent): `docs/expo/linking-native-intent.md`
- Apple Handoff: `docs/expo/linking-apple-handoff.md`

## Quick Reference

### Add Custom Scheme (Deep Links)

```json
{ "expo": { "scheme": "myapp" } }
```

### Handle Incoming URLs (Expo Router — automatic)

Expo Router auto-enables deep linking for all routes. No extra config needed.

### Handle Incoming URLs (without Expo Router)

```tsx
import * as Linking from "expo-linking";

const url = Linking.useLinkingURL();
const { hostname, path, queryParams } = Linking.parse(url);
```

### Open URLs in Other Apps

```tsx
import * as Linking from "expo-linking";
Linking.openURL("https://expo.dev");
Linking.openURL("mailto:[email protected]");
Linking.openURL("tel:+123456789");
```

### Android App Links (intentFilters)

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "*.example.com",
              "pathPrefix": "/records"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

Host `public/.well-known/assetlinks.json` with `package_name` and `sha256_cert_fingerprints`.

### iOS Universal Links (associatedDomains)

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:example.com"]
    }
  }
}
```

Host `public/.well-known/apple-app-site-association` with `applinks`, `activitycontinuation`, `webcredentials`.

### Customizing Links (+native-intent.tsx)

```tsx
// src/app/+native-intent.tsx
export function redirectSystemPath({ path, initial }) {
  if (initial && /* third-party URL */) {
    return "/converted-route";
  }
  return path;
}
```

### Key APIs

| API                       | Purpose                                |
| ------------------------- | -------------------------------------- |
| `Linking.useLinkingURL()` | Hook to get current deep link URL      |
| `Linking.parse(url)`      | Parse hostname, path, queryParams      |
| `Linking.openURL(url)`    | Open URL in external app/browser       |
| `Linking.createURL(path)` | Create a URL pointing back to your app |
| `Linking.canOpenURL(url)` | Check if an app can handle a URL       |
| `Linking.getInitialURL()` | Get URL that launched the app          |
