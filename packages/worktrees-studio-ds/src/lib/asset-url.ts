import { Platform } from "react-native";

let assetOrigin = "https://worker.example.com";

/**
 * Override the asset origin (the app calls this once at startup with its
 * env base URL). Falls back to the production worker when never called,
 * e.g. inside DS expo-stories.
 */
export function setAssetOrigin(origin: string): void {
  assetOrigin = origin.replace(/\/$/, "");
}

export function getAssetUrl(relativePath: string): string {
  if (Platform.OS === "web") {
    return `${assetOrigin}/api/assets/${relativePath.replace(/^\//, "")}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAssetUrl: nativeGet } = require("worktrees-studio-asset-cache");
  return nativeGet(relativePath, assetOrigin);
}

export async function ensureAssetsCached(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ensureAssetsCached: nativeEnsure } = require("worktrees-studio-asset-cache");
  return nativeEnsure(assetOrigin);
}
