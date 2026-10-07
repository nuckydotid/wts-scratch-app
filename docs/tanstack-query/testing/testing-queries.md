# Testing TanStack Query Hooks

Best practices for unit testing custom hooks with `@testing-library/react-native` and Vitest/Jest.

---

## 1. Isolated Test QueryClient Wrapper

Always create a new `QueryClient` per test suite with retries disabled:

```tsx
// src/test-utils/render-hook-wrapper.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Prevents tests from timing out on failure
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderQueryHook<TProps, TResult>(
  hook: (props: TProps) => TResult,
  client = createTestQueryClient(),
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    ...renderHook(hook, { wrapper }),
    queryClient: client,
  };
}
```

---

## 2. Example: Testing Custom Query Hook

```tsx
import { waitFor } from "@testing-library/react-native";
import { renderQueryHook } from "@/test-utils/render-hook-wrapper";
import { useUserProfile } from "@/lib/user/hooks";

describe("useUserProfile", () => {
  it("fetches and returns user profile data", async () => {
    const { result } = renderQueryHook(() => useUserProfile("user_123"));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe("Nicky");
  });
});
```
