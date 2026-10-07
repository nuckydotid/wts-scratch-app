# Reanimated 4 Overview & Worklets Architecture

Reanimated 4 runs complex animation loops directly on the UI thread without crossing the React Native bridge.

---

## 1. The Worklet Concept

A worklet is a JavaScript function flagged with `'worklet'` that compiles to run inside a dedicated UI runtime thread.

```ts
function calculateOffset(x: number, y: number) {
  "worklet";
  return Math.sqrt(x * x + y * y);
}
```
