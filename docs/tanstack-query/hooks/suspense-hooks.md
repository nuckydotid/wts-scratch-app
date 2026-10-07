# TanStack Query: Suspense Hooks (`useSuspenseQuery`)

TanStack Query v5 provides dedicated Suspense hooks that integrate seamlessly with React 19 `<Suspense>` and Error Boundaries.

---

## 1. `useSuspenseQuery`

Unlike `useQuery`, `useSuspenseQuery` **guarantees that `data` is defined and never `undefined`**:

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: string }) {
  // Guaranteed non-null data; suspends while loading!
  const { data } = useSuspenseQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  return (
    <div>
      Welcome, {data.name}! ({data.email})
    </div>
  );
}

export function ProfilePage({ userId }: { userId: string }) {
  return (
    <ErrorBoundary fallback={<ErrorCard />}>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 2. `useSuspenseInfiniteQuery` & `useSuspenseQueries`

- **`useSuspenseInfiniteQuery`**: Suspense-enabled infinite scroll query.
- **`useSuspenseQueries`**: Suspense-enabled parallel queries.
