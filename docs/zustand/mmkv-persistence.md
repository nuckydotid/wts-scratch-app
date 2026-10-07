# Zustand 5: MMKV Persistence Middleware

---

## 1. Synchronous MMKV Storage Engine

```ts
import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { mmkvStorage } from "worktrees-studio-mmkv";

const storageAdapter: StateStorage = {
  getItem: (key) => mmkvStorage.getString(key) ?? null,
  setItem: (key, val) => mmkvStorage.setString(key, val),
  removeItem: (key) => mmkvStorage.delete(key),
};

export const useAppPreferencesStore = create(
  persist(
    (set) => ({
      theme: "light",
      locale: "id",
      setTheme: (theme: "light" | "dark") => set({ theme }),
      setLocale: (locale: string) => set({ locale }),
    }),
    {
      name: "app-preferences",
      storage: createJSONStorage(() => storageAdapter),
    },
  ),
);
```
