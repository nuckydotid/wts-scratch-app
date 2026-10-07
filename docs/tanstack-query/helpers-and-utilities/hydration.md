# Helpers: Hydration & `<HydrationBoundary>`

Hydration allows serializing a query cache on the server (or in persistent storage) and resuming it in client components.

---

## Reference

```tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

// Server Component / Loader:
export async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(userQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientUserView />
    </HydrationBoundary>
  );
}
```
