# TanStack Query Hook: `useQueryClient`

Retrieves the current `QueryClient` instance from the `QueryClientProvider` context.

---

## Reference

```tsx
import { useQueryClient } from "@tanstack/react-query";

export function LogoutButton() {
  const queryClient = useQueryClient();

  function handleLogout() {
    authService.logout();
    // Clear all cached server state on logout:
    queryClient.clear();
  }

  return <button onClick={handleLogout}>Log Out</button>;
}
```
