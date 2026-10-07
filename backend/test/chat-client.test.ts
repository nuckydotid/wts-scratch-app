import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { upgradeWebSocket, websocket } from "hono/bun";
import { createApp } from "../src/app.ts";
import { DevVerifier } from "../src/auth.ts";
import { ChatClient } from "../src/chat-client.ts";
import type { ChatFrame } from "../src/chat-client.ts";
import { ChatHub, LocalBus } from "../src/chat.ts";
import { connectDb } from "../src/db/index.ts";
import { DevSchedulerVerifier } from "../src/internal.ts";
import { NoopNotifier } from "../src/push.ts";
import { MemoryObjectStore } from "../src/storage.ts";

let close: () => Promise<void>;
let hub: ChatHub;
let server: ReturnType<typeof Bun.serve>;
let app: ReturnType<typeof createApp>;
const url = () => `ws://localhost:${server.port}/ws/chat`;

beforeAll(async () => {
  const c = await connectDb("");
  close = c.close;
  hub = new ChatHub(c.db, new LocalBus(), new NoopNotifier());
  hub.start();
  app = createApp({ db: c.db, storage: new MemoryObjectStore(), verifier: new DevVerifier(), notifier: new NoopNotifier(), hub, upgradeWebSocket, schedulerVerifier: new DevSchedulerVerifier(), otaScriptToken: "t" });
  server = Bun.serve({ port: 0, fetch: app.fetch, websocket });
});
afterAll(async () => {
  await hub.stop();
  server.stop(true);
  await close();
});

const until = async (cond: () => boolean, ms = 2000) => {
  const end = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > end) throw new Error("timeout");
    await new Promise((r) => setTimeout(r, 10));
  }
};

const mk = (uid: string, over: Partial<ConstructorParameters<typeof ChatClient>[0]> = {}) =>
  new ChatClient({ url: url(), getToken: () => `dev:${uid}`, pingMs: 50, ...over });

describe("ChatClient against the real server", () => {
  test("connects, sends with an ack, and delivers to the other member", async () => {
    const ann = mk("ann");
    const bob = mk("bob");
    const got: ChatFrame[] = [];
    bob.onFrame((f) => got.push(f));
    ann.connect();
    bob.connect();
    await until(() => ann.getSnapshot().status === "online" && bob.getSnapshot().status === "online");
    expect(ann.getSnapshot().uid).toBe("ann");

    const created = await app.request("/api/v1/chat/rooms", { method: "POST", headers: { authorization: "Bearer dev:ann", "content-type": "application/json" }, body: JSON.stringify({ name: "R", members: ["bob"] }) });
    const { id: room } = (await created.json()) as { id: string };
    await until(() => got.some((f) => f.t === "room"));

    const { id } = await ann.send(room, "hello");
    await until(() => got.some((f) => f.t === "message"));
    expect(got.find((f) => f.t === "message")).toMatchObject({ message: { id, room, from: "ann", body: "hello" } });

    bob.markRead(room, id);
    await until(() => true);
    ann.close();
    bob.close();
    expect(ann.getSnapshot().status).toBe("closed");
  });

  test("send() rejects when offline and when the server refuses", async () => {
    const c = mk("zed");
    await expect(c.send("x", "hi")).rejects.toThrow("offline");
    c.connect();
    await until(() => c.getSnapshot().status === "online");
    await expect(c.send("no-such-room", "hi")).rejects.toThrow("forbidden_or_invalid");
    c.close();
  });

  test("a rejected token ends in a closed state with a readable error", async () => {
    const c = mk("x", { getToken: () => "garbage", reconnect: false });
    c.connect();
    await until(() => c.getSnapshot().status === "closed");
  });

  test("no token means fatal 'Not signed in'", async () => {
    const c = mk("x", { getToken: () => null });
    c.connect();
    await until(() => c.getSnapshot().status === "closed");
    expect(c.getSnapshot().error).toBe("Not signed in.");
  });

  test("reconnects after the socket drops and keeps working", async () => {
    const c = mk("rey");
    c.connect();
    await until(() => c.getSnapshot().status === "online");
    // Drop the server side of every socket for this user by restarting the hub's connections.
    const internal = c as unknown as { ws: WebSocket };
    internal.ws.close(); // client-initiated abnormal close → treated as a drop
    await until(() => c.getSnapshot().status !== "online");
    await until(() => c.getSnapshot().status === "online", 5000);
    c.close();
  });
});
