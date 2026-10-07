# worktrees-studio-google-sign-in

Android Google Sign-In returning an ID token for backend authentication.

## Platforms

Android, Web.

## API

```typescript
import { signInAsync, signOutAsync } from "worktrees-studio-google-sign-in";
```

### `signInAsync({ webClientId })`

```typescript
const result = await signInAsync({ webClientId: "..." });
// result: { idToken: string }
```

### `signOutAsync({ webClientId? })`

```typescript
await signOutAsync();
```

## Types

```typescript
type SignInOptions = { webClientId: string };
type SignInResult = { idToken: string };
type SignOutOptions = { webClientId?: string };
```

## Android Implementation

- Uses `GoogleSignInClient` from Play Services Auth (`play-services-auth:21.4.0`)
- Requests ID token via `requestIdToken(webClientId)`
- Uses `OnActivityResult` pattern with request code `9912`

## Integration

```typescript
import { signInAsync } from "worktrees-studio-google-sign-in";

const { idToken } = await signInAsync({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
});
```

## Important

- Android only (for now). iOS/web stubs throw "only available on Android".
- Requires `webClientId` from Google Cloud Console (OAuth 2.0 Web Client ID).
