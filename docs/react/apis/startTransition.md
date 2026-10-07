# Core API: `startTransition` & `addTransitionType`

`startTransition` lets you update the state without blocking the UI. Unlike `useTransition`, `startTransition` is a standalone function that can be called outside of React component rendering (e.g. inside data stores or utility modules).

---

## Reference

```tsx
import { startTransition } from "react";

export function updateQuery(query: string) {
  startTransition(() => {
    setSearchResults(query);
  });
}
```
