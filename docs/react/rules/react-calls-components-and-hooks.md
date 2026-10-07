# Rules of React: How React Calls Components & Hooks

---

## Principles

1. **React owns the render execution**: Never call components directly as functions (`MyComponent()`). Always render them as JSX elements (`<MyComponent />`).
2. **Passing Functions to State Initializers**: Always pass the function reference, do not invoke it during render:
   ```tsx
   // ❌ Bad: Calls createInitialState() on EVERY render
   const [state, setState] = useState(createInitialState());

   // ✅ Good: Passes initializer reference, calls ONLY on initial mount
   const [state, setState] = useState(createInitialState);
   ```
