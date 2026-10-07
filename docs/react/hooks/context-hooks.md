# Context Hooks: `useContext` & `use`

Context lets a parent component provide data to the entire tree below it without passing props manually at every level (prop drilling).

---

## 1. `useContext`

`useContext` is a React Hook that lets you read and subscribe to context from your component.

### Syntax

```tsx
const value = useContext(SomeContext);
```

### Parameters

- **`SomeContext`**: The context that you’ve previously created with `createContext`. The context itself does not hold the information, it only represents the kind of information you can provide or read.

### Returns

Returns the context value for the calling component. It is determined as the `value` passed to the closest `SomeContext.Provider` (or `<SomeContext value={...}>` in React 19) above the calling component in the tree. If there is no such provider, the returned value will be the `defaultValue` passed to `createContext`.

### Example

```tsx
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");

export function App() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    // React 19 allows rendering Context directly as a provider:
    <ThemeContext value={theme}>
      <Page />
      <button
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        Toggle Theme
      </button>
    </ThemeContext>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div className={`theme-${theme}`}>Welcome to the app</div>;
}
```

---

## 2. React 19 `use` API

`use` is a new React API that lets you read the value of a resource like a **Promise** or a **Context**.

Unlike traditional React Hooks:

- `use` **can be called inside loops and conditional statements** (such as `if (condition)`).
- `use` automatically suspends the component when passed a Promise, integrating natively with `<Suspense>`.

### Syntax

```tsx
const value = use(resource);
```

### Reading Context Conditionally with `use`

```tsx
import { use } from "react";
import { ThemeContext } from "./ThemeContext";

export function Heading({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    // ✅ Valid: 'use' can be called conditionally!
    const theme = use(ThemeContext);
    return <h1 className={theme}>Themed Title</h1>;
  }
  return <h1>Plain Title</h1>;
}
```

### Streaming Promises with `use` and `<Suspense>`

```tsx
import { use, Suspense } from "react";

async function fetchUserData(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

function UserProfile({
  userPromise,
}: {
  userPromise: Promise<{ name: string; role: string }>;
}) {
  // Suspends component until Promise resolves
  const user = use(userPromise);
  return (
    <div>
      {user.name} ({user.role})
    </div>
  );
}

export function App() {
  const promise = fetchUserData("usr_123");
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <UserProfile userPromise={promise} />
    </Suspense>
  );
}
```

---

## Context Optimization Best Practices

1. **Split State and Dispatch Contexts**: Separating data contexts from action/dispatch contexts prevents unnecessary re-renders in components that only trigger actions.
2. **Memoize Context Value**: Always wrap complex context values in `useMemo` to prevent consumers from re-rendering on parent component re-renders:
   ```tsx
   const contextValue = useMemo(() => ({ user, token, logout }), [user, token]);
   return <AuthContext value={contextValue}>{children}</AuthContext>;
   ```
