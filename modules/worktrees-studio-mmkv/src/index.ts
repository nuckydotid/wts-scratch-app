import { requireNativeModule } from "expo";

interface MMKV {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
  contains(key: string): boolean;
  clearAll(): void;
}

declare class WorktreesStudioMmkvModule {
  getString(instanceId: string, key: string): string | null;
  set(instanceId: string, key: string, value: string): void;
  remove(instanceId: string, key: string): void;
  contains(instanceId: string, key: string): boolean;
  clearAll(instanceId: string): void;
}

const native = requireNativeModule<WorktreesStudioMmkvModule>("WorktreesStudioMmkv");

export function createMMKV(options?: { id?: string }): MMKV {
  const instanceId = options?.id ?? "";
  return {
    getString: (key) => native.getString(instanceId, key) ?? undefined,
    set: (key, value) => native.set(instanceId, key, value),
    remove: (key) => native.remove(instanceId, key),
    contains: (key) => native.contains(instanceId, key),
    clearAll: () => native.clearAll(instanceId),
  };
}
