# Rules of React: Purity & Immutability

React's concurrent engine assumes that component rendering is a **pure calculation**.

---

## 1. Pure Rendering

A component must:

- **Be idempotent**: Same inputs (props, state, context) must always produce the same JSX output.
- **Have no side effects during render**: Do not mutate DOM, trigger network requests, or modify global variables during rendering.

```tsx
// ❌ Bad: Mutating global variable during render
let guestCount = 0;
function Cup() {
  guestCount = guestCount + 1; // SIDE EFFECT!
  return <h2>Cup #{guestCount}</h2>;
}

// ✅ Good: Pass data through props/state
function Cup({ guest }: { guest: number }) {
  return <h2>Cup #{guest}</h2>;
}
```

---

## 2. Immutable State

Never mutate existing objects or arrays in state:

```tsx
// ❌ Bad: Mutates array in place
state.push(newItem);
setState(state);

// ✅ Good: Create a new array
setState((prev) => [...prev, newItem]);
```
