# Customizing Links with +native-intent.tsx

Expo Router supports custom redirecting via a special `+native-intent.tsx` file. This lets you rewrite incoming deep link paths before navigation occurs.

## Setup

Create a file at `src/app/+native-intent.tsx` in your Expo Router project:

```tsx
// src/app/+native-intent.tsx
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | null {
  // Return the rewritten path, or null to block navigation
  return path;
}
```

The `redirectSystemPath` function receives the incoming path and returns the path to navigate to. Return `null` to prevent navigation.

---

## Rewrite Incoming Native Deep Links

Use this to handle third-party or stale deep links and map them to valid routes.

```tsx
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | null {
  // Redirect old "/post/:id" links to new "/feed/:id"
  const postMatch = path.match(/^\/post\/(\d+)$/);
  if (postMatch) {
    return `/feed/${postMatch[1]}`;
  }

  // Block unknown third-party schemes
  if (!initial && path.startsWith('/external/')) {
    return null;
  }

  return path;
}
```

---

## Rewrite Incoming Web Deep Links

Handle server-side redirects or client-side redirect patterns for web links that open in the app.

```tsx
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | null {
  // Handle server redirect pattern: /old-page -> /new-page
  if (path === '/old-page') {
    return '/new-page';
  }

  // Handle query-based redirects: /r?id=123 -> /item/123
  if (path.startsWith('/r')) {
    const url = new URL(path, 'http://localhost');
    const id = url.searchParams.get('id');
    if (id) return `/item/${id}`;
  }

  return path;
}
```

---

## Rewrite URLs While the App Is Open

For runtime URL rewriting (after the app has launched), use the `usePathname()` hook with a component that watches for path changes.

```tsx
import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';

export function RuntimeLinkRewriter() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith('/legacy/')) {
      const slug = pathname.replace('/legacy/', '');
      router.replace(`/${slug}`);
    }
  }, [pathname]);

  return null;
}
```

---

## Sending Navigation Events to Third-Party Services

Integrate with analytics or attribution platforms by intercepting the path and forwarding it.

```tsx
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | null {
  if (initial) {
    // Send to analytics
    fetch('https://analytics.example.com/track', {
      method: 'POST',
      body: JSON.stringify({ deepLink: path }),
    });
  }

  return path;
}
```

---

## Universal Links and Multiple Domains

With Expo Router, no extra configuration is needed for Universal Links beyond setting up your `apple-app-site-association` (AASA) file. Expo Router handles the routing automatically for all domains configured in your AASA.

```bash
npx setup-safari
```

This command generates and deploys your AASA file for development.

---

## Forcing Web Links

To force navigation through the browser instead of the app, use a fully-qualified domain name (FQDN) URL with `http://` or `https://`:

```tsx
import { Link } from 'expo-router';

// Opens in-app (deep link)
<Link href="/settings">Settings</Link>

// Forces browser
<Link href="https://example.com/docs">Documentation</Link>

// Programmatic
import * as Linking from 'expo-linking';
await Linking.openURL('https://example.com/docs');
```

---

## `legacy_subscribe` API (Alpha)

For React Navigation compatibility, `+native-intent.tsx` exports a `legacy_subscribe` function. This is an **alpha API** and may change.

```tsx
// src/app/+native-intent.tsx
export function legacy_subscribe({ path }: { path: string }): string | null {
  // Map React Navigation-style paths to Expo Router paths
  if (path.startsWith('Detail/')) {
    return `/${path.replace('Detail/', 'detail/')}`;
  }
  return path;
}
```

> **Warning:** This API is in alpha. Prefer `redirectSystemPath` for new projects.
