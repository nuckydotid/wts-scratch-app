# Rules of React: Rules of Hooks

React relies on the call order of Hooks to match state variables with their corresponding values across renders.

---

## Rule 1: Only Call Hooks at the Top Level

**Do not call Hooks inside loops, conditions, or nested functions.**

```tsx
// ❌ Bad: Hook inside condition
if (isLoggedIn) {
  useEffect(() => { ... }, []);
}

// ❌ Bad: Hook inside loop
for (let i = 0; i < items.length; i++) {
  useRef(null);
}

// ✅ Good: Call hooks at the top of your component body
const ref = useRef(null);
useEffect(() => {
  if (isLoggedIn) {
    // Condition goes inside the effect!
  }
}, [isLoggedIn]);
```

---

## Rule 2: Only Call Hooks from React Functions

**Do not call Hooks from regular JavaScript functions.**

- ✅ Call Hooks from React function components.
- ✅ Call Hooks from custom Hooks (functions starting with `use...`).
