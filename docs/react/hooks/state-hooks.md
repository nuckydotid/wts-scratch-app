# State Hooks: `useState` & `useReducer`

State hooks enable components to "remember" data across renders without losing local component encapsulation.

---

## 1. `useState`

`useState` is a React Hook that lets you add a state variable to your component.

### Syntax

```tsx
const [state, setState] = useState(initialState);
```

### Parameters

- **`initialState`**: The value you want the state to be initially. It can be a value of any type, or a function (initializer function).
  - _Initializer Function_: If you pass a function as `initialState`, it will be treated as an initializer. It must be pure, take no arguments, and return a value of any type. React will call it when initializing the component, and store its return value.

### Returns

An array with exactly two values:

1. **Current state**: During the first render, it will match the `initialState` you have passed.
2. **`set` function**: A state setter function that lets you update the state to a different value and trigger a re-render.

### Example: Basic Counter with Updater Function

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    // Correct: Updater function receives previous state
    setCount((prev) => prev + 1);
  }

  return <button onClick={handleClick}>Clicked {count} times</button>;
}
```

### Lazy Initial State (Expensive Computations)

If initial state requires expensive parsing or calculation, pass a function reference instead of executing it directly:

```tsx
// ❌ Bad: JSON.parse executes on EVERY single render
const [todos, setTodos] = useState(
  JSON.parse(localStorage.getItem("todos") || "[]"),
);

// ✅ Good: Function runs ONLY on initial mount
const [todos, setTodos] = useState(() => {
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : [];
});
```

### Updating Objects and Arrays

State in React is treated as immutable. Always replace objects and arrays rather than mutating existing references:

```tsx
const [person, setPerson] = useState({ name: "Nicky", age: 25 });

// ❌ Mutation: Will NOT trigger reliable updates or shallow equality checks
person.age = 26;

// ✅ Immutability: Spread and override
setPerson((prev) => ({
  ...prev,
  age: 26,
}));
```

---

## 2. `useReducer`

`useReducer` is a React Hook that lets you add a reducer to your component for managing complex state transitions.

### Syntax

```tsx
const [state, dispatch] = useReducer(reducer, initialArg, init?);
```

### Parameters

- **`reducer`**: The reducer function that specifies how state gets updated. It must be pure, take the current `state` and an `action` as arguments, and return the next state.
- **`initialArg`**: The value from which the initial state is calculated.
- **`init`** _(optional)_: The initializer function that specifies how the initial state is calculated. If provided, the initial state is set to `init(initialArg)`.

### Returns

An array with two values:

1. **Current state**: The state value managed by the reducer.
2. **`dispatch` function**: Dispatches actions to update the state and trigger a re-render.

### Example: Complex Form / Task List Reducer

```tsx
import { useReducer } from "react";

type Task = { id: number; text: string; done: boolean };

type TaskAction =
  | { type: "added"; id: number; text: string }
  | { type: "toggled"; id: number }
  | { type: "deleted"; id: number };

function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "added": {
      return [...tasks, { id: action.id, text: action.text, done: false }];
    }
    case "toggled": {
      return tasks.map((t) =>
        t.id === action.id ? { ...t, done: !t.done } : t,
      );
    }
    case "deleted": {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw new Error("Unknown action");
    }
  }
}

export function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, []);

  function handleAddTask(text: string) {
    dispatch({ type: "added", id: Date.now(), text });
  }

  function handleToggleTask(id: number) {
    dispatch({ type: "toggled", id });
  }

  function handleDeleteTask(id: number) {
    dispatch({ type: "deleted", id });
  }

  return <div>{/* Task UI rendering */}</div>;
}
```

---

## Comparison: `useState` vs `useReducer`

| Criteria        | `useState`                                                | `useReducer`                                                                      |
| :-------------- | :-------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Code Size**   | Minimal boilerplate for simple scalars and small objects. | Requires actions, reducer functions, and dispatch types.                          |
| **Readability** | High for standalone state values.                         | High when multiple state fields change together or follow a state machine.        |
| **Debugging**   | Harder to trace sequence of multi-state modifications.    | Console logging reducer transitions gives complete audit trail of state changes.  |
| **Testing**     | Coupled to React component rendering.                     | Reducer is a pure JavaScript function testable in complete isolation without DOM. |
