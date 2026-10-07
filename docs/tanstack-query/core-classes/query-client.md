# Core Class: `QueryClient`

`QueryClient` manages the query and mutation caches, coordinates background refetching, and provides methods to query or manipulate cache entries.

---

## 1. Initialization & Default Options

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false, // In RN, managed by focusManager
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## 2. Key Methods

### A. `invalidateQueries`

Marks matching queries as stale and immediately refetches active queries:

```ts
// Invalidate all queries matching ['todos']:
await queryClient.invalidateQueries({
  queryKey: ["todos"],
  exact: false, // Matches ['todos'], ['todos', 1], etc.
  refetchType: "active", // Only refetch currently mounted components
});
```

### B. `setQueryData` & `getQueryData`

Directly read or write to the cache synchronously:

```ts
// Read:
const user = queryClient.getQueryData<User>(["user", userId]);

// Update:
queryClient.setQueryData<User>(["user", userId], (oldUser) => ({
  ...oldUser!,
  name: "Updated Name",
}));
```

### C. `fetchQuery` & `prefetchQuery`

Fetches a query and either returns its promise or stores it in the cache for upcoming screens:

```ts
// Prefetch user profile before screen transition:
await queryClient.prefetchQuery({
  queryKey: ["user", nextUserId],
  queryFn: () => api.fetchUser(nextUserId),
  staleTime: 1000 * 60 * 5,
});
```

### D. `resetQueries`, `cancelQueries`, `removeQueries`, `clear`

- **`cancelQueries({ queryKey })`**: Aborts outgoing network requests using `AbortController`.
- **`removeQueries({ queryKey })`**: Deletes query entries completely from the cache.
- **`clear()`**: Clears the entire QueryClient cache (ideal for user logout).
