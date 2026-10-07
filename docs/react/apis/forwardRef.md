# Core API: `forwardRef`

`forwardRef` lets your component expose a DOM node to a parent component with a ref.

---

## React 19: Native `ref` as a Prop

> [!IMPORTANT]
> In **React 19**, function components can access `ref` directly as a regular prop! `forwardRef` is no longer required for new code and will be deprecated in future major releases.

### Modern React 19 Approach:

```tsx
// ✅ React 19: Direct ref prop
export function MyInput({
  ref,
  label,
  ...props
}: {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
}) {
  return (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  );
}
```

### Legacy `forwardRef` Approach:

```tsx
import { forwardRef } from "react";

export const MyInput = forwardRef<HTMLInputElement, InputProps>(
  function MyInput(props, ref) {
    return <input ref={ref} {...props} />;
  },
);
```
