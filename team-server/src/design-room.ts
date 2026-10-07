import { randomBytes } from 'node:crypto';
import { DESIGN_COLORS, DESIGN_LIMITS } from './shared/design/protocol.ts';
import type {
  DesignChatMsg, DesignClientMsg, DesignLook, DesignPeer, DesignPin, DesignPrEvent, DesignServerMsg, DesignVersion,
} from './shared/design/protocol.ts';
import type { ProjectRole } from './roles.ts';
import { log } from './log.ts';
import { TokenBucket } from './ratelimit.ts';
import type { DesignDoc, Store } from './store.ts';

export interface DesignClientConn {
  id: string;
  uid: string;
  role: ProjectRole;
  send(msg: DesignServerMsg): void;
  buckets: { cursor: TokenBucket; view: TokenBucket; chat: TokenBucket; pin: TokenBucket; misc: TokenBucket };
}

const CURSOR_TICK_MS = 50;
const SAVE_DEBOUNCE_MS = 1000;

/** Roles that may edit or delete other people's pins. */
const MODERATORS: ProjectRole[] = ['founder', 'pm', 'designer'];

/**
 * One room for the project: who is here, where their pointers are, who follows whom, the chat and the pinned
 * comments. State lives in memory (single Cloud Run instance) with pins and chat persisted through the store.
 */
export class DesignRoom {
  readonly peers = new Map<string, DesignPeer>();
  private clients = new Map<string, DesignClientConn>();
  private pins: DesignPin[];
  private chat: DesignChatMsg[];
  private live: DesignVersion | null;
  private previews: DesignVersion[];
  private prs: DesignPrEvent[];
  private pendingCursors = new Map<string, [string, number, number]>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private dirty = false;

  constructor(
    readonly projectId: string,
    doc: DesignDoc | null,
    private store: Store,
    private now: () => number = Date.now,
  ) {
    this.pins = doc?.pins ?? [];
    this.chat = doc?.chat ?? [];
    this.live = doc?.live ?? null;
    this.previews = doc?.previews ?? [];
    this.prs = doc?.prs ?? [];
  }

  get size() {
    return this.clients.size;
  }

  newConnectionId(uid: string): string {
    return `${uid}~${randomBytes(3).toString('hex')}`;
  }

  /** Lowest colour not used by someone in the room (so two people rarely share one). */
  private pickColor(uid: string): string {
    const used = new Set([...this.peers.values()].map((p) => p.color));
    // The same person keeps their colour across tabs.
    const mine = [...this.peers.values()].find((p) => p.uid === uid);
    if (mine) return mine.color;
    return DESIGN_COLORS.find((c) => !used.has(c)) ?? DESIGN_COLORS[this.peers.size % DESIGN_COLORS.length];
  }

  join(c: DesignClientConn, info: { name: string; look?: DesignLook }) {
    const peer: DesignPeer = { id: c.id, uid: c.uid, name: info.name || 'Guest', color: this.pickColor(c.uid), look: info.look, story: null, view: null, following: null };
    this.clients.set(c.id, c);
    this.peers.set(c.id, peer);
    c.send({ t: 'welcome', you: c.id, color: peer.color, role: c.role, peers: [...this.peers.values()].filter((p) => p.id !== c.id), pins: this.pins, history: this.chat.slice(-DESIGN_LIMITS.history), live: this.live, previews: this.previews, prs: this.prs });
    this.broadcast({ t: 'join', peer }, c.id);
    this.timer ??= setInterval(() => this.flushCursors(), CURSOR_TICK_MS);
    log.info('design join', { project: this.projectId, uid: c.uid, peers: this.peers.size });
  }

  leave(c: DesignClientConn) {
    if (!this.clients.delete(c.id)) return;
    this.peers.delete(c.id);
    this.pendingCursors.delete(c.id);
    this.broadcast({ t: 'leave', id: c.id });
    // Nobody keeps following someone who left.
    for (const p of this.peers.values()) {
      if (p.following === c.id) {
        p.following = null;
        this.broadcast({ t: 'peer', id: p.id, patch: { following: null } });
      }
    }
    if (this.clients.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handle(c: DesignClientConn, msg: DesignClientMsg) {
    const me = this.peers.get(c.id);
    if (!me) return;
    const limited = (b: keyof DesignClientConn['buckets']) => {
      if (c.buckets[b].take()) return false;
      c.send({ t: 'error', code: 'rate_limited', message: 'Slow down.' });
      return true;
    };
    switch (msg.t) {
      case 'cursor':
        if (!c.buckets.cursor.take()) return; // pointer samples are disposable; drop silently
        this.pendingCursors.set(c.id, [msg.story, msg.x, msg.y]);
        if (me.story !== msg.story) {
          me.story = msg.story;
          this.broadcast({ t: 'peer', id: c.id, patch: { story: msg.story } }, c.id);
        }
        return;
      case 'view':
        if (!c.buckets.view.take()) return;
        me.view = msg.view;
        me.story = msg.view.story;
        this.broadcast({ t: 'peer', id: c.id, patch: { view: msg.view, story: msg.view.story } }, c.id);
        return;
      case 'follow': {
        if (limited('misc')) return;
        if (msg.target !== null && (msg.target === c.id || !this.peers.has(msg.target))) {
          c.send({ t: 'error', code: 'bad_target', message: 'That person is not here.' });
          return;
        }
        me.following = msg.target;
        this.broadcast({ t: 'peer', id: c.id, patch: { following: msg.target } }, c.id);
        return;
      }
      case 'chat': {
        if (limited('chat')) return;
        const m: DesignChatMsg = { id: `m-${this.now().toString(36)}-${randomBytes(3).toString('hex')}`, from: c.id, fromName: me.name, color: me.color, text: msg.text, story: msg.story, at: this.now() };
        this.chat.push(m);
        if (this.chat.length > DESIGN_LIMITS.history * 2) this.chat.splice(0, this.chat.length - DESIGN_LIMITS.history * 2);
        this.broadcast({ t: 'chat', msg: m });
        this.touch();
        return;
      }
      case 'pin.add': {
        if (limited('pin')) return;
        if (this.pins.length >= DESIGN_LIMITS.pins) {
          c.send({ t: 'error', code: 'too_many_pins', message: 'This project has too many open comments — resolve or delete some first.' });
          return;
        }
        const pin: DesignPin = { id: `p-${this.now().toString(36)}-${randomBytes(3).toString('hex')}`, story: msg.story, x: msg.x, y: msg.y, text: msg.text, by: { uid: c.uid, name: me.name, color: me.color }, at: this.now(), resolved: false };
        this.pins.push(pin);
        this.broadcast({ t: 'pin', op: 'add', pin });
        this.touch();
        return;
      }
      case 'pin.update': {
        if (limited('pin')) return;
        const pin = this.pins.find((p) => p.id === msg.id);
        if (!pin) return;
        // Anyone can resolve or reopen; rewording is for the author and moderators.
        if (msg.text !== undefined && pin.by.uid !== c.uid && !MODERATORS.includes(c.role)) {
          c.send({ t: 'error', code: 'forbidden', message: 'Only the author or a Founder, PM or Designer can edit this comment.' });
          return;
        }
        if (msg.text !== undefined) pin.text = msg.text;
        if (msg.resolved !== undefined) pin.resolved = msg.resolved;
        this.broadcast({ t: 'pin', op: 'update', pin });
        this.touch();
        return;
      }
      case 'pin.del': {
        if (limited('pin')) return;
        const pin = this.pins.find((p) => p.id === msg.id);
        if (!pin) return;
        if (pin.by.uid !== c.uid && !MODERATORS.includes(c.role)) {
          c.send({ t: 'error', code: 'forbidden', message: 'Only the author or a Founder, PM or Designer can delete this comment.' });
          return;
        }
        this.pins = this.pins.filter((p) => p.id !== msg.id);
        this.broadcast({ t: 'pin', op: 'del', id: msg.id });
        this.touch();
        return;
      }
      case 'ping':
        c.send({ t: 'pong', at: msg.at });
        return;
      case 'hello':
        return; // already joined
    }
  }

  /** Snapshot used to generate a coding-agent task and to persist the room. */
  snapshot(): DesignDoc {
    return { pins: this.pins.map((p) => ({ ...p })), chat: this.chat.slice(), live: this.live, previews: this.previews.slice(), prs: this.prs.slice() };
  }

  /** CI deployed the design site: tell everyone and remember it for people who join later. */
  announceVersion(v: DesignVersion) {
    if (v.kind === 'live') {
      this.live = v;
      // Previews of work that is now live are stale.
      this.previews = this.previews.filter((p) => p.sha !== v.sha);
    } else {
      this.previews = [v, ...this.previews.filter((p) => p.pr !== v.pr)].slice(0, DESIGN_LIMITS.previews);
    }
    this.broadcast({ t: 'version', version: v });
    this.touch();
  }

  /** A pull request changed state (GitHub webhook). A merged or closed PR also drops its preview. */
  announcePr(e: DesignPrEvent) {
    this.prs = [e, ...this.prs.filter((p) => p.pr !== e.pr)].slice(0, DESIGN_LIMITS.prs);
    if (e.state !== 'open') this.previews = this.previews.filter((p) => p.pr !== e.pr);
    this.broadcast({ t: 'pr', pr: e });
    this.touch();
  }

  private broadcast(m: DesignServerMsg, except?: string) {
    const raw = m;
    for (const [id, cl] of this.clients) if (id !== except) cl.send(raw);
  }

  /** Batch cursor moves: each client receives everyone else's latest position, at most every tick. */
  private flushCursors() {
    if (this.pendingCursors.size === 0) return;
    const all = [...this.pendingCursors.entries()];
    this.pendingCursors.clear();
    for (const [id, cl] of this.clients) {
      const c = all.filter(([from]) => from !== id).map(([from, [story, x, y]]) => [from, story, x, y] as [string, string, number, number]);
      if (c.length) cl.send({ t: 'cursors', c });
    }
  }

  private touch() {
    this.dirty = true;
    this.saveTimer ??= setTimeout(() => void this.flush(), SAVE_DEBOUNCE_MS);
  }

  async flush() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = null;
    if (!this.dirty) return;
    this.dirty = false;
    try {
      await this.store.saveDesign(this.projectId, this.snapshot());
    } catch (e) {
      this.dirty = true;
      log.warn('design save failed', { project: this.projectId, err: String(e) });
    }
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await this.flush();
  }
}
