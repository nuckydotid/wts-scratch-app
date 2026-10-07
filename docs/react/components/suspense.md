# Built-in Component: `<Suspense>`

`<Suspense>` lets you display a fallback UI while its child components are loading data, assets, or code chunks.

---

## Reference

```tsx
<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
```

### Props

- **`children`**: The actual UI you intend to render. If `children` suspends while rendering, the Suspense boundary will switch to rendering `fallback`.
- **`fallback`**: An alternate UI to render in place of the actual UI if it has not finished loading. Any valid React node is accepted.

---

## Key Use Cases

### 1. Streaming Server-Side Rendering (SSR) & Server Components

When used with Server Components and Streaming SSR frameworks, `<Suspense>` streams HTML as soon as parts of the page become ready, rather than waiting for the entire database query to resolve before sending any bytes to the client.

```tsx
import { Suspense } from "react";
import { Feed, Navigation, ProfileHeader } from "./components";

export function UserDashboard() {
  return (
    <div>
      <Navigation />
      {/* Profile renders immediately */}
      <ProfileHeader />

      {/* Feed streams in as data arrives */}
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </div>
  );
}
```

### 2. Code-Splitting with `lazy`

```tsx
import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("./HeavyChart"));

export function AnalyticsTab() {
  return (
    <Suspense
      fallback={<div className="chart-loading">Loading chart library...</div>}
    >
      <HeavyChart />
    </Suspense>
  );
}
```

### 3. Nested Suspense Boundaries

You can nest Suspense boundaries to reveal content progressively:

```tsx
<Suspense fallback={<BigSpinner />}>
  <Biography />
  <Suspense fallback={<AlbumsSkeleton />}>
    <Albums />
  </Suspense>
</Suspense>
```
