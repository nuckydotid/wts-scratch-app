import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { createApp } from "../src/app.ts";
import { DevVerifier, requireRole, requireUser } from "../src/auth.ts";
import type { AuthVars } from "../src/auth.ts";
import { buildManifest } from "../src/assets.ts";
import { ChatHub, LocalBus } from "../src/chat.ts";
import { connectDb } from "../src/db/index.ts";
import { DevSchedulerVerifier } from "../src/internal.ts";
import { NoopNotifier } from "../src/push.ts";
import { MemoryObjectStore } from "../src/storage.ts";

let app: ReturnType<typeof createApp>;
let close: () => Promise<void>;
const storage = new MemoryObjectStore();

beforeAll(async () => {
  const c = await connectDb("");
  close = c.close;
  const hub = new ChatHub(c.db, new LocalBus(), new NoopNotifier());
  hub.start();
  app = createApp({ db: c.db, storage, verifier: new DevVerifier(), notifier: new NoopNotifier(), hub, upgradeWebSocket, schedulerVerifier: new DevSchedulerVerifier(), chatRetentionDays: 1, otaScriptToken: "t" });
});
afterAll(async () => close());

describe("roles (Firebase custom claim `role`)", () => {
  const guarded = new Hono<{ Variables: AuthVars }>().use(requireUser(new DevVerifier())).get("/admin", requireRole("admin"), (c) => c.json({ ok: true }));
  const call = (token: string) => guarded.request("/admin", { headers: { authorization: `Bearer ${token}` } });
  test("only the allowed role passes", async () => {
    expect((await call("dev:ann:admin")).status).toBe(200);
    expect((await call("dev:ann:member")).status).toBe(403);
    expect((await call("dev:ann")).status).toBe(403);
    expect((await call("nope")).status).toBe(401);
  });
});

describe("asset manifest (Cloud Storage)", () => {
  test("version follows the content; files redirect to signed URLs", async () => {
    expect(await buildManifest(storage)).toEqual({ version: 0, files: {} });
    await storage.put("assets/img/logo.png", new Uint8Array([1, 2, 3]), "image/png");
    const m1 = await (await app.request("/api/assets/manifest.json")).json();
    expect(Object.keys(m1.files)).toEqual(["img/logo.png"]);
    expect(m1.version).toBeGreaterThan(0);
    await storage.put("assets/img/logo.png", new Uint8Array([9, 9, 9]), "image/png");
    const m2 = await (await app.request("/api/assets/manifest.json")).json();
    expect(m2.version).not.toBe(m1.version);
    const r = await app.request("/api/assets/img/logo.png", { redirect: "manual" });
    expect(r.status).toBe(302);
    expect(r.headers.get("location")).toContain("memory://bucket/assets/img/logo.png");
    expect((await app.request("/api/assets/missing.png")).status).toBe(404);
    // `..` segments are normalised away by the URL parser (→ not under /api/assets); encoded slashes reach our own check.
    expect((await app.request("/api/assets/a%2f..%2fb")).status).toBe(400);
    expect((await app.request("/api/assets/%2e%2e/secret")).status).toBe(404);
  });
});

describe("Cloud Scheduler cron", () => {
  const cron = (task: string, token?: string) => app.request(`/internal/cron/${task}`, { method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {} });
  test("requires the scheduler identity", async () => {
    expect((await cron("chat-retention")).status).toBe(401);
    expect((await cron("chat-retention", "wrong")).status).toBe(401);
  });
  test("runs known tasks only", async () => {
    const ok = await cron("chat-retention", "dev-scheduler");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ task: "chat-retention", result: { deleted: 0 } });
    expect((await cron("nope", "dev-scheduler")).status).toBe(404);
    expect((await cron("constructor", "dev-scheduler")).status).toBe(404);
  });
});

describe("CORS", () => {
  const withOrigins = async (corsOrigins: string[] | "*") => {
    const c = await connectDb("");
    const hub = new ChatHub(c.db, new LocalBus(), new NoopNotifier());
    const a = createApp({ db: c.db, storage: new MemoryObjectStore(), verifier: new DevVerifier(), notifier: new NoopNotifier(), hub, upgradeWebSocket, schedulerVerifier: new DevSchedulerVerifier(), corsOrigins, otaScriptToken: "t" });
    return { a, close: c.close };
  };
  const preflight = (a: ReturnType<typeof createApp>, origin: string) =>
    a.request("/api/v1/items", { method: "OPTIONS", headers: { origin, "access-control-request-method": "GET", "access-control-request-headers": "authorization" } });

  test("no origins configured → browsers are not allowed", async () => {
    const { a, close: done } = await withOrigins([]);
    expect((await preflight(a, "https://evil.example")).headers.get("access-control-allow-origin")).toBeNull();
    await done();
  });
  test("listed origins are echoed, others are not; credentials are never enabled", async () => {
    const { a, close: done } = await withOrigins(["https://app.example.com"]);
    const ok = await preflight(a, "https://app.example.com");
    expect(ok.headers.get("access-control-allow-origin")).toBe("https://app.example.com");
    expect(ok.headers.get("access-control-allow-credentials")).toBeNull();
    expect((await preflight(a, "https://evil.example")).headers.get("access-control-allow-origin")).toBeNull();
    await done();
  });
  test('"*" is the dev-mode wildcard', async () => {
    const { a, close: done } = await withOrigins("*");
    expect((await preflight(a, "http://localhost:8081")).headers.get("access-control-allow-origin")).toBe("*");
    await done();
  });
});
