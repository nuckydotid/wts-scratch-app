# Core API: `createContext`

`createContext` lets you create a Context that components can provide or read.

---

## Reference

```tsx
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType | null>(null);
```

### React 19 Enhancement: Direct Context Rendering

In React 19, `<Context>` can be rendered directly as a provider without needing `<Context.Provider>`:

```tsx
// React 19:
<AuthContext value={authData}>
  <App />
</AuthContext>

// Legacy (still supported for backwards compatibility):
<AuthContext.Provider value={authData}>
  <App />
</AuthContext.Provider>
```
