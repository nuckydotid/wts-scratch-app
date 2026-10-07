# TanStack Query State Hooks: `useMutationState`, `useIsFetching` & `useIsMutating`

---

## 1. `useMutationState` (v5 Global Mutation Tracker)

Track ongoing mutations across your entire app (e.g. for global upload progress bars or optimistic UI badges):

```tsx
import { useMutationState } from "@tanstack/react-query";

export function GlobalUploadProgress() {
  // Reads variables of all active 'uploadPhoto' mutations:
  const pendingUploads = useMutationState({
    filters: { mutationKey: ["uploadPhoto"], status: "pending" },
    select: (mutation) => mutation.state.variables as { filename: string },
  });

  if (pendingUploads.length === 0) return null;

  return (
    <div className="upload-banner">
      Uploading {pendingUploads.length} photos...
    </div>
  );
}
```

---

## 2. `useIsFetching` & `useIsMutating`

```tsx
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function GlobalNetworkIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (!isFetching && !isMutating) return null;

  return <div className="spinner">Syncing with server...</div>;
}
```
