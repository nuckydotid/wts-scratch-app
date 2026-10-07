import { type EventSubscription } from "expo-modules-core";

import WorktreesStudioOtaUpdatesModule from "./WorktreesStudioOtaUpdatesModule";

export type {
  DownloadProgressEvent,
  DownloadUpdateOptions,
  RuntimeConfig,
} from "./WorktreesStudioOtaUpdates.types";

export async function getRuntimeConfig(): Promise<
  import("./WorktreesStudioOtaUpdates.types").RuntimeConfig
> {
  return WorktreesStudioOtaUpdatesModule.getRuntimeConfig();
}

export async function getCurrentBundleId(): Promise<number> {
  return WorktreesStudioOtaUpdatesModule.getCurrentBundleId();
}

export async function getPendingBundleId(): Promise<number> {
  return WorktreesStudioOtaUpdatesModule.getPendingBundleId();
}

export async function downloadUpdateAsync(
  zipUrl: string,
  bundleId: number,
  zipSize?: number,
  zipSha256?: string,
): Promise<boolean> {
  return WorktreesStudioOtaUpdatesModule.downloadUpdateAsync({
    zipUrl,
    bundleId,
    zipSize,
    zipSha256,
  });
}

export async function applyUpdateAsync(): Promise<void> {
  await WorktreesStudioOtaUpdatesModule.applyUpdateAsync();
}

export async function clearAppCacheAndStorage(): Promise<boolean> {
  return WorktreesStudioOtaUpdatesModule.clearAppCacheAndStorage();
}

export async function markStartupSuccess(): Promise<boolean> {
  return WorktreesStudioOtaUpdatesModule.markStartupSuccess();
}

export async function startPlayStoreInAppUpdate(): Promise<boolean> {
  return WorktreesStudioOtaUpdatesModule.startPlayStoreInAppUpdate();
}

export function addDownloadListener(
  listener: (
    event: import("./WorktreesStudioOtaUpdates.types").DownloadProgressEvent,
  ) => void,
): EventSubscription {
  return WorktreesStudioOtaUpdatesModule.addListener("downloadProgress", listener);
}
