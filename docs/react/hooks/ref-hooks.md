# Ref Hooks: `useRef` & `useImperativeHandle`

Refs provide a way to access DOM nodes directly or persist mutable values across renders without causing re-renders when updated.

---

## 1. `useRef`

`useRef` is a React Hook that lets you reference a value that’s not needed for rendering.

### Syntax

```tsx
const ref = useRef(initialValue);
```

### Parameters

- **`initialValue`**: The value you want the ref object’s `current` property to be initially. It can be a value of any type. This argument is ignored after the initial render.

### Returns

An object with a single property:

- **`current`**: Initially set to the `initialValue` you have passed. You can later set it to something else. If you pass the ref object to React as a `ref` attribute to a JSX node, React will set its `current` property to that DOM node.

### Use Cases

#### A. Referencing a DOM Node

```tsx
import { useRef } from "react";

export function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} type="text" placeholder="Search..." />
      <button onClick={handleFocus}>Focus Field</button>
    </>
  );
}
```

#### B. Storing Mutable Data (Timer IDs, Interval Handles, Previous Values)

```tsx
import { useRef, useState } from "react";

export function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const timerId = useRef<number | null>(null);

  function handleStart() {
    if (timerId.current !== null) return;
    timerId.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }

  function handleStop() {
    if (timerId.current !== null) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  }

  return (
    <div>
      <p>Time: {seconds}s</p>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
}
```

---

## 2. `useImperativeHandle`

`useImperativeHandle` is a React Hook that lets you customize the handle exposed as a ref to parent components.

### Syntax

```tsx
useImperativeHandle(ref, createHandle, dependencies?);
```

### Parameters

- **`ref`**: The `ref` you received as a prop (or from `forwardRef`).
- **`createHandle`**: A function that takes no arguments and returns the ref handle you want to expose. That ref handle can have any type (usually an object with methods).
- **`dependencies`** _(optional)_: The list of all reactive values referenced inside of the `createHandle` code.

### Example: Exposing Custom Component Methods

```tsx
import { useRef, useImperativeHandle } from "react";

export type CustomInputHandle = {
  focusAndClear: () => void;
  shake: () => void;
};

// In React 19, ref is directly available in props!
export function CustomInput({ ref }: { ref?: React.Ref<CustomInputHandle> }) {
  const realInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusAndClear: () => {
      if (realInputRef.current) {
        realInputRef.current.focus();
        realInputRef.current.value = "";
      }
    },
    shake: () => {
      // Trigger animation
    },
  }));

  return <input ref={realInputRef} className="custom-input" />;
}

// Parent usage:
export function Form() {
  const inputHandleRef = useRef<CustomInputHandle>(null);

  function handleReset() {
    inputHandleRef.current?.focusAndClear();
  }

  return (
    <div>
      <CustomInput ref={inputHandleRef} />
      <button onClick={handleReset}>Reset Input</button>
    </div>
  );
}
```

---

## Ref Rules

1. **Do not read or write `ref.current` during rendering**:
   ```tsx
   // ❌ Bad: Mutating ref during render
   myRef.current = 123;

   // ❌ Bad: Reading ref during render for JSX output
   return <h1>{myRef.current}</h1>;

   // ✅ Good: Read/Write refs inside useEffect, callbacks, or event handlers
   ```
2. **Refs do not trigger re-renders**: Updating `ref.current` is immediate and synchronous, but does not notify React to re-execute the component body.
