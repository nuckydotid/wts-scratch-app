import { upgradeWebSocket, websocket } from "hono/bun";
import { createApp } from "./app.ts";
import { DevVerifier, FirebaseVerifier } from "./auth.ts";
import { ChatHub, LocalBus, PgBus } from "./chat.ts";
import { connectDb } from "./db/index.ts";
import { loadEnv } from "./env.ts";
import { DevSchedulerVerifier, GoogleSchedulerVerifier } from "./internal.ts";
import { log } from "./log.ts";
import { NoopNotifier, OneSignalNotifier } from "./push.ts";
import { GcsObjectStore, MemoryObjectStore } from "./storage.ts";

const env = loadEnv();
if (env.authDev && env.projectId) log("WARNING", "AUTH_DEV is enabled on a project with GOOGLE_CLOUD_PROJECT set — disable it in production.");

const { db, close } = await connectDb(env.databaseUrl);

let bus: LocalBus | PgBus;
if (env.databaseUrl) {
  bus = new PgBus(env.databaseUrl, db);
  await bus.start();
} else {
  bus = new LocalBus();
}

const notifier = env.oneSignalAppId && env.oneSignalApiKey ? new OneSignalNotifier(env.oneSignalAppId, env.oneSignalApiKey) : new NoopNotifier();
const hub = new ChatHub(db, bus, notifier);
hub.start();

const app = createApp({
  db,
  storage: env.bucket ? new GcsObjectStore(env.bucket) : new MemoryObjectStore(),
  verifier: env.authDev ? new DevVerifier() : new FirebaseVerifier(env.projectId),
  notifier,
  hub,
  upgradeWebSocket,
  schedulerVerifier: env.authDev ? new DevSchedulerVerifier() : new GoogleSchedulerVerifier(env.serviceUrl, env.schedulerServiceAccount),
  chatRetentionDays: env.chatRetentionDays,
  corsOrigins: env.authDev ? "*" : env.corsOrigins,
  otaScriptToken: env.otaScriptToken,
  signedUrlTtlSec: env.signedUrlTtlSec,
});

const server = Bun.serve({ port: env.port, fetch: app.fetch, websocket });
log("INFO", "api listening", { port: env.port, db: env.databaseUrl ? "postgres" : "pglite", bucket: env.bucket || "memory", push: notifier instanceof OneSignalNotifier ? "onesignal" : "noop" });

// Cloud Run sends SIGTERM before stopping an instance: close sockets and the pool cleanly.
process.on("SIGTERM", () => {
  void (async () => {
    await hub.stop();
    await server.stop();
    await close();
    process.exit(0);
  })();
});
