# Zustand v5 Overview & React 19 Safety

Zustand 5 is a lightweight, hook-based state management library built on `useSyncExternalStore` for tear-free React 19 concurrent rendering.

---

## 1. Key Features in Zustand 5

- **React 19 Safe**: Uses `useSyncExternalStore` under the hood.
- **Zero Boilerplate**: No reducer actions or Context providers required.
- **Atomic Selectors**: Prevents re-renders by subscribing only to the selected state slice.
