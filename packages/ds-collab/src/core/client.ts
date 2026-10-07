// Copied from Worktrees Studio (src/shared/design) by `npm run template:sync-core`. Do not edit here.
/**
 * Framework-agnostic client for the design room. It owns the socket (with reconnect), throttles what the
 * UI sends, and exposes an immutable state snapshot, so React can use it through `useSyncExternalStore`.
 */
import { DESIGN_COLORS, DESIGN_LIMITS } from './protocol.ts';
import type { DesignChatMsg, DesignClientMsg, DesignLook, DesignPeer, DesignPin, DesignPrEvent, DesignServerMsg, DesignVersion, DesignView } from './protocol.ts';

export type DesignStatus = 'idle' | 'connecting' | 'online' | 'reconnecting' | 'closed';

export interface RemoteCursor {
  story: string;
  x: number;
  y: number;
  at: number;
}

export interface DesignState {
  status: DesignStatus;
  /** Last fatal error (auth, not a member…). Reconnecting stops after one. */
  error: string | null;
  you: string | null;
  color: string;
  role: string | null;
  peers: Record<string, DesignPeer>;
  cursors: Record<string, RemoteCursor>;
  pins: DesignPin[];
  chat: DesignChatMsg[];
  /** Connection id being followed, or null. */
  following: string | null;
  /** Latest deployment of the live design site announced by CI. */
  live: DesignVersion | null;
  /** Open preview deployments (newest first). */
  previews: DesignVersion[];
  /** Recent pull request events (newest first). */
  prs: DesignPrEvent[];
}

export interface DesignClientOptions {
  /** `wss://host/design` */
  url: string;
  projectId: string;
  name: string;
  look?: DesignLook;
  /** GitHub access token of the user (device flow); a team server uses it to check repository access. */
  getGithubToken?: () => Promise<string | undefined> | string | undefined;
  /** Called on every (re)connect so expired tokens are refreshed. */
  getToken: () => string | Promise<string>;
  WebSocketImpl?: typeof WebSocket;
  /** Reconnect with backoff after an unexpected close (default true). */
  reconnect?: boolean;
  cursorIntervalMs?: number;
  viewIntervalMs?: number;
}

const FATAL = new Set(['auth_failed', 'invite_required', 'not_found', 'bad_project', 'github_required', 'github_token_invalid', 'not_a_member', 'origin_not_allowed']);

const initial = (): DesignState => ({
  status: 'idle',
  error: null,
  you: null,
  color: DESIGN_COLORS[0],
  role: null,
  peers: {},
  cursors: {},
  pins: [],
  chat: [],
  following: null,
  live: null,
  previews: [],
  prs: [],
});

export class DesignClient {
  private state: DesignState = initial();
  private listeners = new Set<() => void>();
  private ws: WebSocket | null = null;
  private wantOpen = false;
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private lastCursor = 0;
  private pendingCursor: { story: string; x: number; y: number } | null = null;
  private cursorTimer: ReturnType<typeof setTimeout> | null = null;
  private lastView = 0;
  private pendingView: DesignView | null = null;
  /** Latest view the app reported; re-sent after every (re)connect so a view set before the socket opened is not lost. */
  private currentView: DesignView | null = null;
  private viewTimer: ReturnType<typeof setTimeout> | null = null;
  private viewListeners = new Set<(v: DesignView, from: DesignPeer) => void>();

  constructor(private opts: DesignClientOptions) {}

  /* ── state ── */

  getState = (): DesignState => this.state;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private set(patch: Partial<DesignState>) {
    this.state = { ...this.state, ...patch };
    for (const l of [...this.listeners]) l();
  }

  /** Fires whenever the peer being followed changes their view (and once when you start following). */
  onFollowedView(fn: (v: DesignView, from: DesignPeer) => void): () => void {
    this.viewListeners.add(fn);
    return () => this.viewListeners.delete(fn);
  }

  /* ── connection ── */

  connect(): void {
    this.wantOpen = true;
    void this.open();
  }

  close(): void {
    this.wantOpen = false;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.cursorTimer) clearTimeout(this.cursorTimer);
    if (this.viewTimer) clearTimeout(this.viewTimer);
    this.cursorTimer = this.viewTimer = this.retryTimer = null;
    this.ws?.close(1000, 'bye');
    this.ws = null;
    this.set({ ...initial(), status: 'closed' });
  }

  private async open() {
    const WS = this.opts.WebSocketImpl ?? globalThis.WebSocket;
    this.set({ status: this.retry > 0 ? 'reconnecting' : 'connecting', error: null });
    let token: string;
    let github: string | undefined;
    try {
      token = await this.opts.getToken();
      github = await this.opts.getGithubToken?.();
    } catch (e) {
      this.set({ status: 'closed', error: e instanceof Error ? e.message : 'Could not get a sign-in token.' });
      return;
    }
    if (!this.wantOpen) return;
    const ws = new WS(this.opts.url);
    this.ws = ws;
    ws.onopen = () => {
      this.send({ t: 'hello', token, projectId: this.opts.projectId, name: this.opts.name, look: this.opts.look, github });
    };
    ws.onmessage = (e) => {
      try {
        this.handle(JSON.parse(String((e as MessageEvent).data)) as DesignServerMsg);
      } catch {
        /* ignore malformed frames */
      }
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      if (!this.wantOpen || this.state.error) return this.set({ status: 'closed' });
      if (this.opts.reconnect === false) return this.set({ status: 'closed' });
      this.retry++;
      const delay = Math.min(15_000, 500 * 2 ** Math.min(this.retry, 5)) * (0.75 + Math.random() * 0.5);
      this.set({ status: 'reconnecting', peers: {}, cursors: {}, following: null });
      this.retryTimer = setTimeout(() => void this.open(), delay);
    };
    ws.onerror = () => {
      /* onclose follows */
    };
  }

  private send(m: DesignClientMsg) {
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(m));
  }

  /* ── inbound ── */

  private handle(m: DesignServerMsg) {
    switch (m.t) {
      case 'welcome': {
        this.retry = 0;
        this.set({
          status: 'online',
          error: null,
          you: m.you,
          color: m.color,
          role: m.role,
          peers: Object.fromEntries(m.peers.map((p) => [p.id, p])),
          cursors: {},
          pins: m.pins,
          chat: m.history,
          following: null,
          live: m.live ?? null,
          previews: m.previews ?? [],
          prs: m.prs ?? [],
        });
        if (this.currentView) this.view(this.currentView);
        return;
      }
      case 'join':
        this.set({ peers: { ...this.state.peers, [m.peer.id]: m.peer } });
        return;
      case 'leave': {
        const { [m.id]: _gone, ...peers } = this.state.peers;
        const { [m.id]: _c, ...cursors } = this.state.cursors;
        this.set({ peers, cursors, following: this.state.following === m.id ? null : this.state.following });
        return;
      }
      case 'peer': {
        const cur = this.state.peers[m.id];
        if (!cur) return;
        const next = { ...cur, ...m.patch };
        this.set({ peers: { ...this.state.peers, [m.id]: next } });
        if (m.patch.view && this.state.following === m.id) this.emitView(next);
        return;
      }
      case 'cursors': {
        const cursors = { ...this.state.cursors };
        const now = Date.now();
        for (const [id, story, x, y] of m.c) if (id !== this.state.you) cursors[id] = { story, x, y, at: now };
        this.set({ cursors });
        return;
      }
      case 'chat':
        this.set({ chat: [...this.state.chat, m.msg].slice(-200) });
        return;
      case 'pin': {
        if (m.op === 'del') return this.set({ pins: this.state.pins.filter((p) => p.id !== m.id) });
        const rest = this.state.pins.filter((p) => p.id !== m.pin.id);
        this.set({ pins: [...rest, m.pin].sort((a, b) => a.at - b.at) });
        return;
      }
      case 'version': {
        const v = m.version;
        if (v.kind === 'live') {
          // Mirrors the server: previews built from the commit that is now live are stale.
          return this.set({ live: v, previews: this.state.previews.filter((p) => p.sha !== v.sha) });
        }
        const rest = this.state.previews.filter((p) => p.pr !== v.pr);
        this.set({ previews: [v, ...rest].slice(0, DESIGN_LIMITS.previews) });
        return;
      }
      case 'pr': {
        const rest = this.state.prs.filter((p) => p.pr !== m.pr.pr);
        // Mirrors the server: a merged or closed PR no longer has a preview worth opening.
        const previews = m.pr.state === 'open' ? this.state.previews : this.state.previews.filter((p) => p.pr !== m.pr.pr);
        this.set({ prs: [m.pr, ...rest].slice(0, DESIGN_LIMITS.prs), previews });
        return;
      }
      case 'error':
        // Fatal errors (auth, not a member…) stop reconnecting; transient ones (rate limit) are only surfaced.
        this.set({ error: FATAL.has(m.code) ? m.message : this.state.error });
        return;
      default:
    }
  }

  private emitView(p: DesignPeer) {
    if (!p.view) return;
    for (const l of [...this.viewListeners]) l(p.view, p);
  }

  /* ── outbound (throttled) ── */

  /** Report your pointer position (normalised to the story frame). Sent at most every `cursorIntervalMs`. */
  cursor(story: string, x: number, y: number): void {
    this.pendingCursor = { story, x, y };
    const wait = (this.opts.cursorIntervalMs ?? 40) - (Date.now() - this.lastCursor);
    if (wait <= 0) return this.flushCursor();
    this.cursorTimer ??= setTimeout(() => this.flushCursor(), wait);
  }

  private flushCursor() {
    this.cursorTimer = null;
    const c = this.pendingCursor;
    this.pendingCursor = null;
    if (!c) return;
    this.lastCursor = Date.now();
    this.send({ t: 'cursor', ...c });
  }

  /** Report what you are looking at (story, zoom, scroll) so others can follow you. */
  view(v: DesignView): void {
    this.currentView = v;
    this.pendingView = v;
    const wait = (this.opts.viewIntervalMs ?? 120) - (Date.now() - this.lastView);
    if (wait <= 0) return this.flushView();
    this.viewTimer ??= setTimeout(() => this.flushView(), wait);
  }

  private flushView() {
    this.viewTimer = null;
    const v = this.pendingView;
    this.pendingView = null;
    if (!v) return;
    this.lastView = Date.now();
    this.send({ t: 'view', view: v });
  }

  /** Follow someone (connection id) or stop with `null`. Starting to follow immediately applies their view. */
  follow(id: string | null): void {
    if (id !== null && (!this.state.peers[id] || id === this.state.you)) return;
    this.set({ following: id });
    this.send({ t: 'follow', target: id });
    if (id) this.emitView(this.state.peers[id]);
  }

  sendChat(text: string, story?: string): void {
    this.send({ t: 'chat', text, story });
  }

  addPin(story: string, x: number, y: number, text: string): void {
    this.send({ t: 'pin.add', story, x, y, text });
  }

  updatePin(id: string, patch: { text?: string; resolved?: boolean }): void {
    this.send({ t: 'pin.update', id, ...patch });
  }

  deletePin(id: string): void {
    this.send({ t: 'pin.del', id });
  }
}
