/**
 * Publish an OTA bundle to your Cloud Run API + Cloud Storage bucket.
 *
 *   OTA_CHANNEL=staging bun scripts/ota/publish.ts [--native 1.0.0] [--skip-build]
 *
 * Flow: build android/ios zips → POST /api/ota/prepare (signed GCS PUT urls) → PUT zips straight to the bucket
 * (no 32 MiB Cloud Run request limit) → POST /api/ota/commit (verified by size, sequential bundle id).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPlatform } from "./generate-bundle.ts";
import { api, otaTarget, root } from "./lib.ts";

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const { cfg, url, token, channel } = otaTarget();
const nativeId = arg("--native") ?? cfg.version;
const platforms = ["android", "ios"] as const;

const zips: Record<string, Uint8Array> = {};
for (const p of platforms) {
  const zipPath = join(root, "bundles", `${p}.zip`);
  if (!process.argv.includes("--skip-build") || !existsSync(zipPath)) await buildPlatform(p);
  zips[p] = readFileSync(zipPath);
}

console.log(`→ ${channel}: ${url} (native ${nativeId})`);
const prep = await api<{ uploadId: string; android: { url: string }; ios: { url: string } }>(url, token, "/api/ota/prepare", {
  method: "POST",
  body: JSON.stringify({ nativeId }),
});

const commit: Record<string, { sha256: string; size: number }> = {};
for (const p of platforms) {
  const data = zips[p];
  const put = await fetch(prep[p].url, { method: "PUT", headers: { "content-type": "application/zip" }, body: data as BodyInit });
  if (!put.ok) throw new Error(`upload ${p} failed: ${put.status} ${(await put.text()).slice(0, 200)}`);
  commit[p] = { sha256: createHash("sha256").update(data).digest("hex"), size: data.byteLength };
  console.log(`  ${p}: ${(data.byteLength / 1024 / 1024).toFixed(2)} MiB uploaded`);
}

const done = await api<{ bundle_id: number }>(url, token, "/api/ota/commit", {
  method: "POST",
  body: JSON.stringify({ nativeId, uploadId: prep.uploadId, ...commit }),
});
console.log(`✓ published bundle #${done.bundle_id} for native ${nativeId} on ${channel}`);
