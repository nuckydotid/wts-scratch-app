# Zustand 5: Store Creation & Slices

---

## 1. Defining a Typed Store

```ts
import { create } from "zustand";

interface AuthState {
  token: string | null;
  userRole: "admin" | "teacher" | "parent" | null;
  setSession: (token: string, role: "admin" | "teacher" | "parent") => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userRole: null,
  setSession: (token, role) => set({ token, userRole: role }),
  clearSession: () => set({ token: null, userRole: null }),
}));
```
