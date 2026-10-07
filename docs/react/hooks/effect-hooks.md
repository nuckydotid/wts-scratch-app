# Effect Hooks: `useEffect`, `useLayoutEffect`, `useInsertionEffect` & `useEffectEvent`

Effects let a component connect to and synchronize with external systems (network, browser DOM, timers, animations).

---

## 1. `useEffect`

`useEffect` is a React Hook that lets you synchronize a component with an external system.

### Syntax

```tsx
useEffect(setup, dependencies?);
```

### Parameters

- **`setup`**: The function with your Effect's logic. Your setup function may also optionally return a _cleanup_ function.
- **`dependencies`** _(optional)_: The list of all reactive values referenced inside of the `setup` code.

### Execution Lifecycle

1. When your component is added to the DOM (mounts), React runs your setup function.
2. After every re-render with changed dependencies, React first runs the cleanup function with the old values, then runs the setup function with the new values.
3. When your component is removed from the DOM (unmounts), React runs your cleanup function one final time.

### Example: Web Socket / Chat Room Connection

```tsx
import { useEffect } from "react";

export function ChatRoom({
  roomId,
  serverUrl,
}: {
  roomId: string;
  serverUrl: string;
}) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();

    // Cleanup function
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]); // Re-connects only if roomId or serverUrl changes

  return <h1>Welcome to {roomId}</h1>;
}
```

---

## 2. `useEffectEvent` (Experimental / React 19)

`useEffectEvent` is a React Hook that lets you separate non-reactive logic from your Effect.

### The Problem

When you need to read a reactive value inside an effect without wanting the effect to re-run whenever that value changes:

```tsx
import { useEffect, useEffectEvent } from "react";

export function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  // Declares an Effect Event containing non-reactive code:
  const onConnected = useEffectEvent(() => {
    showNotification(`Connected to ${roomId}!`, theme);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on("connected", () => {
      onConnected(); // Reads latest 'theme' without adding 'theme' to deps
    });
    connection.connect();

    return () => connection.disconnect();
  }, [roomId]); // ✅ Effect only re-runs when roomId changes!
}
```

---

## 3. `useLayoutEffect`

`useLayoutEffect` is a version of `useEffect` that fires synchronously **before the browser repaints the screen**.

> [!WARNING]
> `useLayoutEffect` blocks the browser from painting and can hurt performance. Use `useEffect` unless measuring DOM layout is strictly necessary.

### When to Use

- Measuring element layout (width, height, scroll position) before rendering tooltips or popovers to prevent layout flickering.

```tsx
import { useLayoutEffect, useRef, useState } from "react";

export function Tooltip({ targetRect }: { targetRect: DOMRect }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  useLayoutEffect(() => {
    const { height } = ref.current!.getBoundingClientRect();
    setTooltipHeight(height); // Measured before user sees initial flash!
  }, []);

  return (
    <div ref={ref} style={{ top: targetRect.top - tooltipHeight }}>
      Tooltip
    </div>
  );
}
```

---

## 4. `useInsertionEffect`

`useInsertionEffect` is a Hook intended for CSS-in-JS library authors to inject styles into the DOM before any layout effects read computed styles.

### Syntax

```tsx
useInsertionEffect(setup, dependencies?);
```

- Runs before all DOM mutations and before `useLayoutEffect`.
- Does not have access to refs and cannot update state.
