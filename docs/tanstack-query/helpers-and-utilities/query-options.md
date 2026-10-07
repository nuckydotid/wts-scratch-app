# TanStack Query Helper: `queryOptions`

`queryOptions` is a type-safe helper function to declare reusable query configurations shared across `useQuery`, `prefetchQuery`, and route loaders.

---

## Reference

```ts
// lib/queries/todos.ts
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const todosQueryOptions = (status: "all" | "done") =>
  queryOptions({
    queryKey: ["todos", { status }],
    queryFn: () => api.todos.get(status),
    staleTime: 1000 * 60 * 5,
  });

// Component A (UI):
const { data } = useQuery(todosQueryOptions("done"));

// Component B (Prefetching):
await queryClient.prefetchQuery(todosQueryOptions("done"));

// Component C (Direct cache access):
const cachedTodos = queryClient.getQueryData(
  todosQueryOptions("done").queryKey,
);
```
