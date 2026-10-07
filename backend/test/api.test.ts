import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createApp } from "../src/app.ts";
import { upgradeWebSocket } from "hono/bun";
import { DevVerifier } from "../src/auth.ts";
import { ChatHub, LocalBus } from "../src/chat.ts";
import { connectDb } from "../src/db/index.ts";
import { DevSchedulerVerifier } from "../src/internal.ts";
import { NoopNotifier } from "../src/push.ts";
import { MemoryObjectStore } from "../src/storage.ts";

const TOKEN = "script-secret-token";
let app: ReturnType<typeof createApp>;
let close: () => Promise<void>;
const storage = new MemoryObjectStore();
const notifier = new NoopNotifier();

const req = (method: string, path: string, opts: { uid?: string; script?: boolean; json?: unknown; form?: FormData } = {}) =>
  app.request(path, {
    method,
    headers: {
      ...(opts.uid ? { authorization: `Bearer dev:${opts.uid}` } : {}),
      ...(opts.script ? { authorization: `Bearer ${TOKEN}` } : {}),
      ...(opts.json !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: opts.form ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined),
  });

beforeAll(async () => {
  const c = await connectDb("");
  close = c.close;
  const hub = new ChatHub(c.db, new LocalBus(), notifier);
  hub.start();
  app = createApp({ db: c.db, storage, verifier: new DevVerifier(), notifier, hub, upgradeWebSocket, schedulerVerifier: new DevSchedulerVerifier(), chatRetentionDays: 30, otaScriptToken: TOKEN });
});
afterAll(async () => close());

describe("items (Cloud SQL / Drizzle)", () => {
  test("requires auth", async () => expect((await req("GET", "/api/v1/items")).status).toBe(401));
  test("CRUD is scoped to the owner", async () => {
    const created = await req("POST", "/api/v1/items", { uid: "ann", json: { name: "  Monstera " } });
    expect(created.status).toBe(201);
    const { item } = (await created.json()) as { item: { id: string; name: string } };
    expect(item.name).toBe("Monstera");
    expect(((await (await req("GET", "/api/v1/items", { uid: "ann" })).json()) as { items: unknown[] }).items).toHaveLength(1);
    expect(((await (await req("GET", "/api/v1/items", { uid: "bob" })).json()) as { items: unknown[] }).items).toHaveLength(0);
    expect((await req("DELETE", `/api/v1/items/${item.id}`, { uid: "bob" })).status).toBe(404);
    expect((await req("DELETE", `/api/v1/items/${item.id}`, { uid: "ann" })).status).toBe(200);
  });
  test("validates input", async () => expect((await req("POST", "/api/v1/items", { uid: "ann", json: { name: "" } })).status).toBe(400));
});

describe("push + uploads + roles", () => {
  test("push test goes to the caller's own uid (OneSignal external id)", async () => {
    const r = await req("POST", "/api/v1/push/test", { uid: "ann" });
    expect(await r.json()).toEqual({ sent: 1, failed: 0 });
    expect(notifier.outbox.at(-1)?.uids).toEqual(["ann"]);
  });
  test("signed upload URLs are namespaced per user and sanitised", async () => {
    const r = await req("POST", "/api/v1/uploads/sign", { uid: "ann", json: { filename: "../../evil name.png", contentType: "image/png" } });
    const j = (await r.json()) as { key: string; url: string };
    expect(j.key.startsWith("uploads/ann/")).toBe(true);
    expect(j.key).not.toContain("..");
    expect(j.url).toContain("upload=1");
    expect((await req("POST", "/api/v1/uploads/sign", { uid: "ann", json: { filename: "a", contentType: "not a type" } })).status).toBe(400);
  });
});

describe("OTA (Cloud Run + Cloud Storage)", () => {
  const zip = (n: number) => new File([new Uint8Array(n).fill(7)], "x.zip", { type: "application/zip" });
  const check = (current: number, native = "1.0.0", platform = "android") =>
    Promise.resolve(req("POST", "/api/ota/check-update", { json: { current_bundle_id: current, platform, native_id: native } })).then((r) => r.json() as Promise<any>);

  test("publishing requires the script token", async () => {
    const form = new FormData();
    form.set("nativeId", "1.0.0");
    form.set("android", zip(10));
    expect((await req("POST", "/api/ota/upload", { form })).status).toBe(401);
    expect((await req("GET", "/api/ota/bundles")).status).toBe(401);
  });

  test("no bundle → no update", async () => {
    const r = await check(0);
    expect(r.update_available).toBe(false);
    expect(r.latest).toBeNull();
  });

  test("multipart upload → sequential ids → check-update returns a signed URL", async () => {
    for (let i = 1; i <= 2; i++) {
      const form = new FormData();
      form.set("nativeId", "1.0.0");
      form.set("android", zip(100 + i));
      form.set("ios", zip(200 + i));
      const r = await req("POST", "/api/ota/upload", { script: true, form });
      expect(r.status).toBe(201);
      expect(((await r.json()) as { bundle_id: number }).bundle_id).toBe(i);
    }
    const r = await check(1);
    expect(r.update_available).toBe(true);
    expect(r.latest.bundle_id).toBe(2);
    expect(r.zip_url).toContain("memory://bucket/ota/1.0.0/");
    expect(r.zip_url).toContain("android.zip");
    expect(r.zip_size).toBe(102);
    expect(r.zip_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect((await check(2)).update_available).toBe(false);
    expect((await check(5)).update_available).toBe(true); // an id carried over from another native version resets to 0
  });

  test("bundle ids are per native version", async () => {
    const form = new FormData();
    form.set("nativeId", "v1.1.0");
    form.set("android", zip(50));
    const r = await req("POST", "/api/ota/upload", { script: true, form });
    expect(((await r.json()) as { bundle_id: number; native_id: string }).native_id).toBe("1.1.0");
    expect((await check(0, "1.1.0")).latest.bundle_id).toBe(1);
  });

  test("rollback: disabling the newest bundle serves the previous one", async () => {
    expect((await req("PATCH", "/api/ota/bundles/1.0.0/2", { script: true, json: { disabled: true } })).status).toBe(200);
    const r = await check(0);
    expect(r.latest.bundle_id).toBe(1);
    expect((await req("PATCH", "/api/ota/bundles/1.0.0/9", { script: true, json: { disabled: true } })).status).toBe(404);
  });

  test("signed-URL publishing (large bundles): prepare → PUT → commit", async () => {
    const prep = (await (await req("POST", "/api/ota/prepare", { script: true, json: { nativeId: "2.0.0" } })).json()) as any;
    expect(prep.android.key).toContain(`ota/2.0.0/${prep.uploadId}/android.zip`);
    // commit before the object exists → 409
    const bad = await req("POST", "/api/ota/commit", { script: true, json: { nativeId: "2.0.0", uploadId: prep.uploadId, android: { sha256: "a".repeat(64), size: 123 } } });
    expect(bad.status).toBe(409);
    await storage.put(prep.android.key, new Uint8Array(123), "application/zip");
    const wrongSize = await req("POST", "/api/ota/commit", { script: true, json: { nativeId: "2.0.0", uploadId: prep.uploadId, android: { sha256: "a".repeat(64), size: 5 } } });
    expect(wrongSize.status).toBe(409);
    const ok = await req("POST", "/api/ota/commit", { script: true, json: { nativeId: "2.0.0", uploadId: prep.uploadId, android: { sha256: "a".repeat(64), size: 123 } } });
    expect(ok.status).toBe(201);
    expect((await check(0, "2.0.0")).zip_size).toBe(123);
  });

  test("policy: minimum native version forces a store update; min bundle forces OTA", async () => {
    expect((await req("PUT", "/api/ota/policy", { script: true, json: { minNativeVersion: "1.1.0" } })).status).toBe(200);
    expect((await check(0, "1.0.0")).requires_store_update).toBe(true);
    expect((await check(0, "1.1.0")).requires_store_update).toBe(false);
    await req("PUT", "/api/ota/policy", { script: true, json: { nativeId: "1.1.0", minOtaBundleId: 1 } });
    const r = await check(0, "1.1.0");
    expect(r.requires_mandatory_ota).toBe(true);
    expect((await check(1, "1.1.0")).requires_mandatory_ota).toBe(false);
  });

  test("delete removes metadata and objects", async () => {
    const before = storage.objects.size;
    expect((await req("DELETE", "/api/ota/bundles/1.1.0/1", { script: true })).status).toBe(200);
    expect(storage.objects.size).toBeLessThan(before);
    expect((await req("DELETE", "/api/ota/bundles/1.1.0/1", { script: true })).status).toBe(404);
  });

  test("rejects malformed input", async () => {
    expect((await req("POST", "/api/ota/check-update", { json: { platform: "windows", native_id: "1.0.0" } })).status).toBe(400);
    expect((await req("POST", "/api/ota/check-update", { json: { platform: "ios", native_id: "../x" } })).status).toBe(400);
  });
});

test("health", async () => expect(await (await req("GET", "/healthz")).json()).toEqual({ ok: true, connections: 0 }));
