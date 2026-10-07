# Linking Into Your App (Deep Links)

Deep links allow users to navigate to specific screens within your app using a custom URL scheme. This guide covers configuring, testing, and handling deep links in Expo apps.

## Add a Custom Scheme

Register a custom URL scheme in your app config:

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

After building, your app responds to URLs like `myapp://`, `myapp://products/42`, or `myapp://settings`.

### Scheme Rules

- Use lowercase letters, numbers, and hyphens only
- Avoid reserved schemes (`http://`, `https://`, `mailto:`)
- Choose a unique scheme to prevent conflicts with other apps

## Test Deep Links

Use the `uri-scheme` CLI to test deep links during development.

### Android

```bash
npx uri-scheme open myapp://products/42 --android
```

### iOS

```bash
npx uri-scheme open myapp://products/42 --ios
```

### Expo Go

When testing in Expo Go, use the `exp://` scheme:

```bash
npx uri-scheme open exp://192.168.1.100:8081/--/products/42 --ios
```

The `--/` separator tells Expo Go to treat the path after it as a route within your app.

## Handle URLs

Use the `Linking` API from `expo-linking` to listen for incoming deep links.

### UseLinkingURL Hook

```tsx
import { useLinkingURL } from 'expo-linking';

export default function Screen() {
  const url = useLinkingURL();

  // url: "myapp://products/42"
}
```

The `useLinkingURL` hook re-renders when a new deep link is received, making it ideal for reactive handling.

### Listening for URLs

```tsx
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export default function Screen() {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
    });

    return () => subscription.remove();
  }, []);
}
```

## Parse URLs

Use `Linking.parse()` to extract components from a deep link URL.

```tsx
import * as Linking from 'expo-linking';

const url = 'myapp://products/42?color=red';
const parsed = Linking.parse(url);

// Returns:
{
  hostname: 'products',
  path: '42',
  queryParams: { color: 'red' }
}
```

### Parse Results

| Property | Description | Example |
|---|---|---|
| `hostname` | First path segment | `"products"` |
| `path` | Remaining path after hostname | `"42"` |
| `queryParams` | Query string parameters as object | `{ color: "red" }` |

### Using Parse Results

```tsx
import * as Linking from 'expo-linking';

function handleDeepLink(url: string) {
  const { hostname, path, queryParams } = Linking.parse(url);

  if (hostname === 'products' && path) {
    // Navigate to product with id=path
  }
}
```

## Limitations

### No Fallback if App Not Installed

Deep links fail silently if the app is not installed on the user's device. Unlike universal links, there is no automatic redirect to the App Store or Play Store.

### Workaround

Implement a redirect page on your website that detects mobile devices and directs users to download the app:

```tsx
// Web redirect page
if (isMobileDevice) {
  // Show "Open in App" button or redirect to store
} else {
  // Show web version
}
```

### Expo Go Limitations

When testing with Expo Go, the deep link scheme is `exp://` followed by your development server address. This differs from your production scheme and cannot be used for production testing.

## Complete Example

```tsx
import { useLinkingURL } from 'expo-linking';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function ProductScreen() {
  const url = useLinkingURL();

  useEffect(() => {
    if (url) {
      const { hostname, path, queryParams } = Linking.parse(url);

      if (hostname === 'products' && path) {
        // Fetch product with id=path
        // Apply queryParams if needed
      }
    }
  }, [url]);

  return (
    <View>
      <Text>Product Screen</Text>
    </View>
  );
}
```

## Resources

- [Expo Linking API](https://docs.expo.dev/versions/latest/linking/)
- [Expo Router Deep Linking](https://docs.expo.dev/router/advanced/deep-linking/)
- [uri-scheme CLI](https://www.npmjs.com/package/uri-scheme)
