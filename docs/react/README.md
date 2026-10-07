# React Documentation & Reference Index

Comprehensive, production-ready documentation for **React 19**, covering all Hooks, Built-in Components, Core APIs, React Server Components (RSC), and the Rules of React.

---

## 📚 Documentation Sitemap

```mermaid
graph TD
    ReactRoot[React 19 Reference] --> Hooks[React Hooks]
    ReactRoot --> Components[Built-in Components]
    ReactRoot --> APIs[Core Top-Level APIs]
    ReactRoot --> RSC[React Server Components & Directives]
    ReactRoot --> Rules[Rules of React]
    ReactRoot --> Legacy[Legacy APIs]

    Hooks --> H1[state-hooks.md: useState, useReducer]
    Hooks --> H2[context-hooks.md: useContext, use]
    Hooks --> H3[ref-hooks.md: useRef, useImperativeHandle]
    Hooks --> H4[effect-hooks.md: useEffect, useLayoutEffect, useEffectEvent]
    Hooks --> H5[performance-hooks.md: useMemo, useCallback, useTransition, useDeferredValue]
    Hooks --> H6[action-form-hooks.md: useActionState, useOptimistic]
    Hooks --> H7[utility-hooks.md: useId, useSyncExternalStore, useDebugValue]

    Components --> C1[suspense.md: Suspense]
    Components --> C2[strict-mode.md: StrictMode]
    Components --> C3[profiler.md: Profiler]
    Components --> C4[fragment.md: Fragment]
    Components --> C5[activity-and-transitions.md: Activity, ViewTransition]

    APIs --> A1[cache.md: cache, cacheSignal]
    APIs --> A2[act.md: act]
    APIs --> A3[createContext.md: createContext]
    APIs --> A4[forwardRef.md: forwardRef & React 19 Ref Props]
    APIs --> A5[lazy.md: lazy]
    APIs --> A6[memo.md: memo]
    APIs --> A7[startTransition.md: startTransition]
    APIs --> A8[taint.md: experimental_taintObjectReference]

    RSC --> R1[server-components.md: Server vs Client Components]
    RSC --> Cloud Storage[use-client.md: 'use client' Directive]
    RSC --> R3[use-server.md: 'use server' & Server Actions]

    Rules --> RU1[rules-of-hooks.md: Rules of Hooks]
    Rules --> RU2[purity-and-immutability.md: Purity & Immutability]
    Rules --> RU3[react-calls-components-and-hooks.md: Lifecycle & Render Rules]

    Legacy --> L1[legacy-apis.md: Component, Children, cloneElement, createRef]
```

---

## 🗂️ Table of Contents

### 1. React Hooks (`docs/react/hooks/`)

- [State Hooks (`state-hooks.md`)](hooks/state-hooks.md) — `useState` & `useReducer`
- [Context Hooks (`context-hooks.md`)](hooks/context-hooks.md) — `useContext` & React 19 `use`
- [Ref Hooks (`ref-hooks.md`)](hooks/ref-hooks.md) — `useRef` & `useImperativeHandle`
- [Effect Hooks (`effect-hooks.md`)](hooks/effect-hooks.md) — `useEffect`, `useLayoutEffect`, `useInsertionEffect`, `useEffectEvent`
- [Performance Hooks (`performance-hooks.md`)](hooks/performance-hooks.md) — `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`
- [Action & Form Hooks (`action-form-hooks.md`)](hooks/action-form-hooks.md) — React 19 `useActionState` & `useOptimistic`
- [Utility Hooks (`utility-hooks.md`)](hooks/utility-hooks.md) — `useId`, `useSyncExternalStore`, `useDebugValue`

### 2. Built-in Components (`docs/react/components/`)

- [`<Suspense>` (`suspense.md`)](components/suspense.md) — Streaming data and fallback boundaries
- [`<StrictMode>` (`strict-mode.md`)](components/strict-mode.md) — Development checks and double-effect execution
- [`<Profiler>` (`profiler.md`)](components/profiler.md) — Programmatic render metrics and duration measurement
- [`<Fragment>` (`fragment.md`)](components/fragment.md) — Fragment grouping and keyed lists
- [`<Activity>` & `<ViewTransition>` (`activity-and-transitions.md`)](components/activity-and-transitions.md) — Offscreen rendering and view transitions

### 3. Core Top-Level APIs (`docs/react/apis/`)

- [`cache` & `cacheSignal` (`cache.md`)](apis/cache.md) — Request-scoped per-render memoization
- [`act` (`act.md`)](apis/act.md) — Unit testing update flusher
- [`createContext` (`createContext.md`)](apis/createContext.md) — Context declaration and React 19 direct rendering
- [`forwardRef` (`forwardRef.md`)](apis/forwardRef.md) — Ref forwarding and React 19 direct ref props
- [`lazy` (`lazy.md`)](apis/lazy.md) — Code splitting with dynamic imports
- [`memo` (`memo.md`)](apis/memo.md) — Component prop memoization and custom comparators
- [`startTransition` (`startTransition.md`)](apis/startTransition.md) — Standalone non-blocking state transitions
- [`taint` Security APIs (`taint.md`)](apis/taint.md) — `experimental_taintObjectReference` & `experimental_taintUniqueValue`
- [`captureOwnerStack` (`captureOwnerStack.md`)](apis/captureOwnerStack.md) — Diagnostic stack traces

### 4. React Server Components & Directives (`docs/react/rsc/`)

- [Server Components Architecture (`server-components.md`)](rsc/server-components.md) — Server vs Client boundaries
- [`'use client'` Directive (`use-client.md`)](rsc/use-client.md) — Marking client-side interactive modules
- [`'use server'` & Server Actions (`use-server.md`)](rsc/use-server.md) — Server functions and form actions

### 5. Rules of React (`docs/react/rules/`)

- [Rules of Hooks (`rules-of-hooks.md`)](rules/rules-of-hooks.md) — Top-level calls and React function rules
- [Purity & Immutability (`purity-and-immutability.md`)](rules/purity-and-immutability.md) — Pure components and side effect isolation
- [How React Calls Components (`react-calls-components-and-hooks.md`)](rules/react-calls-components-and-hooks.md) — Execution lifecycle rules

### 6. Legacy APIs (`docs/react/legacy/`)

- [Legacy APIs Reference (`legacy-apis.md`)](legacy/legacy-apis.md) — `Component`, `PureComponent`, `Children`, `cloneElement`, `createRef`

---

## 📦 Raw Archive (`docs/react/raw/`)

Unindexed react.dev scrape mirror (per-API pages). **Reference only — do not bulk-read.** Agents: use `grep`/`glob` for targeted lookup; prefer the curated sections above for guidance.
