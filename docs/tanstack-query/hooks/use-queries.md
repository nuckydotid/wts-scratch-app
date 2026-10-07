# TanStack Query Hook: `useQueries`

`useQueries` executes a dynamic or variable number of queries in parallel without violating the Rules of Hooks.

---

## 1. Syntax & Dynamic Mapping

```tsx
import { useQueries } from "@tanstack/react-query";

export function useUsers(userIds: string[]) {
  return useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => fetchUser(id),
      staleTime: 1000 * 60 * 5,
    })),
    // Optional v5 combine function to aggregate results:
    combine: (results) => ({
      data: results.map((result) => result.data).filter(Boolean),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  });
}
```
