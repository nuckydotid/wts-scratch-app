import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PgBus } from "../src/chat.ts";
import type { ChatEvent, ListenClient } from "../src/chat.ts";
import { connectDb } from "../src/db/index.ts";
import type { Db } from "../src/db/index.ts";

type Handler = (...a: never[]) => void;

/** A `pg.Client` stand-in that records LISTENs and lets the test push notifications or errors. */
class FakeClient implements ListenClient {
  handlers = new Map<string, Handler[]>();
  queries: string[] = [];
  ended = false;
  failConnect = false;
  on(event: string, fn: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), fn]);
    return this;
  }
  removeAllListeners() {
    this.handlers.clear();
    return this;
  }
  async connect() {
    if (this.failConnect) throw new Error("connection refused");
  }
  async query(sql: string) {
    this.queries.push(sql);
  }
  async end() {
    this.ended = true;
  }
  emit(event: string, ...args: unknown[]) {
    for (const h of this.handlers.get(event) ?? []) (h as (...a: unknown[]) => void)(...args);
  }
}

const until = async (cond: () => boolean, ms = 2000) => {
  const end = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > end) throw new Error("timeout");
    await new Promise((r) => setTimeout(r, 5));
  }
};

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  const c = await connectDb("");
  db = c.db;
  close = c.close;
});
afterAll(async () => close());

describe("PgBus", () => {
  test("LISTENs on its channel and delivers parsed events to every subscriber", async () => {
    const fake = new FakeClient();
    const bus = new PgBus("postgres://x", db, { clientFactory: () => fake });
    const got: ChatEvent[] = [];
    bus.subscribe((e) => got.push(e));
    bus.subscribe(() => {});
    await bus.start();
    expect(fake.queries).toEqual(["LISTEN chat"]);
    fake.emit("notification", { channel: "chat", payload: JSON.stringify({ k: "message", room: "r1", id: 5 }) });
    expect(got).toEqual([{ k: "message", room: "r1", id: 5 }]);
    await bus.close();
    expect(fake.ended).toBe(true);
  });

  test("ignores other channels, empty payloads and garbage", async () => {
    const fake = new FakeClient();
    const bus = new PgBus("postgres://x", db, { clientFactory: () => fake });
    const got: ChatEvent[] = [];
    bus.subscribe((e) => got.push(e));
    await bus.start();
    fake.emit("notification", { channel: "other", payload: '{"k":"room","room":"r"}' });
    fake.emit("notification", { channel: "chat" });
    fake.emit("notification", { channel: "chat", payload: "not json" });
    expect(got).toEqual([]);
    await bus.close();
  });

  test("a dropped connection is replaced and LISTEN is issued again", async () => {
    const clients: FakeClient[] = [];
    const bus = new PgBus("postgres://x", db, { retryBaseMs: 5, clientFactory: () => (clients.push(new FakeClient()), clients.at(-1)!) });
    const got: ChatEvent[] = [];
    bus.subscribe((e) => got.push(e));
    await bus.start();
    clients[0].emit("error");
    clients[0].emit("end"); // both fire in practice: only one reconnect must come out of it
    await until(() => clients.length === 2 && clients[1].queries.length === 1);
    expect(clients[0].ended).toBe(true);
    clients[1].emit("notification", { channel: "chat", payload: JSON.stringify({ k: "room", room: "r2" }) });
    expect(got).toEqual([{ k: "room", room: "r2" }]);
    await new Promise((r) => setTimeout(r, 40));
    expect(clients).toHaveLength(2);
    await bus.close();
  });

  test("a failed reconnect backs off and tries again", async () => {
    const clients: FakeClient[] = [];
    let n = 0;
    const bus = new PgBus("postgres://x", db, {
      retryBaseMs: 5,
      clientFactory: () => {
        const c = new FakeClient();
        c.failConnect = n++ === 1; // first reconnect attempt fails
        clients.push(c);
        return c;
      },
    });
    await bus.start();
    clients[0].emit("end");
    await until(() => clients.length >= 3 && clients[2].queries.length === 1, 3000);
    await bus.close();
  });

  test("close() stops reconnecting", async () => {
    const clients: FakeClient[] = [];
    const bus = new PgBus("postgres://x", db, { retryBaseMs: 5, clientFactory: () => (clients.push(new FakeClient()), clients.at(-1)!) });
    await bus.start();
    await bus.close();
    clients[0].emit("end");
    await new Promise((r) => setTimeout(r, 40));
    expect(clients).toHaveLength(1);
  });

  test("publish sends the event through pg_notify (runs on a real SQL engine)", async () => {
    const bus = new PgBus("postgres://x", db);
    await expect(bus.publish({ k: "message", room: "r1", id: 1 })).resolves.toBeUndefined();
  });

  test("the channel name is validated because it is interpolated into LISTEN", () => {
    expect(() => new PgBus("postgres://x", db, { channel: "chat; drop table x" })).toThrow();
    expect(() => new PgBus("postgres://x", db, { channel: "chat_v2" })).not.toThrow();
  });
});
