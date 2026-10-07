# Action & Form Hooks: `useActionState` & `useOptimistic`

React 19 introduces native Hooks for managing Server Actions, Form submissions, pending states, and optimistic UI updates without external state libraries.

---

## 1. `useActionState`

`useActionState` is a Hook that allows you to update state based on the result of a form action.

### Syntax

```tsx
const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);
```

### Parameters

- **`fn`**: The action function to be called when the form is submitted. It receives the previous `state` and the `formData` (or action payload) as arguments.
- **`initialState`**: The initial state before the action is executed.
- **`permalink`** _(optional)_: A string containing the unique page URL that this form modifies.

### Returns

1. **`state`**: The current state returned by the action.
2. **`formAction`**: A function passed to `<form action={formAction}>` or `<button formAction={formAction}>`.
3. **`isPending`**: A boolean flag indicating whether the action transition is pending.

### Example: Form Submission with Server Action

```tsx
import { useActionState } from "react";
import { updateNameAction } from "./actions";

type State = { error: string | null; success: boolean };

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (prevState, formData) => {
      const name = formData.get("name") as string;
      const res = await updateNameAction(name);
      if (!res.ok) {
        return { error: res.errorMessage, success: false };
      }
      return { error: null, success: true };
    },
    { error: null, success: false },
  );

  return (
    <form action={formAction}>
      <input name="name" type="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Update Name"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Profile updated!</p>}
    </form>
  );
}
```

---

## 2. `useOptimistic`

`useOptimistic` is a React Hook that lets you optimistically update the UI before an asynchronous action finishes.

### Syntax

```tsx
const [optimisticState, setOptimistic] = useOptimistic(
  passthroughState,
  updateFn,
);
```

### Parameters

- **`passthroughState`**: The source of truth state (e.g. server data or React state).
- **`updateFn(currentState, optimisticValue)`**: A pure function that returns the combined optimistic state.

### Example: Instant Chat Message Feedback

```tsx
import { useOptimistic, useRef } from "react";

type Message = { id: string; text: string; sending?: boolean };

export function ChatRoom({
  messages,
  sendMessageAction,
}: {
  messages: Message[];
  sendMessageAction: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newText: string) => [
      ...state,
      { id: "temp_" + Date.now(), text: newText, sending: true },
    ],
  );

  async function handleFormSubmit(formData: FormData) {
    const text = formData.get("message") as string;
    formRef.current?.reset();
    addOptimisticMessage(text); // Renders message instantly in UI!
    await sendMessageAction(formData); // Reconciles with server response
  }

  return (
    <div>
      {optimisticMessages.map((msg) => (
        <div key={msg.id} style={{ opacity: msg.sending ? 0.6 : 1.0 }}>
          {msg.text} {msg.sending && "(sending...)"}
        </div>
      ))}
      <form ref={formRef} action={handleFormSubmit}>
        <input name="message" placeholder="Type a message..." required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```
