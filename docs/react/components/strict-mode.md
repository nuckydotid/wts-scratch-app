# Built-in Component: `<StrictMode>`

`<StrictMode>` lets you find common bugs in your components early during development.

---

## Reference

```tsx
import { StrictMode } from "react";

export function RootApp() {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}
```

### Development-Only Behaviors

StrictMode checks run **only in development mode** and do not impact production build performance.

1. **Re-renders components an extra time**:
   Ensures that your render logic is pure and does not produce unexpected side effects.
2. **Re-runs Effects an extra time (Mount → Unmount → Mount)**:
   Verifies that your Effect cleanup functions properly restore state, disconnect WebSockets, cancel network subscriptions, and avoid memory leaks.
3. **Checks for deprecated APIs**:
   Flags legacy APIs such as `findDOMNode`, legacy string refs, and legacy context.
