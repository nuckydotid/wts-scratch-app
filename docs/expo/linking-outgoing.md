# Linking Into Other Apps

Expo provides APIs to open links to other apps using URL schemes and handle deep links back into your app.

## Using `expo-linking`

### `Linking.openURL()`

Open a URL in the system browser or another app using a custom URL scheme.

```tsx
import * as Linking from "expo-linking";

function OpenOtherApp() {
  return (
    <Button
      onPress={() => Linking.openURL("https://docs.expo.dev")}
      title="Open Expo Docs"
    />
  );
}
```

Open apps using their custom URL schemes:

```tsx
// Open Twitter
Linking.openURL("twitter://search?query=expo");

// Open Spotify
Linking.openURL("spotify:");

// Open YouTube
Linking.openURL("youtube://www.youtube.com/watch?v=dQw4w9WgXcQ");
```

### `Linking.canOpenURL()`

Check if the device can handle a URL before attempting to open it:

```tsx
const canOpen = await Linking.canOpenURL("twitter://");
if (canOpen) {
  await Linking.openURL("twitter://");
} else {
  await Linking.openURL("https://twitter.com");
}
```

> **Note:** On iOS, `canOpenURL` requires you to declare the URL schemes your app queries in `LSQuerySchemes` in your app's `Info.plist`. See [Apple's documentation on querying URL schemes](https://developer.apple.com/documentation/uikit/uiapplication/1623312-canopenurl) for more information. Expo automatically adds all the schemes used by the libraries in your project.

## Using Expo Router `Link` Component

For in-app navigation, use Expo Router's `Link` component:

```tsx
import { Link } from "expo-router";

function HomeScreen() {
  return (
    <Link href="/profile">Go to Profile</Link>
  );
}
```

## Common URL Schemes

| Scheme | Usage | Example |
| --- | --- | --- |
| `https` | Open websites in the system browser | `https://docs.expo.dev` |
| `mailto` | Open the default email app | `mailto:someone@example.com` |
| `tel` | Open the default phone dialer with a number | `tel:+15555555555` |
| `sms` | Open the default messaging app | `sms:+15555555555` |

## Android Intent Queries (API 30+)

Starting with Android API level 30, apps must declare the URL schemes they query in `AndroidManifest.xml`. Expo provides a config plugin for `expo-linking` to make this easier:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-linking",
        {
          "schemes": ["myapp", "com.myapp.scheme"]
        }
      ]
    ]
  }
}
```

## Custom URL Schemes of Third-Party Apps

Many third-party apps register custom URL schemes you can use to open them directly. Examples:

| App | URL Scheme |
| --- | --- |
| Twitter | `twitter://` |
| Spotify | `spotify:` |
| YouTube | `youtube://` |
| Facebook | `fb://` |
| Instagram | `instagram://` |
| WhatsApp | `whatsapp://` |

To find an app's URL scheme, check their developer documentation or use a search engine.

## Creating Redirect URLs

Use `Linking.createURL()` to create a redirect URL that the system can use to return to your app after authentication or other flows:

```tsx
import * as Linking from "expo-linking";

// Create a URL like "myapp://"
const redirectUrl = Linking.createURL("/");

// Create a URL with a path
const redirectUrl = Linking.createURL("/auth/callback");

// Example with auth session
import * as AuthSession from "expo-auth-session";

const request = new AuthSession.AuthRequest({
  clientId: "your-client-id",
  scopes: ["profile"],
  redirectUri: Linking.createURL("/auth/callback"),
});
```

## In-App Browsers

Use `expo-web-browser` to open URLs in an in-app browser instead of the system browser:

```tsx
import * as WebBrowser from "expo-web-browser";

async function openInAppBrowser() {
  const result = await WebBrowser.openBrowserAsync(
    "https://docs.expo.dev"
  );
  // result.type can be 'cancel', 'dismiss', or 'success'
}
```

### Warm Up and Cool Down

Pre-load the in-app browser to make it feel faster:

```tsx
import * as WebBrowser from "expo-web-browser";

// Call early in your app to warm up
WebBrowser.warmUpAsync();

// Call when done to release resources
WebBrowser.coolDownAsync();
```

### Handling Redirects

For OAuth flows, use `AuthSession` with the `useProxy` option:

```tsx
import { useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const discovery = {
  authorizationEndpoint: "https://provider.com/authorize",
  tokenEndpoint: "https://provider.com/token",
};

function Login() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "client-id",
      scopes: ["profile"],
      redirectUri: Linking.createURL("/"),
      usePKCE: true,
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      // Exchange code for token
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      onPress={() => promptAsync({ useWebBrowser: true })}
      title="Sign In"
    />
  );
}
```
