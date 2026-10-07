import type {
  DownloadProgressEvent,
  DownloadUpdateOptions,
  RuntimeConfig,
} from "./WorktreesStudioOtaUpdates.types";

const noopRuntimeConfig: RuntimeConfig = {
  bundleId: 0,
  nativeVersion: "0.0.0",
  otaEnabled: false,
  apiUrl: "",
  otaAppKey: "",
};

export default {
  async getRuntimeConfig(): Promise<RuntimeConfig> {
    return noopRuntimeConfig;
  },

  async getCurrentBundleId(): Promise<number> {
    return 0;
  },

  async getPendingBundleId(): Promise<number> {
    return 0;
  },

  async downloadUpdateAsync(_options: DownloadUpdateOptions): Promise<boolean> {
    return false;
  },

  async applyUpdateAsync(): Promise<void> {},
  async clearAppCacheAndStorage(): Promise<boolean> {
    return true;
  },
  async markStartupSuccess(): Promise<boolean> {
    return true;
  },
  async startPlayStoreInAppUpdate(): Promise<boolean> {
    return false;
  },

  addListener(
    _eventName: "downloadProgress",
    _listener: (event: DownloadProgressEvent) => void,
  ) {
    return { remove: () => {} };
  },

  removeAllListeners(_eventName: "downloadProgress") {},
};
