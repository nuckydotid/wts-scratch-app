# worktrees-studio-mmkv

Synchronous key-value storage. Replaces `react-native-mmkv` with a lighter implementation.

## Platforms

iOS (UserDefaults), Android (EncryptedSharedPreferences AES256)

## API

```typescript
import { createMMKV } from "worktrees-studio-mmkv";

const mmkv = createMMKV();
// or with a named instance:
const mmkv = createMMKV({ id: "my-store" });

mmkv.set("key", "value");
mmkv.getString("key"); // string | undefined
mmkv.contains("key"); // boolean
mmkv.remove("key");
mmkv.clearAll();
```

## Usage Pattern (Zustand Persist)

```typescript
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createMMKV } from "worktrees-studio-mmkv";

const mmkv = createMMKV({ id: "auth" });
const mmkvStorage = createJSONStorage(() => ({
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
}));
```

## Android Implementation

- Uses `EncryptedSharedPreferences` with `MasterKey(AES256_GCM)`
- Falls back to plain `SharedPreferences` on API < 23
- Pref name: `worktrees_studio_mmkv` (default) or `worktrees_studio_mmkv_{instanceId}`

## iOS Implementation

- Uses `UserDefaults.standard` for default instance
- Uses `UserDefaults(suiteName:)` for named instances
