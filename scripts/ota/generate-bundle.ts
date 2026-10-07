/**
 * Builds the OTA zips (JS bundle + android drawables) with `expo export:embed` — the same artefact format the
 * native OTA client downloads. Assets other than the bundle are served from Cloud Storage, not the zip.
 *
 *   bun scripts/ota/generate-bundle.ts [--platform android|ios|all]
 */
import archiver from "archiver";
import { execSync } from "node:child_process";
import { cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync, rmdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..", "..");
const appDir = join(root, "apps", "app");
const outRoot = join(root, "bundles");

const arg = (name: string, d: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? (process.argv[i + 1] ?? d) : d;
};

function zipFile(sourceDir: string, zipPath: string, bundleName: string): Promise<void> {
  return new Promise((res, rej) => {
    const out = createWriteStream(zipPath);
    const zip = archiver("zip", { zlib: { level: 9 } });
    out.on("close", () => res());
    zip.on("error", rej);
    zip.pipe(out);
    zip.glob(bundleName, { cwd: sourceDir, dot: false }, { name: bundleName });
    zip.finalize();
  });
}

export async function buildPlatform(platform: "android" | "ios"): Promise<string> {
  const outDir = join(outRoot, platform);
  const assetsDest = join(outDir, "assets");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(assetsDest, { recursive: true });
  const bundleName = platform === "ios" ? "main.jsbundle" : "index.android.bundle";
  const entry = createRequire(join(appDir, "package.json")).resolve("expo-router/entry");

  execSync(
    `bunx expo export:embed --platform ${platform} --entry-file "${entry}" --bundle-output "${join(outDir, bundleName)}" --assets-dest "${assetsDest}" --dev false --reset-cache`,
    { cwd: appDir, stdio: "inherit" },
  );

  if (platform === "ios") {
    const inner = join(assetsDest, "assets");
    if (existsSync(inner)) {
      const tmp = join(assetsDest, ".restructure_tmp");
      renameSync(inner, tmp);
      for (const item of readdirSync(tmp)) {
        const dst = join(assetsDest, item);
        if (existsSync(dst)) rmSync(dst, { recursive: true });
        renameSync(join(tmp, item), dst);
      }
      rmdirSync(tmp);
    }
  } else {
    for (const item of readdirSync(assetsDest)) {
      if (item.startsWith("drawable-") || item === "raw") cpSync(join(assetsDest, item), join(outDir, item), { recursive: true });
    }
  }
  const zipPath = join(outRoot, `${platform}.zip`);
  await zipFile(outDir, zipPath, bundleName);
  console.log(`Bundle saved: ${zipPath}`);
  return zipPath;
}

if (import.meta.main) {
  const p = arg("--platform", "all").toLowerCase();
  const platforms: ("android" | "ios")[] | null = p === "all" ? ["android", "ios"] : p === "android" || p === "ios" ? [p] : null;
  if (!platforms) throw new Error("--platform must be android, ios or all");
  mkdirSync(outRoot, { recursive: true });
  for (const platform of platforms) await buildPlatform(platform);
}
