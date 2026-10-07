import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { upgradeWebSocket, websocket } from "hono/bun";
import { createApp } from "../src/app.ts";
import { DevVerifier } from "../src/auth.ts";
import { ChatHub, LocalBus } from "../src/chat.ts";
import { connectDb } from "../src/db/index.ts";
import { DevSchedulerVerifier } from "../src/internal.ts";
import { NoopNotifier } from "../src/push.ts";
import { MemoryObjectStore } from "../src/storage.ts";

interface Frame {
  t: string;
  [k: string]: unknown;
}

/** Tiny WebSocket test client: queues frames and lets a test await the next matching one. */
class Client {
  frames: Frame[] = [];
  private waiters: { match: (f: Frame) => boolean; resolve: (f: Frame) => void }[] = [];
  closed: Promise<number>;
  constructor(private ws: WebSocket) {
    ws.onmessage = (e) => {
      const f = JSON.parse(String(e.data)) as Frame;
      const i = this.waiters.findIndex((w) => w.match(f));
      if (i >= 0) this.waiters.splice(i, 1)[0].resolve(f);
      else this.frames.push(f);
    };
    this.closed = new Promise((r) => (ws.onclose = (e) => r(e.code)));
  }
  static async open(url: string): Promise<Client> {
    const ws = new WebSocket(url);
    await new Promise<void>((res, rej) => {
      ws.onopen = () => res();
      ws.onerror = () => rej(new Error("ws error"));
    });
    return new Client(ws);
  }
  send(f: Record<string, unknown>) {
    this.ws.send(JSON.stringify(f));
  }
  next(t: string, pred: (f: Frame) => boolean = () => true, ms = 2000): Promise<Frame> {
    const match = (f: Frame) => f.t === t && pred(f);
    const i = this.frames.findIndex(match);
    if (i >= 0) return Promise.resolve(this.frames.splice(i, 1)[0]);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout waiting for ${t}`)), ms);
      this.waiters.push({ match, resolve: (f) => (clearTimeout(timer), resolve(f)) });
    });
  }
  close() {
    this.ws.close();
  }
}

let close: () => Promise<void>;
let hubA: ChatHub;
let hubB: ChatHub;
let a: ReturnType<typeof Bun.serve>;
let b: ReturnType<typeof Bun.serve>;
let appA: ReturnType<typeof createApp>;
const notifier = new NoopNotifier();
const urlA = () => `ws://localhost:${a.port}/ws/chat`;
const urlB = () => `ws://localhost:${b.port}/ws/chat`;

const rest = (method: string, path: string, uid: string, json?: unknown) =>
  appA.request(`/api/v1/chat${path}`, {
    method,
    headers: { authorization: `Bearer dev:${uid}`, ...(json !== undefined ? { "content-type": "application/json" } : {}) },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

const connect = async (url: string, uid: string) => {
  const c = await Client.open(url);
  c.send({ t: "auth", token: `dev:${uid}` });
  expect((await c.next("ready")).uid).toBe(uid);
  return c;
};

beforeAll(async () => {
  const conn = await connectDb("");
  close = conn.close;
  // Two "instances" sharing one database and one bus, as two Cloud Run revisions share Postgres LISTEN/NOTIFY.
  const bus = new LocalBus();
  hubA = new ChatHub(conn.db, bus, notifier);
  hubB = new ChatHub(conn.db, bus, notifier);
  hubA.start();
  hubB.start();
  const make = (hub: ChatHub) =>
    createApp({ db: conn.db, storage: new MemoryObjectStore(), verifier: new DevVerifier(), notifier, hub, upgradeWebSocket, schedulerVerifier: new DevSchedulerVerifier(), chatRetentionDays: 1, otaScriptToken: "t" });
  appA = make(hubA);
  a = Bun.serve({ port: 0, fetch: appA.fetch, websocket });
  b = Bun.serve({ port: 0, fetch: make(hubB).fetch, websocket });
});

afterAll(async () => {
  await hubA.stop();
  await hubB.stop();
  a.stop(true);
  b.stop(true);
  await close();
});

describe("socket auth", () => {
  test("a bad token is rejected and the socket closed", async () => {
    const c = await Client.open(urlA());
    c.send({ t: "auth", token: "garbage" });
    expect((await c.next("error")).code).toBe("unauthorized");
    expect(await c.closed).toBe(4401);
  });

  test("nothing works before auth", async () => {
    const c = await Client.open(urlA());
    c.send({ t: "send", room: "x", body: "hi" });
    expect((await c.next("error")).code).toBe("unauthorized");
    c.close();
  });

  test("malformed frames get an error, not a crash", async () => {
    const c = await connect(urlA(), "ann");
    c.send({ t: "nonsense" });
    expect((await c.next("error")).code).toBe("bad_frame");
    c.close();
  });
});

describe("rooms and messages", () => {
  test("a message sent on instance A reaches a member connected to instance B, with ack, history, unread and read receipts", async () => {
    const bob = await connect(urlB(), "bob"); // connected BEFORE the room exists
    const ann = await connect(urlA(), "ann");

    const created = await rest("POST", "/rooms", "ann", { name: "Garden", members: ["bob"] });
    expect(created.status).toBe(201);
    const { id: room } = (await created.json()) as { id: string };
    expect((await bob.next("room")).room).toBe(room); // live subscription for connected members

    ann.send({ t: "send", room, body: "  hello bob  ", cid: "c1" });
    const ack = await ann.next("ack");
    expect(ack.cid).toBe("c1");
    const got = await bob.next("message");
    expect(got.message).toMatchObject({ room, from: "ann", body: "hello bob", id: ack.id });
    // the sender also receives the broadcast (single delivery path)
    expect((await ann.next("message")).message).toMatchObject({ id: ack.id });

    const rooms = (await (await rest("GET", "/rooms", "bob")).json()) as { rooms: { id: string; unread: number; last: { body: string } | null }[] };
    expect(rooms.rooms).toHaveLength(1);
    expect(rooms.rooms[0]).toMatchObject({ id: room, unread: 1, last: { body: "hello bob" } });
    expect(((await (await rest("GET", "/rooms", "ann")).json()) as { rooms: { unread: number }[] }).rooms[0].unread).toBe(0); // own messages are not unread

    bob.send({ t: "read", room, upTo: ack.id });
    expect(await ann.next("read")).toMatchObject({ room, uid: "bob", upTo: ack.id });
    expect(((await (await rest("GET", "/rooms", "bob")).json()) as { rooms: { unread: number }[] }).rooms[0].unread).toBe(0);

    const hist = (await (await rest("GET", `/rooms/${room}/messages`, "bob")).json()) as { messages: { body: string }[]; nextBefore: number | null };
    expect(hist.messages.map((m) => m.body)).toEqual(["hello bob"]);
    expect(hist.nextBefore).toBeNull();
    ann.close();
    bob.close();
  });

  test("history is paged newest-first with a cursor", async () => {
    const { id: room } = (await (await rest("POST", "/rooms", "ann", { name: "Pages", members: [] })).json()) as { id: string };
    for (let i = 1; i <= 5; i++) expect((await rest("POST", `/rooms/${room}/messages`, "ann", { body: `m${i}` })).status).toBe(201);
    const p1 = (await (await rest("GET", `/rooms/${room}/messages?limit=2`, "ann")).json()) as { messages: { body: string }[]; nextBefore: number };
    expect(p1.messages.map((m) => m.body)).toEqual(["m5", "m4"]);
    const p2 = (await (await rest("GET", `/rooms/${room}/messages?limit=2&before=${p1.nextBefore}`, "ann")).json()) as { messages: { body: string }[]; nextBefore: number };
    expect(p2.messages.map((m) => m.body)).toEqual(["m3", "m2"]);
  });

  test("non-members cannot read, post, mark read or listen", async () => {
    const { id: room } = (await (await rest("POST", "/rooms", "ann", { name: "Private", members: [] })).json()) as { id: string };
    expect((await rest("GET", `/rooms/${room}/messages`, "eve")).status).toBe(403);
    expect((await rest("POST", `/rooms/${room}/messages`, "eve", { body: "hi" })).status).toBe(403);
    expect((await rest("POST", `/rooms/${room}/read`, "eve", { upTo: 1 })).status).toBe(403);
    const eve = await connect(urlA(), "eve");
    eve.send({ t: "send", room, body: "let me in", cid: "x" });
    expect((await eve.next("error")).code).toBe("forbidden_or_invalid");
    const ann = await connect(urlA(), "ann");
    ann.send({ t: "send", room, body: "secret" });
    await ann.next("ack");
    await new Promise((r) => setTimeout(r, 50));
    expect(eve.frames.filter((f) => f.t === "message")).toHaveLength(0);
    eve.close();
    ann.close();
  });

  test("input limits: empty and oversized bodies are refused", async () => {
    const { id: room } = (await (await rest("POST", "/rooms", "ann", { name: "Limits", members: [] })).json()) as { id: string };
    expect((await rest("POST", `/rooms/${room}/messages`, "ann", { body: "   " })).status).toBe(403);
    expect((await rest("POST", `/rooms/${room}/messages`, "ann", { body: "x".repeat(4001) })).status).toBe(403);
    expect((await rest("POST", "/rooms", "ann", { name: "", members: [] })).status).toBe(400);
    expect((await rest("POST", "/rooms", "ann", { name: "ok", members: ["../x"] })).status).toBe(400);
  });
});

describe("push and limits", () => {
  test("offline members get a OneSignal push; online ones do not", async () => {
    const { id: room } = (await (await rest("POST", "/rooms", "ann", { name: "Crew", members: ["dan", "eli"] })).json()) as { id: string };
    const eli = await connect(urlA(), "eli");
    const before = notifier.outbox.length;
    expect((await rest("POST", `/rooms/${room}/messages`, "ann", { body: "dinner at 7" })).status).toBe(201);
    await new Promise((r) => setTimeout(r, 100));
    const sent = notifier.outbox.slice(before);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ title: "Crew", body: "dinner at 7", data: { room } });
    expect(sent[0].uids).toEqual(["dan"]);
    eli.close();
  });

  test("a socket that floods gets rate_limited", async () => {
    const { id: room } = (await (await rest("POST", "/rooms", "flo", { name: "Flood", members: [] })).json()) as { id: string };
    const flo = await connect(urlA(), "flo");
    for (let i = 0; i < 25; i++) flo.send({ t: "send", room, body: `m${i}`, cid: String(i) });
    await new Promise((r) => setTimeout(r, 300));
    expect(flo.frames.filter((f) => f.t === "error" && f.code === "rate_limited").length).toBeGreaterThan(0);
    flo.close();
  });

  test("ping gets pong", async () => {
    const c = await connect(urlA(), "ann");
    c.send({ t: "ping" });
    await c.next("pong");
    c.close();
  });
});

describe("retention", () => {
  test("purgeOlderThan(0) keeps everything", async () => expect(await hubA.purgeOlderThan(0)).toBe(0));
});
