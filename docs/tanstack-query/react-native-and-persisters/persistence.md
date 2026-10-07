# TanStack Query: Persistent Cache with MMKV

Persisting query cache across app restarts enables instant offline UI rendering and zero cold-start latency.

---

## 1. MMKV Synchronous Persister Setup

```tsx
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { MMKV } from "react-native-mmkv";
import { queryClient } from "./query-client";

const storage = new MMKV({ id: "react-query-cache" });

const clientPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  throttleTime: 1000, // Debounce disk writes to 1s
});

export function PersistedQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: clientPersister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days offline retention
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```
