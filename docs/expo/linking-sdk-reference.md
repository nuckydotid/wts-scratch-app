# expo-linking API Reference

## Installation

```bash
npx expo install expo-linking
```

## Hooks

### `useURL()`

Returns the URL that opened the app, or `null` if none. Listens for incoming links while the app is open.

```tsx
import { useURL } from 'expo-linking';

function MyScreen() {
  const url = useURL();

  if (url) {
    console.log('Opened via link:', url);
  }
}
```

### `useLinkingURL()`

Optimized hook that returns the linking URL. Prefer over `useURL()` in Expo Router projects.

---

## Methods

### `canOpenURL(url)`

Check if the app can open a URL (e.g., `mailto:`, `tel:`, or a deep link).

```tsx
import * as Linking from 'expo-linking';

const supported = await Linking.canOpenURL('mailto:hello@example.com');
```

> **Note:** On iOS 9+, you must declare URL schemes in `Info.plist` under `LSApplicationQueriesSchemes`.

### `openURL(url)`

Open a URL in the system (browser, mail client, or another app).

```tsx
await Linking.openURL('https://expo.dev');
```

### `openSettings()`

Open the OS settings page for the current app (iOS and Android only).

### `createURL(path, options)`

Create a deep link URL for the current app.

```tsx
const url = Linking.createURL('feed/123');
// exp://127.0.0.1:19000/--/feed/123

const url = Linking.createURL('feed/123', {
  scheme: 'myapp',
  projectName: 'my-app',
  path: 'feed/123',
});
```

### `getInitialURL()`

Get the URL that opened the app at launch. Returns a `Promise<string | null>`.

```tsx
const initialUrl = await Linking.getInitialURL();
```

### `getLinkingURL()`

Alias for `getInitialURL()` on Expo Go. On development builds, returns the linking URL.

### `clearInitialURL()`

Clear the cached initial URL. Useful if you don't want subsequent calls to `getInitialURL()` to return the same value.

### `parse(url)`

Parse a URL string into an object with `scheme`, `hostname`, `path`, and `queryParams`.

```tsx
const parsed = Linking.parse('https://example.com/feed/123?sort=new');
// { scheme: 'https', hostname: 'example.com', path: 'feed/123', queryParams: { sort: 'new' } }
```

### `parseInitialURLAsync()`

Async version of `parse()` for the initial URL.

### `sendIntent(action, extras)` (Android only)

Send an Android intent with optional extras. Useful for triggering OS-level actions.

```tsx
await Linking.sendIntent('android.intent.action.VIEW', [
  { key: 'android.intent.extra.EMAIL', value: ['user@example.com'] },
]);
```

---

## Event Subscriptions

### `addEventListener('url', handler)`

Listen for incoming links while the app is running.

```tsx
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

function MyScreen() {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
    });

    return () => subscription.remove();
  }, []);
}
```

---

## Types

| Type | Description |
|------|-------------|
| `CreateURLOptions` | Options for `createURL()` — `scheme`, `projectName`, `path`, `queryParams`, `isTripleSlashed` |
| `EventType` | Event payload — `{ url: string }` |
| `ParsedURL` | Result of `parse()` — `{ scheme, hostname, path, queryParams }` |
| `QueryParams` | Record of query parameter key-value pairs |
| `SendIntentExtras` | `{ key: string; value: string \| string[] \| boolean \| number }` for Android intents |
