# Built-in Component: `<Activity>` & `<ViewTransition>`

React 19 introduces high-performance components for background rendering, tab pre-warming, and native View Transitions.

---

## 1. `<Activity>` (Offscreen Rendering)

`<Activity>` lets you keep a component tree mounted in memory while hiding its DOM nodes and deferring its background updates.

```tsx
import { Activity } from "react";

export function TabContent({ isVisible }: { isVisible: boolean }) {
  return (
    <Activity mode={isVisible ? "visible" : "hidden"}>
      {/* State and scroll position are preserved even when hidden! */}
      <HeavyDataGrid />
    </Activity>
  );
}
```

### Benefits

- **Preserves State & Scroll**: Preserves internal state, scroll offsets, and input field values without re-mounting.
- **De-prioritizes Background Effects**: When `mode="hidden"`, Effects are paused and background CPU cycles are deferred.

---

## 2. `<ViewTransition>`

`<ViewTransition>` integrates React rendering with the browser's native View Transitions API for seamless layout and route transitions.
