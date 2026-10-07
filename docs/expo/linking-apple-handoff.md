# Apple Handoff (Expo Router)

Apple Handoff enables cross-device navigation continuity — a user starts on one Apple device and picks up on another with the same app state.

---

## Requirements

- **Apple-only** — Handoff is an Apple ecosystem feature
- Requires Universal Links with the `activitycontinuation` entitlement
- Your app must be associated with a website via an AASA file

---

## AASA File

Your `apple-app-site-association` file must include the `activitycontinuation.apps` array:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAMID.com.example.myapp"],
        "paths": ["/feed/*", "/detail/*"]
      }
    ]
  },
  "activitycontinuation": {
    "apps": ["TEAMID.com.example.myapp"]
  },
  "webcredentials": {
    "apps": ["TEAMID.com.example.myapp"]
  }
}
```

Generate the AASA for development:

```bash
npx setup-safari
```

---

## Expo Head Setup

Configure `headOrigin` in your Expo Router config plugin to enable handoff metadata:

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headOrigin": "https://example.com"
        }
      ]
    ]
  }
}
```

---

## Usage

Add the `<Head>` component from `expo-router/head` with handoff meta tags:

```tsx
import { Head } from 'expo-router/head';

function FeedScreen() {
  return (
    <>
      <Head>
        <meta property="expo:handoff" content="true" />
        <meta property="og:url" content="https://example.com/feed/123" />
        <meta property="og:title" content="Feed Post" />
        <meta property="og:description" content="View this feed post" />
      </Head>
      {/* Screen content */}
    </>
  );
}
```

### Meta Tags

| Property | Description |
|----------|-------------|
| `expo:handoff` | Enable handoff for this screen (`"true"` or `"false"`) |
| `og:url` | Canonical URL for the current screen |
| `og:title` | Title shown in handoff banner |
| `og:description` | Description shown in handoff banner |

---

## Debugging

1. **App Switcher** — Swipe to app switcher (or Cmd+Tab on Mac). The handoff banner appears on the same Apple ID device if handoff is working.
2. **Verify entitlements** — Check that `associatedDomains` includes your domain:

   ```json
   // app.json
   {
     "expo": {
       "ios": {
         "associatedDomains": ["applinks:example.com"]
       }
     }
   }
   ```

3. **Rebuild after changes** — Rebuild the dev client after modifying AASA or associated domains.

---

## Known Issues

- **Web-to-native handoff** does not support client-side routing. The initial URL is resolved server-side, so routes that depend on client-side state transitions won't hand off correctly.
- Handoff requires both devices to be signed into the same Apple ID with Handoff enabled in System Settings.
- There can be a short delay (5–10 seconds) before the handoff banner appears in the App Switcher.
