import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { z } from "zod";
import { timingSafeEqual } from "./auth.ts";
import type { Db } from "./db/index.ts";
import { schema } from "./db/index.ts";
import { compareSemVer, isValidNativeVersion, normalizeNativeMarketingVersion } from "./semver.ts";
import type { ObjectStore } from "./storage.ts";

export interface OtaDeps {
  db: Db;
  storage: ObjectStore;
  scriptToken: string;
  signedUrlTtlSec: number;
}

const MAX_MULTIPART_BYTES = 28 * 1024 * 1024; // Cloud Run rejects request bodies over 32 MiB; bigger bundles use prepare/commit
const sha256Hex = async (data: Uint8Array) => {
  const d = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Self-hosted OTA service: bundles live in Cloud Storage, metadata in Postgres.
 *
 *   POST   /check-update                 public — called by the native client on launch
 *   POST   /prepare  /commit             script token — large bundles: PUT straight to GCS with signed URLs
 *   POST   /upload                       script token — small bundles as multipart
 *   GET    /bundles                      script token
 *   PATCH  /bundles/:nativeId/:bundleId  script token — { disabled } (rollback = disable the newest)
 *   DELETE /bundles/:nativeId/:bundleId  script token
 *   PUT    /policy                       script token — { minNativeVersion?, nativeId?, minOtaBundleId? }
 */
export function otaRoutes(deps: OtaDeps) {
  const { db, storage, scriptToken, signedUrlTtlSec } = deps;
  const ota = new Hono();

  const requireScriptToken: MiddlewareHandler = async (c, next) => {
    const m = /^Bearer (.+)$/.exec(c.req.header("authorization") ?? "");
    if (!scriptToken || !m || !timingSafeEqual(m[1].trim(), scriptToken)) return c.json({ error: "unauthorized" }, 401);
    await next();
  };

  ota.post("/check-update", async (c) => {
    const parsed = z
      .object({
        current_bundle_id: z.number().int().nullish(),
        platform: z.enum(["android", "ios"]),
        native_id: z.union([z.string(), z.number()]),
      })
      .safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const nativeKey = normalizeNativeMarketingVersion(String(parsed.data.native_id));
    if (!isValidNativeVersion(nativeKey)) return c.json({ error: "invalid_native_id" }, 400);
    const cur = Math.max(0, Math.floor(parsed.data.current_bundle_id ?? 0));

    const [policy] = await db.select().from(schema.versionPolicy).where(eq(schema.versionPolicy.id, 1)).limit(1);
    const minNativeVersion = (policy?.minNativeVersion ?? "1.0.0").trim();
    const [minRow] = await db.select().from(schema.nativeOtaMinBundle).where(eq(schema.nativeOtaMinBundle.nativeId, nativeKey)).limit(1);
    const minOtaBundleId = minRow?.minOtaBundleId ?? 0;
    const requires_store_update = compareSemVer(nativeKey, minNativeVersion) < 0;

    const [latest] = await db
      .select()
      .from(schema.otaBundle)
      .where(and(eq(schema.otaBundle.nativeId, nativeKey), eq(schema.otaBundle.disabled, false)))
      .orderBy(desc(schema.otaBundle.id))
      .limit(1);

    const policyPayload = { min_native_version: minNativeVersion, min_ota_bundle_id: minOtaBundleId };
    if (!latest) {
      return c.json({
        update_available: false,
        latest: null,
        zip_url: null,
        zip_size: null,
        zip_sha256: null,
        policy: policyPayload,
        requires_store_update,
        requires_mandatory_ota: !requires_store_update && minOtaBundleId > 0 && cur < minOtaBundleId,
      });
    }
    // A client carrying a bundle id from a previous native version has an id above ours: treat it as 0.
    const effective = cur > 0 && cur > latest.id ? 0 : cur;
    const key = parsed.data.platform === "android" ? latest.androidKey : latest.iosKey;
    const size = parsed.data.platform === "android" ? latest.androidSize : latest.iosSize;
    const sha = parsed.data.platform === "android" ? latest.androidSha256 : latest.iosSha256;
    return c.json({
      update_available: effective < latest.id,
      latest: { bundle_id: latest.id, published_at: latest.publishedAt },
      zip_url: key ? await storage.signedGetUrl(key, signedUrlTtlSec) : null,
      zip_size: size ?? null,
      zip_sha256: sha ?? null,
      policy: policyPayload,
      requires_store_update,
      requires_mandatory_ota: !requires_store_update && minOtaBundleId > 0 && effective < minOtaBundleId,
    });
  });

  async function nextBundleId(nativeId: string): Promise<number> {
    const [r] = await db
      .select({ maxId: sql<number>`COALESCE(MAX(${schema.otaBundle.id}), 0)` })
      .from(schema.otaBundle)
      .where(eq(schema.otaBundle.nativeId, nativeId));
    return Number(r?.maxId ?? 0) + 1;
  }

  ota.post("/prepare", requireScriptToken, async (c) => {
    const body = z.object({ nativeId: z.string() }).safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid_body" }, 400);
    const nativeId = normalizeNativeMarketingVersion(body.data.nativeId);
    if (!isValidNativeVersion(nativeId)) return c.json({ error: "invalid_native_id" }, 400);
    const uploadId = crypto.randomUUID();
    const mk = async (platform: "android" | "ios") => {
      const key = `ota/${nativeId}/${uploadId}/${platform}.zip`;
      return { key, url: await storage.signedPutUrl(key, "application/zip", 1800) };
    };
    return c.json({ uploadId, nativeId, android: await mk("android"), ios: await mk("ios") });
  });

  ota.post("/commit", requireScriptToken, async (c) => {
    const part = z.object({ sha256: z.string().regex(/^[0-9a-f]{64}$/), size: z.number().int().positive() });
    const body = z
      .object({ nativeId: z.string(), uploadId: z.string().uuid(), android: part.optional(), ios: part.optional() })
      .safeParse(await c.req.json().catch(() => null));
    if (!body.success || (!body.data.android && !body.data.ios)) return c.json({ error: "invalid_body" }, 400);
    const nativeId = normalizeNativeMarketingVersion(body.data.nativeId);
    if (!isValidNativeVersion(nativeId)) return c.json({ error: "invalid_native_id" }, 400);
    const row: Partial<typeof schema.otaBundle.$inferInsert> = {};
    for (const platform of ["android", "ios"] as const) {
      const p = body.data[platform];
      if (!p) continue;
      const key = `ota/${nativeId}/${body.data.uploadId}/${platform}.zip`;
      const head = await storage.head(key);
      if (!head) return c.json({ error: "missing_object", platform }, 409);
      if (head.size !== p.size) return c.json({ error: "size_mismatch", platform }, 409);
      if (platform === "android") Object.assign(row, { androidKey: key, androidSize: p.size, androidSha256: p.sha256 });
      else Object.assign(row, { iosKey: key, iosSize: p.size, iosSha256: p.sha256 });
    }
    const id = await nextBundleId(nativeId);
    await db.insert(schema.otaBundle).values({ id, nativeId, ...row });
    return c.json({ ok: true, bundle_id: id, native_id: nativeId }, 201);
  });

  ota.post("/upload", requireScriptToken, async (c) => {
    let form: FormData;
    try {
      form = await c.req.formData();
    } catch {
      return c.json({ error: "invalid_body" }, 400);
    }
    const nativeId = normalizeNativeMarketingVersion(String(form.get("nativeId") ?? ""));
    if (!isValidNativeVersion(nativeId)) return c.json({ error: "invalid_native_id" }, 400);
    const files: Record<"android" | "ios", File | null> = {
      android: form.get("android") instanceof File ? (form.get("android") as File) : null,
      ios: form.get("ios") instanceof File ? (form.get("ios") as File) : null,
    };
    if (!files.android && !files.ios) return c.json({ error: "file_required" }, 400);
    const uploadId = crypto.randomUUID();
    const row: Partial<typeof schema.otaBundle.$inferInsert> = {};
    for (const platform of ["android", "ios"] as const) {
      const f = files[platform];
      if (!f) continue;
      if (f.size > MAX_MULTIPART_BYTES) return c.json({ error: "too_large", hint: "use /prepare + /commit" }, 413);
      const data = new Uint8Array(await f.arrayBuffer());
      const key = `ota/${nativeId}/${uploadId}/${platform}.zip`;
      await storage.put(key, data, "application/zip");
      const sha = await sha256Hex(data);
      if (platform === "android") Object.assign(row, { androidKey: key, androidSize: data.byteLength, androidSha256: sha });
      else Object.assign(row, { iosKey: key, iosSize: data.byteLength, iosSha256: sha });
    }
    const id = await nextBundleId(nativeId);
    await db.insert(schema.otaBundle).values({ id, nativeId, ...row });
    return c.json({ ok: true, bundle_id: id, native_id: nativeId }, 201);
  });

  ota.get("/bundles", requireScriptToken, async (c) => {
    const rows = await db.select().from(schema.otaBundle).orderBy(desc(schema.otaBundle.publishedAt));
    return c.json({
      bundles: rows.map((b) => ({
        bundle_id: b.id,
        native_id: b.nativeId,
        published_at: b.publishedAt,
        has_android: !!b.androidKey,
        has_ios: !!b.iosKey,
        disabled: b.disabled,
      })),
    });
  });

  const idParams = (c: { req: { param: (k: string) => string } }) => ({
    nativeId: normalizeNativeMarketingVersion(c.req.param("nativeId")),
    bundleId: Number(c.req.param("bundleId")),
  });

  ota.patch("/bundles/:nativeId/:bundleId", requireScriptToken, async (c) => {
    const { nativeId, bundleId } = idParams(c);
    const body = z.object({ disabled: z.boolean() }).safeParse(await c.req.json().catch(() => null));
    if (!body.success || !Number.isInteger(bundleId) || bundleId <= 0) return c.json({ error: "invalid_body" }, 400);
    const res = await db
      .update(schema.otaBundle)
      .set({ disabled: body.data.disabled })
      .where(and(eq(schema.otaBundle.nativeId, nativeId), eq(schema.otaBundle.id, bundleId)))
      .returning({ id: schema.otaBundle.id });
    return res.length ? c.json({ ok: true }) : c.json({ error: "not_found" }, 404);
  });

  ota.delete("/bundles/:nativeId/:bundleId", requireScriptToken, async (c) => {
    const { nativeId, bundleId } = idParams(c);
    if (!Number.isInteger(bundleId) || bundleId <= 0) return c.json({ error: "invalid_bundle" }, 400);
    const [b] = await db
      .select()
      .from(schema.otaBundle)
      .where(and(eq(schema.otaBundle.nativeId, nativeId), eq(schema.otaBundle.id, bundleId)))
      .limit(1);
    if (!b) return c.json({ error: "not_found" }, 404);
    await Promise.allSettled([b.androidKey && storage.delete(b.androidKey), b.iosKey && storage.delete(b.iosKey)]);
    await db.delete(schema.otaBundle).where(and(eq(schema.otaBundle.nativeId, nativeId), eq(schema.otaBundle.id, bundleId)));
    return c.json({ ok: true });
  });

  ota.put("/policy", requireScriptToken, async (c) => {
    const body = z
      .object({ minNativeVersion: z.string().optional(), nativeId: z.string().optional(), minOtaBundleId: z.number().int().min(0).optional() })
      .safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid_body" }, 400);
    const now = new Date();
    if (body.data.minNativeVersion !== undefined) {
      if (!isValidNativeVersion(body.data.minNativeVersion)) return c.json({ error: "invalid_native_id" }, 400);
      const v = normalizeNativeMarketingVersion(body.data.minNativeVersion);
      await db
        .insert(schema.versionPolicy)
        .values({ id: 1, minNativeVersion: v, updatedAt: now })
        .onConflictDoUpdate({ target: schema.versionPolicy.id, set: { minNativeVersion: v, updatedAt: now } });
    }
    if (body.data.nativeId !== undefined && body.data.minOtaBundleId !== undefined) {
      const n = normalizeNativeMarketingVersion(body.data.nativeId);
      if (!isValidNativeVersion(n)) return c.json({ error: "invalid_native_id" }, 400);
      await db
        .insert(schema.nativeOtaMinBundle)
        .values({ nativeId: n, minOtaBundleId: body.data.minOtaBundleId, updatedAt: now })
        .onConflictDoUpdate({ target: schema.nativeOtaMinBundle.nativeId, set: { minOtaBundleId: body.data.minOtaBundleId, updatedAt: now } });
    }
    return c.json({ ok: true });
  });

  return ota;
}
