import { File, Directory, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { createMMKV } from "worktrees-studio-mmkv";

const VERSION_KEY = "asset_cache_version";
const PENDING_DOWNLOADS_KEY = "asset_cache_pending";
const META_KEY = "asset_cache_meta";

const mmkv = createMMKV();

const RETRY_DELAYS = [500, 1200, 2500];

/** Per-attempt fetch timeout (ms). Caps DNS + TLS + response wait so a single
 *  attempt cannot hang for the Android OS socket timeout (~15 s). */
const FETCH_TIMEOUT_MS = 8_000;

function getCacheDir(): Directory {
  return new Directory(Paths.cache, "assets_cache");
}

function readMeta(): Record<string, string> {
  try {
    const raw = mmkv.getString(META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, string>): void {
  mmkv.set(META_KEY, JSON.stringify(meta));
}

export function getAssetUrl(relativePath: string, apiOrigin: string): string {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    try {
      const localFile = new File(getCacheDir(), relativePath);
      if (localFile.exists) {
        return (localFile as any).uri;
      }
    } catch {
      // Fallback to remote if local check fails
    }
  }
  return `${apiOrigin}/api/assets/${relativePath.replace(/^\//, "")}`;
}

async function writeFile(localFile: File, buffer: ArrayBuffer): Promise<void> {
  try {
    localFile.parentDirectory.create({ intermediates: true });
  } catch {
    // directory already exists — that's fine
  }
  // iOS FileHandle(forWritingTo:) requires the file to exist, unlike Android's
  // RandomAccessFile. Create an empty file if missing before opening the stream
  // so writableStream works on both platforms (mirrors Android's auto-create).
  try {
    if (!localFile.exists) {
      localFile.create();
    }
  } catch {
    // create is idempotent — ignore if already exists or permission issue
    // will surface on write
  }
  const writer = localFile.writableStream().getWriter();
  await writer.write(new Uint8Array(buffer));
  await writer.close();
}

/**
 * Raw seed source inside the app bundle, copied at prebuild by
 * config/with-raw-assets.js. App assets are not Metro-bundled (no Android
 * resource packaging); seeding reads them via `Paths.bundle` — on Android
 * that is the AssetManager root (asset://), on iOS the main bundle path.
 */
async function seedFromBundle(
  relativePath: string,
  localFile: File,
): Promise<boolean> {
  try {
    const rawFile = new File(Paths.bundle, `worktrees-studio-assets/${relativePath}`);
    if (!rawFile.exists) {
      console.warn(
        "[worktrees-studio-asset-cache] bundle missing:",
        relativePath,
        (rawFile as any).uri,
      );
      return false;
    }
    await writeFile(localFile, await rawFile.arrayBuffer());
    return true;
  } catch (e) {
    console.warn("[worktrees-studio-asset-cache] seed failed:", relativePath, e);
    return false;
  }
}

function isTransientNetworkError(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message || err).toLowerCase();
  return (
    msg.includes("unknownhostexception") ||
    msg.includes("unable to resolve host") ||
    msg.includes("no address associated with hostname") ||
    msg.includes("network request failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("enotfound") ||
    msg.includes("eai_again") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("aborterror") ||
    msg.includes("timed out") ||
    msg.includes("the operation was aborted") ||
    msg.includes("fetch request has been canceled") ||
    msg.includes("canceled") ||
    msg.includes("cancelled")
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      // Transient server gateway or proxy errors
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < maxRetries) {
          await delay(RETRY_DELAYS[attempt] ?? 2000);
          continue;
        }
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && isTransientNetworkError(err)) {
        await delay(RETRY_DELAYS[attempt] ?? 2000);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

/**
 * Pre-seeds assets from the bundled assets manifest into the cache directory.
 * Runs before network operations so the local cache is immediately populated
 * on cold starts, even if offline or switching network interfaces.
 */
async function preSeedBundledAssets(
  bundledManifest: Record<string, string>,
  meta: Record<string, string>,
  cacheDir: Directory,
): Promise<number> {
  let seeded = 0;
  for (const [relativePath, expectedHash] of Object.entries(bundledManifest)) {
    const localFile = new File(cacheDir, relativePath);
    if (meta[relativePath] === expectedHash && localFile.exists) {
      continue;
    }
    if (await seedFromBundle(relativePath, localFile)) {
      meta[relativePath] = expectedHash;
      seeded++;
    }
  }
  if (seeded > 0) {
    writeMeta(meta);
  }
  return seeded;
}

/**
 * Populates the asset cache incrementally:
 *  - pre-seeds from the bundled asset manifest if present;
 *  - fetches remote manifest with exponential backoff on transient DNS errors;
 *  - a cached file is kept when its recorded hash matches the manifest;
 *  - fresh files are seeded from the app bundle's raw asset copies when hash matches;
 *  - everything else downloads with retry from Google Cloud.
 */
export interface EnsureAssetsCachedOptions {
  headers?: Record<string, string>;
}

export async function ensureAssetsCached(
  apiOrigin: string,
  bundledManifest?: Record<string, string>,
  options?: EnsureAssetsCachedOptions,
): Promise<boolean> {
  const cacheDir = getCacheDir();
  try {
    cacheDir.create({ intermediates: true });
  } catch {}

  const meta = readMeta();

  // 1. Pre-seed bundled assets so core assets are available locally immediately
  if (bundledManifest && Object.keys(bundledManifest).length > 0) {
    try {
      const seededCount = await preSeedBundledAssets(
        bundledManifest,
        meta,
        cacheDir,
      );
      if (seededCount > 0) {
        console.log(
          `[worktrees-studio-asset-cache] pre-seeded ${seededCount} bundled assets`,
        );
      }
    } catch (seedErr) {
      console.warn("[worktrees-studio-asset-cache] pre-seed failed:", seedErr);
    }
  }

  const requestInit: RequestInit = options?.headers
    ? { headers: options.headers }
    : {};

  // 2. Fetch manifest with transient retry
  try {
    const manifestUrl = `${apiOrigin}/api/assets/manifest.json`;
    console.log("[worktrees-studio-asset-cache] fetching manifest:", manifestUrl);

    const manifestRes = await fetchWithRetry(manifestUrl, requestInit);
    if (!manifestRes.ok) {
      console.warn("[worktrees-studio-asset-cache] manifest failed:", manifestRes.status);
      return false;
    }
    const manifest: { version: number; files: Record<string, string> } =
      await manifestRes.json();
    console.log("[worktrees-studio-asset-cache] manifest version:", manifest.version);

    const cachedVersion = mmkv.getString(VERSION_KEY);
    if (cachedVersion === String(manifest.version)) {
      console.log("[worktrees-studio-asset-cache] cache up to date");
      mmkv.set(PENDING_DOWNLOADS_KEY, "0");
      return true;
    }

    // Version mismatch: Mark pending while syncing diff
    mmkv.set(PENDING_DOWNLOADS_KEY, "1");

    const entries = Object.entries(manifest.files);
    let kept = 0;
    let seeded = 0;
    let downloaded = 0;

    for (const [relativePath, expectedHash] of entries) {
      const localFile = new File(cacheDir, relativePath);

      if (meta[relativePath] === expectedHash && localFile.exists) {
        kept++;
        continue;
      }

      if (
        bundledManifest?.[relativePath] === expectedHash &&
        (await seedFromBundle(relativePath, localFile))
      ) {
        meta[relativePath] = expectedHash;
        seeded++;
        console.log("[worktrees-studio-asset-cache] seeded from bundle:", relativePath);
        continue;
      }

      const fileUrl = `${apiOrigin}/api/assets/${relativePath.replace(/^\//, "")}`;
      try {
        const res = await fetchWithRetry(fileUrl, requestInit);
        if (!res.ok) {
          console.warn(
            "[worktrees-studio-asset-cache] fetch failed:",
            fileUrl,
            res.status,
          );
          continue;
        }
        await writeFile(localFile, await res.arrayBuffer());
        meta[relativePath] = expectedHash;
        downloaded++;
        console.log("[worktrees-studio-asset-cache] downloaded:", relativePath);
      } catch (fetchErr) {
        console.warn(
          "[worktrees-studio-asset-cache] download failed:",
          relativePath,
          fetchErr,
        );
      }
    }

    writeMeta(meta);
    mmkv.set(VERSION_KEY, String(manifest.version));
    mmkv.set(PENDING_DOWNLOADS_KEY, "0");
    console.log(
      `[worktrees-studio-asset-cache] cache complete (kept ${kept}, seeded ${seeded}, downloaded ${downloaded})`,
    );
    return true;
  } catch (e) {
    mmkv.set(PENDING_DOWNLOADS_KEY, "0");
    const hasLocalAssets = Object.keys(meta).length > 0;
    if (isTransientNetworkError(e) && hasLocalAssets) {
      console.info(
        "[worktrees-studio-asset-cache] manifest sync deferred (network handover/transient DNS, local cache active):",
        (e as any)?.message ?? e,
      );
    } else {
      console.warn("[worktrees-studio-asset-cache] cache failed:", e);
    }
    return false;
  }
}

export async function clearLocalAssetCache(): Promise<void> {
  try {
    const cacheDir = getCacheDir();
    if (cacheDir.exists) {
      cacheDir.delete();
    }
  } catch (err) {
    console.warn("[worktrees-studio-asset-cache] failed to delete cache directory:", err);
  } finally {
    try {
      mmkv.remove(VERSION_KEY);
      mmkv.remove(PENDING_DOWNLOADS_KEY);
      mmkv.remove(META_KEY);
    } catch {
      // best-effort MMKV cleanup
    }
  }
}
