# Utility Hooks: `useId`, `useSyncExternalStore` & `useDebugValue`

---

## 1. `useId`

`useId` is a React Hook for generating unique IDs that are stable across server-side rendering (SSR) and client hydration.

### Syntax

```tsx
const id = useId();
```

### Why use `useId` instead of `Math.random()`?

`Math.random()` causes hydration mismatches between SSR HTML and client rendering. `useId` produces deterministic IDs based on the component's position in the React render tree (e.g., `:r1:`, `:r2:`).

### Example: Accessible Form Controls

```tsx
import { useId } from "react";

export function TextField({ label }: { label: string }) {
  const id = useId();
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}
```

---

## 2. `useSyncExternalStore`

`useSyncExternalStore` is a React Hook for subscribing to external data stores (such as Zustand, Redux, MMKV, or browser DOM APIs) while preventing tearing in Concurrent Rendering.

### Syntax

```tsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
```

### Parameters

- **`subscribe`**: A function taking a single `callback` argument and subscribing to the store. Must return an unsubscribe function.
- **`getSnapshot`**: A function returning a snapshot of the data from the store. Must return immutable values or primitive values to prevent infinite loops.
- **`getServerSnapshot`** _(optional)_: Returns the initial snapshot during SSR.

### Example: Subscribing to Browser Online Status

```tsx
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
```

---

## 3. `useDebugValue`

`useDebugValue` is a React Hook that lets you add a label to a custom Hook in React DevTools.

### Syntax

```tsx
useDebugValue(value, format?);
```

### Example

```tsx
import { useDebugValue } from "react";

export function useFriendStatus(friendId: string) {
  const isOnline = useOnlineStatus();
  useDebugValue(isOnline ? "Online" : "Offline");
  return isOnline;
}
```
