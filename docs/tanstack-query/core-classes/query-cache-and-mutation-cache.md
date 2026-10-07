# Core Classes: `QueryCache` & `MutationCache`

Individual cache instances that hold query and mutation records and allow global lifecycle subscriptions.

---

## 1. Global Error Logging with `QueryCache`

```ts
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(
        `[Query Error] on key ${JSON.stringify(query.queryKey)}:`,
        error,
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(
        `[Mutation Error] on key ${JSON.stringify(mutation.options.mutationKey)}:`,
        error,
      );
    },
  }),
});
```
