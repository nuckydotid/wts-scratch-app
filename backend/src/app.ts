import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import type { UpgradeWebSocket } from "hono/ws";
import { assetRoutes } from "./assets.ts";
import { requireUser } from "./auth.ts";
import type { AuthVars, TokenVerifier } from "./auth.ts";
import { chatRoutes } from "./chat.ts";
import type { ChatHub } from "./chat.ts";
import type { Db } from "./db/index.ts";
import { schema } from "./db/index.ts";
import { internalRoutes } from "./internal.ts";
import type { CronTasks, SchedulerVerifier } from "./internal.ts";
import { logError } from "./log.ts";
import { otaRoutes } from "./ota.ts";
import type { Notifier } from "./push.ts";
import type { ObjectStore } from "./storage.ts";

export interface AppDeps {
  db: Db;
  storage: ObjectStore;
  verifier: TokenVerifier;
  notifier: Notifier;
  /** Realtime chat hub (call `hub.start()` once at boot). */
  hub: ChatHub;
  /** `upgradeWebSocket` from `hono/bun` (or an adapter for your runtime). */
  upgradeWebSocket: UpgradeWebSocket;
  schedulerVerifier: SchedulerVerifier;
  /** Extra Cloud Scheduler tasks, merged with the built-in ones. */
  cronTasks?: CronTasks;
  /** Delete chat messages older than this many days via the `chat-retention` task (0 = keep forever). */
  chatRetentionDays?: number;
  /** Browser origins allowed to call the API (web app, design site). `"*"` only for local dev. Native apps need no CORS. */
  corsOrigins?: string[] | "*";
  otaScriptToken: string;
  signedUrlTtlSec?: number;
}

export function createApp(deps: AppDeps) {
  const { db, storage, verifier, notifier } = deps;
  const auth = requireUser(verifier);

  const api = new Hono<{ Variables: AuthVars }>()
    .use(auth)
    .get("/items", async (c) => {
      const rows = await db
        .select()
        .from(schema.items)
        .where(eq(schema.items.ownerUid, c.get("uid")))
        .orderBy(desc(schema.items.createdAt));
      return c.json({ items: rows });
    })
    .post(
      "/items",
      zValidator("json", z.object({ name: z.string().trim().min(1).max(120) })),
      async (c) => {
        const { name } = c.req.valid("json");
        const [row] = await db
          .insert(schema.items)
          .values({ id: crypto.randomUUID(), ownerUid: c.get("uid"), name })
          .returning();
        return c.json({ item: row }, 201);
      },
    )
    .delete("/items/:id", async (c) => {
      const res = await db
        .delete(schema.items)
        .where(
          and(
            eq(schema.items.id, c.req.param("id")),
            eq(schema.items.ownerUid, c.get("uid")),
          ),
        )
        .returning({ id: schema.items.id });
      return res.length
        ? c.json({ ok: true })
        : c.json({ error: "not_found" }, 404);
    })
    .post("/push/test", async (c) =>
      c.json(await notifier.send([c.get("uid")], "Hello", "Push is working")),
    )
    .post(
      "/uploads/sign",
      zValidator(
        "json",
        z.object({
          filename: z.string().min(1).max(120),
          contentType: z
            .string()
            .regex(/^[a-z]+\/[a-z0-9.+-]+$/i)
            .max(100),
        }),
      ),
      async (c) => {
        const { filename, contentType } = c.req.valid("json");
        const base = filename.split(/[\\/]/).pop() ?? "file";
        const safe =
          base
            .replace(/[^A-Za-z0-9._-]/g, "_")
            .replace(/\.{2,}/g, ".")
            .replace(/^\./, "_") || "file";
        const key = `uploads/${c.get("uid")}/${crypto.randomUUID()}-${safe}`;
        return c.json({
          key,
          url: await storage.signedPutUrl(key, contentType, 900),
          method: "PUT",
        });
      },
    );

  const chat = chatRoutes({
    hub: deps.hub,
    verifier,
    upgradeWebSocket: deps.upgradeWebSocket,
  });
  const signedUrlTtlSec = deps.signedUrlTtlSec ?? 900;
  const cronTasks: CronTasks = {
    "chat-retention": async () => ({
      deleted: await deps.hub.purgeOlderThan(deps.chatRetentionDays ?? 0),
    }),
    ...deps.cronTasks,
  };

  const origins = deps.corsOrigins ?? [];
  const app = new Hono()
    // Bearer tokens only (no cookies), so credentials are never enabled.
    .use(
      "*",
      cors({
        origin: origins === "*" ? "*" : (o) => (origins.includes(o) ? o : null),
        allowHeaders: ["authorization", "content-type"],
        maxAge: 600,
      }),
    )
    .onError((err, c) => {
      logError(err, {
        path: new URL(c.req.url).pathname,
        method: c.req.method,
      });
      return c.json({ error: "internal" }, 500);
    })
    // `/health` works behind Cloud Run, whose front end reserves `/healthz` on *.run.app (it answers 404 itself).
    .get("/health", (c) =>
      c.json({ ok: true, connections: deps.hub.connectionCount }),
    )
    .get("/healthz", (c) =>
      c.json({ ok: true, connections: deps.hub.connectionCount }),
    )
    .route("/api/v1", api)
    .route("/api/v1/chat", chat.rest)
    .route("/ws/chat", chat.ws)
    .route("/api/assets", assetRoutes({ storage, signedUrlTtlSec }))
    .route(
      "/internal",
      internalRoutes({ verifier: deps.schedulerVerifier, tasks: cronTasks }),
    )
    .route(
      "/api/ota",
      otaRoutes({
        db,
        storage,
        scriptToken: deps.otaScriptToken,
        signedUrlTtlSec,
      }),
    );
  return app;
}

/** Use with `hc<AppType>(url)` in the Expo app for end-to-end typed calls. */
export type AppType = ReturnType<typeof createApp>;
