# Core API: `act`

`act` is a testing helper to apply pending React updates before making assertions in unit test suites.

---

## Reference

```tsx
import { act } from "react";

await act(async () => {
  // Trigger state updates, button clicks, or network mocks
  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});

// Assertions are guaranteed to see committed DOM updates:
expect(result.textContent).toBe("Updated Value");
```

> [!NOTE]
> When using `@testing-library/react` or `@testing-library/react-native`, helpers like `fireEvent`, `render`, and `waitFor` already wrap interactions with `act()` automatically.
