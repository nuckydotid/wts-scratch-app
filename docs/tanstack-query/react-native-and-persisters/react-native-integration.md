# TanStack Query: React Native & Expo Integration

Guidelines for optimal performance in mobile environments with Expo SDK and React Native New Architecture.

---

## 1. AppState & NetInfo Setup

```tsx
// src/providers/query-provider.tsx
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { AppState, type AppStateStatus, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, type ReactNode } from "react";

// Connect NetInfo:
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(
      Boolean(state.isConnected && state.isInternetReachable !== false),
    );
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory
    },
  },
});

export function AppQueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (Platform.OS !== "web") {
          focusManager.setFocused(status === "active");
        }
      },
    );
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

---

## 2. Refetch on Screen Focus (React Navigation / Expo Router)

```tsx
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
}
```
