# TanStack Query Hook: `useInfiniteQuery`

`useInfiniteQuery` handles infinite scrolling, pagination, and cursor-based data feeds.

---

## 1. Syntax (v5 Required `initialPageParam`)

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "feed"],
    initialPageParam: 1, // Required in v5!
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.posts.get({ page: pageParam, limit: 10 });
      return res.data; // { items: Post[], nextPage: number | null }
    },
    getNextPageParam: (lastPage, allPages) => lastPage.nextPage ?? undefined,
    getPreviousPageParam: (firstPage, allPages) =>
      firstPage.prevPage ?? undefined,
    maxPages: 5, // Limit memory usage by capping max cached pages
  });
}
```

---

## 2. FlatList Integration in React Native

```tsx
export function PostsScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
    isRefetching,
  } = useInfinitePosts();

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <FlatList
      data={allPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null
      }
    />
  );
}
```
