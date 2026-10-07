# Built-in Component: `<Profiler>`

`<Profiler>` lets you measure rendering performance of a React tree programmatically.

---

## Reference

```tsx
<Profiler id="AppNavigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>
```

### Callback Signature

```tsx
function onRenderCallback(
  id: string, // "AppNavigation"
  phase: "mount" | "update" | "nested-update",
  actualDuration: number, // Time spent rendering committed subtree (ms)
  baseDuration: number, // Estimated time to render entire subtree without memoization (ms)
  startTime: number, // Timestamp when React began rendering
  commitTime: number, // Timestamp when React committed updates
) {
  // Aggregate or send metrics to analytics
}
```
