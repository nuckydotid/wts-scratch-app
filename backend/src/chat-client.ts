/**
 * Framework-agnostic WebSocket client for `/ws/chat` (works in React Native, browsers and Bun).
 * Reconnects with backoff, sends the Firebase token in the first frame, matches acks to `send()` promises.
 * The app wraps it with `useSyncExternalStore` (`subscribe`/`getSnapshot`) and a frame listener (`onFrame`).
 */
import type { ChatMessageDto } from "./chat.ts";

export type ChatStatus = "idle" | "connecting" | "online" | "reconnecting" | "closed";

export type ChatFrame =
  | { t: "ready"; uid: string; rooms: string[] }
  | { t: "message"; message: ChatMessageDto }
  | { t: "read"; room: string; uid: string; upTo: number }
  | { t: "room"; room: string }
  | { t: "ack"; cid?: string; id: number }
  | { t: "error"; code: string; cid?: string }
  | { t: "pong" };

export interface ChatClientOptions {
  /** `wss://host/ws/chat` */
  url: string;
  /** Called on every (re)connect so expired Firebase tokens are refreshed. */
  getToken: () => string | null | Promise<string | null>;
  WebSocketImpl?: typeof WebSocket;
  reconnect?: boolean;
  pingMs?: number;
  sendTimeoutMs?: number;
}

export interface ChatSnapshot {
  status: ChatStatus;
  uid: string | null;
  error: string | null;
}

interface Pending {
  resolve: (r: { id: number }) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class ChatClient {
  private snap: ChatSnapshot = { status: "idle", uid: null, error: null };
  private listeners = new Set<() => void>();
  private frameListeners = new Set<(f: ChatFrame) => void>();
  private ws: WebSocket | null = null;
  private wantOpen = false;
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private pending = new Map<string, Pending>();
  private seq = 0;

  constructor(private opts: ChatClientOptions) {}

  getSnapshot = (): ChatSnapshot => this.snap;
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  onFrame(fn: (f: ChatFrame) => void): () => void {
    this.frameListeners.add(fn);
    return () => this.frameListeners.delete(fn);
  }

  private set(patch: Partial<ChatSnapshot>) {
    this.snap = { ...this.snap, ...patch };
    for (const l of [...this.listeners]) l();
  }

  connect(): void {
    if (this.wantOpen) return;
    this.wantOpen = true;
    void this.open();
  }

  close(): void {
    this.wantOpen = false;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.stopPing();
    this.failPending("closed");
    this.ws?.close(1000, "bye");
    this.ws = null;
    this.set({ status: "closed", uid: null });
  }

  /** Resolves with the stored message id once the server has persisted it. */
  send(room: string, body: string): Promise<{ id: number }> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.snap.status !== "online") return reject(new Error("offline"));
      const cid = `${Date.now().toString(36)}-${++this.seq}`;
      const timer = setTimeout(() => {
        this.pending.delete(cid);
        reject(new Error("timeout"));
      }, this.opts.sendTimeoutMs ?? 10_000);
      this.pending.set(cid, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ t: "send", room, body, cid }));
    });
  }

  markRead(room: string, upTo: number): void {
    if (this.ws && this.snap.status === "online") this.ws.send(JSON.stringify({ t: "read", room, upTo }));
  }

  private async open() {
    const WS = this.opts.WebSocketImpl ?? globalThis.WebSocket;
    this.set({ status: this.retry > 0 ? "reconnecting" : "connecting", error: null });
    let token: string | null;
    try {
      token = await this.opts.getToken();
    } catch (e) {
      return this.fatal(e instanceof Error ? e.message : "Could not get a sign-in token.");
    }
    if (!this.wantOpen) return;
    if (!token) return this.fatal("Not signed in.");
    const ws = new WS(this.opts.url);
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ t: "auth", token }));
    ws.onmessage = (e) => {
      let f: ChatFrame;
      try {
        f = JSON.parse(String(e.data)) as ChatFrame;
      } catch {
        return;
      }
      this.handle(f);
    };
    ws.onclose = (e) => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.stopPing();
      this.failPending("disconnected");
      if (!this.wantOpen) return;
      if (e.code === 4401 && this.retry >= 2) return this.fatal("Sign-in expired. Please sign in again.");
      this.schedule();
    };
    ws.onerror = () => {
      /* onclose follows */
    };
  }

  private handle(f: ChatFrame) {
    if (f.t === "ready") {
      this.retry = 0;
      this.set({ status: "online", uid: f.uid, error: null });
      const every = this.opts.pingMs ?? 25_000;
      this.pingTimer = setInterval(() => this.ws?.send(JSON.stringify({ t: "ping" })), every);
    } else if (f.t === "ack" && f.cid) {
      const p = this.pending.get(f.cid);
      if (p) {
        clearTimeout(p.timer);
        this.pending.delete(f.cid);
        p.resolve({ id: f.id });
      }
    } else if (f.t === "error" && f.cid) {
      const p = this.pending.get(f.cid);
      if (p) {
        clearTimeout(p.timer);
        this.pending.delete(f.cid);
        p.reject(new Error(f.code));
      }
    }
    for (const l of [...this.frameListeners]) l(f);
  }

  private schedule() {
    if (this.opts.reconnect === false) return this.set({ status: "closed" });
    const delay = Math.min(15_000, 500 * 2 ** this.retry++) * (0.75 + Math.random() * 0.5);
    this.set({ status: "reconnecting" });
    this.retryTimer = setTimeout(() => void this.open(), delay);
  }

  private fatal(message: string) {
    this.wantOpen = false;
    this.set({ status: "closed", error: message });
  }

  private stopPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  private failPending(reason: string) {
    for (const [, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(new Error(reason));
    }
    this.pending.clear();
  }
}
