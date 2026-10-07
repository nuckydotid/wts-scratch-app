# TanStack Query Hook: `useMutation`

`useMutation` is used to create, update, or delete server-side data (side-effects).

---

## 1. Syntax

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: { title: string; content: string }) => {
      const res = await api.posts.post(newPost);
      return res.data;
    },
    onSuccess: (savedPost) => {
      // Invalidate posts list query so it refetches fresh data:
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Failed to create post:", error);
    },
  });
}
```

---

## 2. Optimistic Updates with Rollback

Optimistically update the cache before the server responds, with automatic rollback if the network call fails:

```tsx
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodoOnServer,

    // Step 1: When mutate is called:
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update:
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot the previous cache value:
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically update the cache with new values:
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((todo) =>
          todo.id === newTodo.id ? { ...todo, ...newTodo } : todo,
        ),
      );

      // Return context object with snapshotted value for rollback:
      return { previousTodos };
    },

    // Step 2: If mutation fails, rollback using snapshotted context:
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },

    // Step 3: Always refetch after error or success to ensure 100% sync:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

---

## 3. Triggering Mutations: `mutate` vs `mutateAsync`

- **`mutate(variables, options?)`**: Fire-and-forget. Does not return a promise (errors are handled via `onError`).
- **`mutateAsync(variables, options?)`**: Returns a Promise resolving the result or throwing on error (useful when orchestrating sequential async tasks in event handlers).
