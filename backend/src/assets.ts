import { createHash } from "node:crypto";
import { Hono } from "hono";
import { assertSafeKey } from "./storage.ts";
import type { ObjectStore } from "./storage.ts";

const PREFIX = "assets/";

/**
 * Remote asset manifest for `worktrees-studio-asset-cache`: every object under `assets/` in the bucket, hashed.
 * `version` is derived from the content, so it changes exactly when an asset is added, removed or replaced.
 * Upload with `gsutil -m rsync -r ./assets gs://<bucket>/assets` (or `gcloud storage rsync`).
 */
export async function buildManifest(storage: ObjectStore): Promise<{ version: number; files: Record<string, string> }> {
  const objects = await storage.list(PREFIX);
  const files: Record<string, string> = {};
  const h = createHash("sha256");
  for (const o of objects) {
    const rel = o.key.slice(PREFIX.length);
    files[rel] = o.hash;
    h.update(`${rel}:${o.hash}\n`);
  }
  // 48 bits keeps the number exactly representable as a JS number.
  const version = objects.length ? parseInt(h.digest("hex").slice(0, 12), 16) : 0;
  return { version, files };
}

export function assetRoutes(deps: { storage: ObjectStore; signedUrlTtlSec: number }) {
  return new Hono()
    .get("/manifest.json", async (c) => {
      c.header("cache-control", "public, max-age=60");
      return c.json(await buildManifest(deps.storage));
    })
    .get("/*", async (c) => {
      const rel = decodeURIComponent(new URL(c.req.url).pathname.replace(/^.*\/api\/assets\//, ""));
      try {
        assertSafeKey(rel);
      } catch {
        return c.json({ error: "bad_path" }, 400);
      }
      const key = `${PREFIX}${rel}`;
      if (!(await deps.storage.head(key))) return c.json({ error: "not_found" }, 404);
      c.header("cache-control", "public, max-age=300");
      return c.redirect(await deps.storage.signedGetUrl(key, deps.signedUrlTtlSec), 302);
    });
}
