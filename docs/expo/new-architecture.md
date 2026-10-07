# Expo SDK 57: New Architecture & Turbomodules

Guidelines for native module integration with Fabric and Turbomodules.

---

## 1. C++ / Swift / Kotlin Turbomodules

Native modules in `modules/` use Expo Modules Core for synchronous method execution without bridge serialization overhead:

```ts
// modules/worktrees-studio-mmkv/src/index.ts
import { requireNativeModule } from "expo-modules-core";

const NativeMMKV = requireNativeModule("WorktreesStudioMMKV");
export const mmkvStorage = {
  getString: (key: string) => NativeMMKV.getString(key),
  setString: (key: string, val: string) => NativeMMKV.setString(key, val),
};
```
