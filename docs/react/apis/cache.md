# Core API: `cache` & `cacheSignal`

`cache` is a React API that lets you cache the result of a data fetch or computation across a single server request lifecycle.

---

## 1. `cache`

```tsx
import { cache } from "react";
import db from "./db";

// Deduplicates calls to getUser across all server components in the same request:
export const getUser = cache(async (userId: string) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  return user;
});
```

### Key Differences: `cache` vs `useMemo`

- **`cache`**: Designed for Server Components. Deduplicates calls across an entire request tree based on argument equality.
- **`useMemo`**: Designed for Client Components. Caches values within a single component across re-renders based on a dependency array.

---

## 2. `cacheSignal`

`cacheSignal` provides an `AbortSignal` tied to the cache entry's lifetime for cancelling long-running async computations or database streams.
