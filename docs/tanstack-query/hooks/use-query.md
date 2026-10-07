# TanStack Query Hook: `useQuery`

`useQuery` is the primary Hook for declarative asynchronous data fetching, caching, and state synchronization.

---

## 1. Syntax (v5 Object Signature)

```tsx
import { useQuery } from "@tanstack/react-query";

const { data, error, isPending, isFetching, isSuccess, isError, refetch } =
  useQuery({
    queryKey: ["todos", { status: "done" }],
    queryFn: fetchTodos,
    staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
    gcTime: 1000 * 60 * 60, // Garbage collected after 1 hour of inactivity
    enabled: isUserLoggedIn, // Dependent query
  });
```

---

## 2. Core Options

| Option                | Type                                                    | Description                                                                                                   |
| :-------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------ |
| **`queryKey`**        | `unknown[]`                                             | **Required**. Serialized array uniquely identifying the query in the cache.                                   |
| **`queryFn`**         | `(context: QueryFunctionContext) => Promise<T>`         | **Required**. Function returning a Promise that resolves data or throws an error.                             |
| **`staleTime`**       | `number \| Infinity`                                    | Duration (ms) until cached data is considered stale. Default: `0`.                                            |
| **`gcTime`**          | `number \| Infinity`                                    | Duration (ms) unused data remains in memory (formerly `cacheTime`). Default: `5 * 60 * 1000` (5 min).         |
| **`enabled`**         | `boolean`                                               | Set to `false` to disable automatic query execution (e.g. for dependent queries).                             |
| **`select`**          | `(data: T) => TSelected`                                | Transform or select a slice of the cached data. Optimized with structural sharing.                            |
| **`placeholderData`** | `T \| (previousData: T) => T`                           | Data shown while query is pending. Use `keepPreviousData` from `@tanstack/react-query` for smooth pagination. |
| **`refetchInterval`** | `number \| false \| ((query) => number)`                | Polling interval in milliseconds.                                                                             |
| **`retry`**           | `boolean \| number \| (failureCount, error) => boolean` | Number of retry attempts on failure. Default: `3`.                                                            |

---

## 3. Query Statuses vs Fetch Statuses (v5 Model)

In TanStack Query v5, status flags are divided into two distinct dimensions:

### Primary Data Status (`status`):

- **`isPending`** (`status === 'pending'`): No data in the cache yet.
- **`isSuccess`** (`status === 'success'`): Query resolved successfully and has cached data.
- **`isError`** (`status === 'error'`): Query failed and `error` is populated.

### Network Fetch Status (`fetchStatus`):

- **`isFetching`** (`fetchStatus === 'fetching'`): Query function is actively executing.
- **`isPaused`** (`fetchStatus === 'paused'`): Query tried to fetch but is paused due to no network connection.
- **`fetchStatus === 'idle'`**: Query is not fetching.

```tsx
// Typical UI State Rendering Pattern:
if (isPending) return <ActivityIndicator />;
if (isError) return <ErrorMessage message={error.message} onRetry={refetch} />;

return <TodoList items={data} isRefreshing={isFetching} onRefresh={refetch} />;
```

---

## 4. Derived & Transformed State with `select`

`select` extracts specific sub-fields without re-running component renders when unrelated cache data updates:

```tsx
export function useCompletedTodoCount() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    select: (todos) => todos.filter((t) => t.completed).length,
  });
}
```
