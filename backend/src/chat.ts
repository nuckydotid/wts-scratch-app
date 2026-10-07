/**
 * Realtime chat inside the API monolith: Hono WebSocket (`/ws/chat`) + REST, all state in Postgres.
 *
 * Delivery path (one for every message, on every instance): insert → `bus.publish` → every instance's
 * `onEvent` loads the row and fans it out to its local sockets. With Cloud SQL the bus is `LISTEN/NOTIFY`
 * (payload = ids only, so the 8 KB limit never matters); in dev/tests it is in-process.
 * NOTIFY is not durable: a socket that misses an event catches up with `GET /rooms/:id/messages`.
 */
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { UpgradeWebSocket, WSContext } from "hono/ws";
import { z } from "zod";
import { requireUser } from "./auth.ts";
import type { AuthVars, TokenVerifier } from "./auth.ts";
import type { Db } from "./db/index.ts";
import { schema } from "./db/index.ts";
import { logError } from "./log.ts";
import { unref } from "./util.ts";
import type { Notifier } from "./push.ts";

const { chatRoom, chatMember, chatMessage } = schema;

export const CHAT_LIMITS = {
  body: 4000,
  roomName: 80,
  members: 100,
  frame: 16 * 1024,
  page: 100,
  authTimeoutMs: 10_000,
  idleMs: 90_000,
  burst: 10,
  perSecond: 5,
} as const;

const UID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export interface ChatMessageDto {
  id: number;
  room: string;
  from: string;
  body: string;
  at: string;
}

export type ChatEvent =
  | { k: "message"; room: string; id: number }
  | { k: "read"; room: string; uid: string; upTo: number }
  | { k: "room"; room: string };

/* ───────────── bus ───────────── */

export interface ChatBus {
  publish(e: ChatEvent): Promise<void>;
  subscribe(fn: (e: ChatEvent) => void): () => void;
  close(): Promise<void>;
}

export class LocalBus implements ChatBus {
  private fns = new Set<(e: ChatEvent) => void>();
  async publish(e: ChatEvent) {
    for (const f of [...this.fns]) f(e);
  }
  subscribe(fn: (e: ChatEvent) => void) {
    this.fns.add(fn);
    return () => this.fns.delete(fn);
  }
  async close() {
    this.fns.clear();
  }
}

/** The slice of `pg.Client` the bus uses (so tests can substitute a fake). */
export interface ListenClient {
  on(event: "notification", fn: (n: { channel: string; payload?: string }) => void): unknown;
  on(event: "error" | "end", fn: () => void): unknown;
  removeAllListeners(): unknown;
  connect(): Promise<unknown>;
  query(sql: string): Promise<unknown>;
  end(): Promise<unknown>;
}

export interface PgBusOptions {
  channel?: string;
  /** Defaults to a real `pg.Client` for the connection string. */
  clientFactory?: () => ListenClient | Promise<ListenClient>;
  /** First reconnect delay; doubles up to 30 s. */
  retryBaseMs?: number;
}

/** Postgres LISTEN/NOTIFY across Cloud Run instances. Publishing goes through the pool; listening has its own connection. */
export class PgBus implements ChatBus {
  private fns = new Set<(e: ChatEvent) => void>();
  private client?: ListenClient;
  private closed = false;
  private retry = 0;
  private channel: string;
  private retryBaseMs: number;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private connectionString: string,
    private db: Db,
    private opts: PgBusOptions = {},
  ) {
    this.channel = opts.channel ?? "chat";
    this.retryBaseMs = opts.retryBaseMs ?? 500;
    if (!/^[a-z_][a-z0-9_]*$/.test(this.channel)) throw new Error("unsafe LISTEN channel name");
  }

  private async newClient(): Promise<ListenClient> {
    if (this.opts.clientFactory) return this.opts.clientFactory();
    const { default: pg } = await import("pg");
    return new pg.Client({ connectionString: this.connectionString }) as unknown as ListenClient;
  }

  async start(): Promise<void> {
    await this.connect();
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    const delay = Math.min(30_000, this.retryBaseMs * 2 ** this.retry++);
    this.timer = setTimeout(() => void this.connect().catch(() => this.scheduleReconnect()), delay);
    unref(this.timer);
  }

  private async connect(): Promise<void> {
    if (this.closed) return;
    const client = await this.newClient();
    client.on("notification", (n) => {
      if (n.channel !== this.channel || !n.payload) return;
      try {
        const e = JSON.parse(n.payload) as ChatEvent;
        for (const f of [...this.fns]) f(e);
      } catch {
        /* ignore malformed payloads */
      }
    });
    // Any failure of the dedicated connection: discard it and come back with backoff (events missed in between are
    // caught up from the tables by the clients).
    let dropped = false;
    const discard = () => {
      dropped = true;
      client.removeAllListeners();
      client.end().catch(() => {});
    };
    const drop = () => {
      if (dropped || this.closed) return;
      discard();
      this.scheduleReconnect();
    };
    client.on("error", drop);
    client.on("end", drop);
    try {
      await client.connect();
      await client.query(`LISTEN ${this.channel}`);
    } catch (e) {
      discard();
      throw e; // start() reports it; a reconnect attempt schedules the next one
    }
    this.retry = 0;
    this.client = client;
  }

  async publish(e: ChatEvent) {
    await this.db.execute(sql`select pg_notify(${this.channel}, ${JSON.stringify(e)})`);
  }
  subscribe(fn: (e: ChatEvent) => void) {
    this.fns.add(fn);
    return () => this.fns.delete(fn);
  }
  async close() {
    this.closed = true;
    if (this.timer) clearTimeout(this.timer);
    this.fns.clear();
    await this.client?.end().catch(() => {});
  }
}

/* ───────────── hub ───────────── */

interface Conn {
  uid: string;
  ws: WSContext;
  rooms: Set<string>;
  lastSeen: number;
  tokens: number;
  refilledAt: number;
}

const toDto = (m: typeof chatMessage.$inferSelect): ChatMessageDto => ({
  id: m.id,
  room: m.roomId,
  from: m.senderUid,
  body: m.body,
  at: m.createdAt.toISOString(),
});

export class ChatHub {
  private conns = new Set<Conn>();
  private byRoom = new Map<string, Set<Conn>>();
  private unsub?: () => void;
  private sweep?: ReturnType<typeof setInterval>;

  constructor(
    readonly db: Db,
    private bus: ChatBus,
    private notifier: Notifier,
  ) {}

  start(): void {
    this.unsub = this.bus.subscribe((e) => void this.onEvent(e).catch((err) => logError(err, { where: "chat.onEvent" })));
    this.sweep = setInterval(() => {
      const cutoff = Date.now() - CHAT_LIMITS.idleMs;
      for (const c of [...this.conns]) if (c.lastSeen < cutoff) c.ws.close(4408, "idle");
    }, 30_000);
    unref(this.sweep);
  }

  async stop(): Promise<void> {
    this.unsub?.();
    if (this.sweep) clearInterval(this.sweep);
    for (const c of [...this.conns]) c.ws.close(1001, "shutdown");
    this.conns.clear();
    this.byRoom.clear();
    await this.bus.close();
  }

  isOnline(uid: string): boolean {
    for (const c of this.conns) if (c.uid === uid) return true;
    return false;
  }

  get connectionCount(): number {
    return this.conns.size;
  }

  async roomsOf(uid: string): Promise<string[]> {
    const rows = await this.db.select({ id: chatMember.roomId }).from(chatMember).where(eq(chatMember.uid, uid));
    return rows.map((r) => r.id);
  }

  async attach(uid: string, ws: WSContext): Promise<Conn> {
    const conn: Conn = { uid, ws, rooms: new Set(), lastSeen: Date.now(), tokens: CHAT_LIMITS.burst, refilledAt: Date.now() };
    this.conns.add(conn);
    for (const room of await this.roomsOf(uid)) this.subscribe(conn, room);
    return conn;
  }

  detach(conn: Conn): void {
    this.conns.delete(conn);
    for (const room of conn.rooms) {
      const set = this.byRoom.get(room);
      set?.delete(conn);
      if (set?.size === 0) this.byRoom.delete(room);
    }
  }

  private subscribe(conn: Conn, room: string): void {
    conn.rooms.add(room);
    const set = this.byRoom.get(room) ?? new Set();
    set.add(conn);
    this.byRoom.set(room, set);
  }

  /** Token bucket per socket; false = over the limit. */
  allow(conn: Conn): boolean {
    const now = Date.now();
    conn.tokens = Math.min(CHAT_LIMITS.burst, conn.tokens + ((now - conn.refilledAt) / 1000) * CHAT_LIMITS.perSecond);
    conn.refilledAt = now;
    if (conn.tokens < 1) return false;
    conn.tokens -= 1;
    return true;
  }

  async isMember(uid: string, room: string): Promise<boolean> {
    const rows = await this.db
      .select({ uid: chatMember.uid })
      .from(chatMember)
      .where(and(eq(chatMember.roomId, room), eq(chatMember.uid, uid)))
      .limit(1);
    return rows.length > 0;
  }

  private async onEvent(e: ChatEvent): Promise<void> {
    if (e.k === "message") {
      const local = this.byRoom.get(e.room);
      if (!local?.size) return;
      const [row] = await this.db.select().from(chatMessage).where(eq(chatMessage.id, e.id)).limit(1);
      if (!row) return;
      const frame = JSON.stringify({ t: "message", message: toDto(row) });
      for (const c of local) c.ws.send(frame);
    } else if (e.k === "read") {
      const frame = JSON.stringify({ t: "read", room: e.room, uid: e.uid, upTo: e.upTo });
      for (const c of this.byRoom.get(e.room) ?? []) c.ws.send(frame);
    } else {
      const members = new Set((await this.db.select({ uid: chatMember.uid }).from(chatMember).where(eq(chatMember.roomId, e.room))).map((m) => m.uid));
      for (const c of this.conns) {
        if (members.has(c.uid) && !c.rooms.has(e.room)) {
          this.subscribe(c, e.room);
          c.ws.send(JSON.stringify({ t: "room", room: e.room }));
        }
      }
    }
  }

  /** Persist + publish. Returns null when `uid` is not a member of an open room. */
  async send(uid: string, room: string, body: string): Promise<ChatMessageDto | null> {
    const text = body.trim();
    if (!text || text.length > CHAT_LIMITS.body) return null;
    const [r] = await this.db
      .select({ closed: chatRoom.closed, name: chatRoom.name })
      .from(chatRoom)
      .innerJoin(chatMember, and(eq(chatMember.roomId, chatRoom.id), eq(chatMember.uid, uid)))
      .where(eq(chatRoom.id, room))
      .limit(1);
    if (!r || r.closed) return null;
    const [row] = await this.db.insert(chatMessage).values({ roomId: room, senderUid: uid, body: text }).returning();
    await this.bus.publish({ k: "message", room, id: row.id });
    void this.pushOffline(uid, room, r.name, text).catch((err) => logError(err, { where: "chat.push" }));
    return toDto(row);
  }

  /** Members that have no socket on this instance get a OneSignal push (best effort; same user on another instance may get both). */
  private async pushOffline(sender: string, room: string, roomName: string, text: string): Promise<void> {
    const members = await this.db.select({ uid: chatMember.uid }).from(chatMember).where(and(eq(chatMember.roomId, room), ne(chatMember.uid, sender)));
    const offline = members.map((m) => m.uid).filter((u) => !this.isOnline(u));
    if (offline.length) await this.notifier.send(offline, roomName, text.slice(0, 120), { room });
  }

  async markRead(uid: string, room: string, upTo: number): Promise<boolean> {
    const res = await this.db
      .update(chatMember)
      .set({ lastReadId: sql`greatest(${chatMember.lastReadId}, ${upTo})` })
      .where(and(eq(chatMember.roomId, room), eq(chatMember.uid, uid)))
      .returning({ id: chatMember.roomId });
    if (!res.length) return false;
    await this.bus.publish({ k: "read", room, uid, upTo });
    return true;
  }

  async createRoom(creator: string, name: string, members: string[]): Promise<string> {
    const id = crypto.randomUUID();
    const uids = [...new Set([creator, ...members])];
    await this.db.insert(chatRoom).values({ id, name, createdBy: creator });
    await this.db.insert(chatMember).values(uids.map((uid) => ({ roomId: id, uid })));
    await this.bus.publish({ k: "room", room: id });
    return id;
  }

  /** Delete messages older than `days` (cron). Returns the number removed. */
  async purgeOlderThan(days: number): Promise<number> {
    if (days <= 0) return 0;
    const cutoff = new Date(Date.now() - days * 86_400_000);
    const res = await this.db.delete(chatMessage).where(lt(chatMessage.createdAt, cutoff)).returning({ id: chatMessage.id });
    return res.length;
  }
}

/* ───────────── routes ───────────── */

const clientMsg = z.discriminatedUnion("t", [
  z.object({ t: z.literal("auth"), token: z.string().min(1).max(4096) }),
  z.object({ t: z.literal("send"), room: z.string().min(1).max(64), body: z.string().max(CHAT_LIMITS.body * 4), cid: z.string().max(64).optional() }),
  z.object({ t: z.literal("read"), room: z.string().min(1).max(64), upTo: z.number().int().nonnegative() }),
  z.object({ t: z.literal("ping") }),
]);

export function chatRoutes(deps: { hub: ChatHub; verifier: TokenVerifier; upgradeWebSocket: UpgradeWebSocket }) {
  const { hub, verifier, upgradeWebSocket } = deps;
  const db = hub.db;

  const rest = new Hono<{ Variables: AuthVars }>()
    .use(requireUser(verifier))
    .get("/rooms", async (c) => {
      const uid = c.get("uid");
      const rooms = await db
        .select({ id: chatRoom.id, name: chatRoom.name, closed: chatRoom.closed, lastReadId: chatMember.lastReadId })
        .from(chatMember)
        .innerJoin(chatRoom, eq(chatRoom.id, chatMember.roomId))
        .where(eq(chatMember.uid, uid));
      const ids = rooms.map((r) => r.id);
      if (!ids.length) return c.json({ rooms: [] });
      const lastRows = await db
        .select()
        .from(chatMessage)
        .where(inArray(chatMessage.id, db.select({ id: sql<number>`max(${chatMessage.id})` }).from(chatMessage).where(inArray(chatMessage.roomId, ids)).groupBy(chatMessage.roomId)));
      const unreadRows = await db
        .select({ roomId: chatMessage.roomId, n: sql<number>`count(*)::int` })
        .from(chatMessage)
        .innerJoin(chatMember, and(eq(chatMember.roomId, chatMessage.roomId), eq(chatMember.uid, uid)))
        .where(and(inArray(chatMessage.roomId, ids), gt(chatMessage.id, chatMember.lastReadId), ne(chatMessage.senderUid, uid)))
        .groupBy(chatMessage.roomId);
      const last = new Map(lastRows.map((m) => [m.roomId, toDto(m)]));
      const unread = new Map(unreadRows.map((u) => [u.roomId, Number(u.n)]));
      return c.json({
        rooms: rooms
          .map((r) => ({ id: r.id, name: r.name, closed: r.closed, unread: unread.get(r.id) ?? 0, last: last.get(r.id) ?? null }))
          .sort((a, b) => (b.last?.id ?? 0) - (a.last?.id ?? 0)),
      });
    })
    .post(
      "/rooms",
      zValidator(
        "json",
        z.object({
          name: z.string().trim().min(1).max(CHAT_LIMITS.roomName),
          members: z.array(z.string().regex(UID_RE)).max(CHAT_LIMITS.members).default([]),
        }),
      ),
      async (c) => {
        const { name, members } = c.req.valid("json");
        return c.json({ id: await hub.createRoom(c.get("uid"), name, members) }, 201);
      },
    )
    .get(
      "/rooms/:id/messages",
      zValidator("query", z.object({ before: z.string().regex(/^\d{1,15}$/).optional(), limit: z.string().regex(/^\d{1,3}$/).optional() })),
      async (c) => {
        const room = c.req.param("id");
        if (!(await hub.isMember(c.get("uid"), room))) return c.json({ error: "forbidden" }, 403);
        const { before: b, limit: l } = c.req.valid("query");
        const before = Number(b ?? 0);
        const limit = Math.min(CHAT_LIMITS.page, Math.max(1, Number(l ?? 50) || 50));
        const rows = await db
          .select()
          .from(chatMessage)
          .where(and(eq(chatMessage.roomId, room), before > 0 ? lt(chatMessage.id, before) : undefined))
          .orderBy(desc(chatMessage.id))
          .limit(limit);
        return c.json({ messages: rows.map(toDto), nextBefore: rows.length === limit ? rows[rows.length - 1].id : null });
      },
    )
    .post("/rooms/:id/messages", zValidator("json", z.object({ body: z.string().min(1).max(CHAT_LIMITS.body * 4) })), async (c) => {
      const m = await hub.send(c.get("uid"), c.req.param("id"), c.req.valid("json").body);
      return m ? c.json({ message: m }, 201) : c.json({ error: "forbidden_or_invalid" }, 403);
    })
    .post("/rooms/:id/read", zValidator("json", z.object({ upTo: z.number().int().nonnegative() })), async (c) => {
      return (await hub.markRead(c.get("uid"), c.req.param("id"), c.req.valid("json").upTo)) ? c.json({ ok: true }) : c.json({ error: "forbidden" }, 403);
    });

  /** The token travels in the first frame (not the URL), so it never lands in access logs. */
  const ws = new Hono().get(
    "/",
    upgradeWebSocket(() => {
      let conn: Conn | null = null;
      let closed = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const fail = (w: WSContext, code: string) => {
        w.send(JSON.stringify({ t: "error", code }));
      };
      return {
        onOpen(_e, w) {
          timer = setTimeout(() => w.close(4401, "auth timeout"), CHAT_LIMITS.authTimeoutMs);
          unref(timer);
        },
        async onMessage(e, w) {
          const raw = typeof e.data === "string" ? e.data : "";
          if (!raw || raw.length > CHAT_LIMITS.frame) return fail(w, "bad_frame");
          let parsed: z.infer<typeof clientMsg>;
          try {
            parsed = clientMsg.parse(JSON.parse(raw));
          } catch {
            return fail(w, "bad_frame");
          }
          if (conn) conn.lastSeen = Date.now();
          if (parsed.t === "auth") {
            if (conn) return;
            try {
              const u = await verifier.verify(parsed.token);
              if (closed) return;
              clearTimeout(timer);
              conn = await hub.attach(u.uid, w);
              w.send(JSON.stringify({ t: "ready", uid: u.uid, rooms: [...conn.rooms] }));
            } catch {
              w.send(JSON.stringify({ t: "error", code: "unauthorized" }));
              w.close(4401, "unauthorized");
            }
            return;
          }
          if (!conn) return fail(w, "unauthorized");
          if (parsed.t === "ping") return w.send(JSON.stringify({ t: "pong" }));
          if (!hub.allow(conn)) return fail(w, "rate_limited");
          if (parsed.t === "send") {
            const m = await hub.send(conn.uid, parsed.room, parsed.body);
            w.send(JSON.stringify(m ? { t: "ack", cid: parsed.cid, id: m.id } : { t: "error", code: "forbidden_or_invalid", cid: parsed.cid }));
          } else if (!(await hub.markRead(conn.uid, parsed.room, parsed.upTo))) {
            fail(w, "forbidden");
          }
        },
        onClose() {
          closed = true;
          clearTimeout(timer);
          if (conn) hub.detach(conn);
        },
        onError() {
          closed = true;
          clearTimeout(timer);
          if (conn) hub.detach(conn);
        },
      };
    }),
  );

  return { rest, ws };
}
