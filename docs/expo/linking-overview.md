# Expo Linking Overview

Linking allows users to navigate to specific content within your app from external sources such as websites, notifications, or other apps. Expo provides three linking strategies, with Expo Router as the recommended approach.

## Linking Strategies

| Strategy | Use Case | Example |
|---|---|---|
| Universal Links | Open specific content from web URLs | `https://example.com/products/42` opens product screen |
| Deep Links | Open screens via custom scheme | `myapp://products/42` opens product screen |
| Outgoing Links | Navigate users to external websites | Opens browser for external URLs |

## Universal Linking

Universal links use standard web URLs to open content directly in your app. They work by associating your domain with your app through platform-specific verification files.

### Android App Links

Android App Links require a `assetlinks.json` file hosted at `https://your-domain.com/.well-known/assetlinks.json`. This file contains your app's package name and signing key fingerprint, proving domain ownership to Android.

### iOS Universal Links

iOS Universal Links require an `apple-app-site-association` (AASA) file hosted at `https://your-domain.com/.well-known/apple-app-site-association`. This file maps URL paths to your app's bundle identifier and team ID.

### Configuration

Both platforms are configured through your app config:

```json
{
  "expo": {
    "associations": {
      "android": {
        "appLinks": ["https://your-domain.com"]
      },
      "ios": {
        "associatedDomains": ["applinks:your-domain.com"]
      }
    }
  }
}
```

## Deep Links

Deep links use a custom URL scheme to open your app. The scheme is registered with the operating system, and any URL matching `scheme://host/path` will open your app.

```
myapp://products/42
myapp://settings/notifications
```

Custom schemes are configured in your app config:

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

## Expo Router

Expo Router is the recommended approach for handling linking in Expo apps. It provides automatic deep-linking for all screens defined in your file-based routing system.

### How It Works

Every screen in your `app/` directory automatically becomes a deep linkable route without additional configuration. Expo Router generates the linking configuration from your file structure.

```
app/
  index.tsx         → /
  products/
    [id].tsx        → /products/:id
  settings.tsx      → /settings
```

### Benefits

- **Zero configuration**: Screens are deep linkable by default
- **Type-safe routes**: TypeScript types generated from your file structure
- **Nested navigation**: Deep links resolve nested navigation stacks automatically
- **Web support**: Same routes work on web, native, and as deep links
- **Shared links**: Use the same `<Link>` component for navigation and deep linking

### Link Component

```tsx
import { Link } from 'expo-router';

<Link href="/products/42">View Product</Link>
```

### Dynamic Routes

Dynamic segments in your file names become URL parameters:

```tsx
// app/products/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Deep link: myapp://products/42
  // id = "42"
}
```

## Comparison

| Feature | Expo Router | Manual Linking |
|---|---|---|
| Configuration | Automatic from file structure | Manual route mapping |
| Deep link support | Built-in for all routes | Requires `Linking` API setup |
| Type safety | Auto-generated types | Manual type definitions |
| Web support | Native | Separate implementation |
| Nested navigation | Automatic resolution | Manual stack management |

## Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Expo Linking API](https://docs.expo.dev/versions/latest/linking/)
- [Universal Links (Apple)](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [App Links (Android)](https://developer.android.com/training/app-links)
