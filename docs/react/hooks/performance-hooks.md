# Performance Hooks: `useMemo`, `useCallback`, `useTransition` & `useDeferredValue`

Performance hooks optimize rendering workflows, skip unnecessary calculations, and prioritize responsive user interactions over heavy background updates.

---

## 1. `useMemo`

`useMemo` caches the result of a calculation between re-renders.

### Syntax

```tsx
const cachedValue = useMemo(calculateValue, dependencies);
```

### Parameters

- **`calculateValue`**: The function calculating the value that you want to cache. It should be pure, take no arguments, and return a value.
- **`dependencies`**: The list of all reactive values referenced inside of the `calculateValue` function.

### Example

```tsx
import { useMemo } from "react";

export function ProductList({
  products,
  filterText,
}: {
  products: Product[];
  filterText: string;
}) {
  // Only recalculates when products or filterText changes:
  const visibleProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [products, filterText]);

  return (
    <ul>
      {visibleProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

---

## 2. `useCallback`

`useCallback` caches a function definition between re-renders.

### Syntax

```tsx
const cachedFn = useCallback(fn, dependencies);
```

### Purpose

In JavaScript, `function() {}` or `() => {}` always creates a new function reference. When passing callbacks to memoized child components (`memo(Child)`), `useCallback` ensures the reference remains stable across renders unless dependencies change.

```tsx
import { useCallback, memo } from "react";

const ShippingForm = memo(function ShippingForm({
  onSubmit,
}: {
  onSubmit: (data: any) => void;
}) {
  // Only re-renders if onSubmit changes
});

export function Checkout({ productId }: { productId: string }) {
  const handleSubmit = useCallback(
    (orderData: any) => {
      postOrder(productId, orderData);
    },
    [productId],
  );

  return <ShippingForm onSubmit={handleSubmit} />;
}
```

---

## 3. `useTransition`

`useTransition` is a React Hook that lets you update the state without blocking the UI.

### Syntax

```tsx
const [isPending, startTransition] = useTransition();
```

### Returns

1. **`isPending`**: Flag indicating whether a background transition is in progress.
2. **`startTransition`**: Function that lets you mark a state update as a non-blocking Transition.

### Example: Tab Switching without Freezing UI

```tsx
import { useState, useTransition } from "react";

export function TabContainer() {
  const [tab, setTab] = useState("about");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab); // Non-urgent state update
    });
  }

  return (
    <div>
      <TabButton isActive={tab === "about"} onClick={() => selectTab("about")}>
        About
      </TabButton>
      <TabButton isActive={tab === "posts"} onClick={() => selectTab("posts")}>
        Posts (Heavy)
      </TabButton>
      {isPending && <span className="spinner">Loading...</span>}
      {tab === "about" && <AboutTab />}
      {tab === "posts" && <HeavyPostsTab />}
    </div>
  );
}
```

---

## 4. `useDeferredValue`

`useDeferredValue` is a React Hook that lets you defer updating a part of the UI.

### Syntax

```tsx
const deferredValue = useDeferredValue(value, initialValue?);
```

### When to Use

Similar to debouncing or throttling, but built natively into React's concurrent scheduler. React will render with the old value first, and immediately attempt to render with the new value in the background.

```tsx
import { useState, useDeferredValue } from "react";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // Lags behind urgent keystrokes

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* Keystrokes remain 60fps responsive while HeavyResults renders deferredQuery */}
      <HeavyResults query={deferredQuery} isStale={query !== deferredQuery} />
    </div>
  );
}
```
