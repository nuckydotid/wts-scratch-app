import { NativeModule, requireNativeModule } from "expo";

import type {
  DownloadProgressEvent,
  DownloadUpdateOptions,
  RuntimeConfig,
} from "./WorktreesStudioOtaUpdates.types";

declare class WorktreesStudioOtaUpdatesModule extends NativeModule<{
  downloadProgress: (event: DownloadProgressEvent) => void;
}> {
  getRuntimeConfig(): Promise<RuntimeConfig>;
  getCurrentBundleId(): Promise<number>;
  getPendingBundleId(): Promise<number>;
  downloadUpdateAsync(options: DownloadUpdateOptions): Promise<boolean>;
  applyUpdateAsync(): Promise<void>;
  clearAppCacheAndStorage(): Promise<boolean>;
  markStartupSuccess(): Promise<boolean>;
  startPlayStoreInAppUpdate(): Promise<boolean>;
}

export default requireNativeModule<WorktreesStudioOtaUpdatesModule>("WorktreesStudioOtaUpdates");
