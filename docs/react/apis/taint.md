# Core API: `experimental_taintObjectReference` & `experimental_taintUniqueValue`

Security APIs in React Server Components (RSC) that prevent sensitive data (passwords, private keys, API secrets) from accidentally being passed across the server-client boundary to the browser.

---

## Reference

```tsx
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";

export function createSecureSession(user: UserRecord) {
  // Throws a fatal build / runtime error if user.secretToken is ever passed to a Client Component:
  experimental_taintUniqueValue(
    "Do not pass the secret session token to the client.",
    user,
    user.secretToken,
  );

  return user;
}
```
