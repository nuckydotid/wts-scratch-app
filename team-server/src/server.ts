import { Hono } from 'hono';
import type { Server, ServerWebSocket } from 'bun';
import { DESIGN_LIMITS, parseDesignClientMsg } from './shared/design/protocol.ts';
import type { DesignServerMsg } from './shared/design/protocol.ts';
import { parseClientMsg } from './shared/workspace/protocol.ts';
import type { ServerMsg } from './shared/workspace/protocol.ts';
import { createAuthenticator } from './auth.ts';
import type { Authenticator } from './auth.ts';
import { loadConfig } from './config.ts';
import type { Config } from './config.ts';
import { designOriginAllowed, officeOriginAllowed } from './design-access.ts';
import type { DesignRoom, DesignClientConn } from './design-room.ts';
import { createHooks } from './hooks.ts';
import type { OidcVerifier } from './hooks.ts';
import { log } from './log.ts';
import { AuthzError, createMembership } from './membership.ts';
import type { Membership } from './membership.ts';
import { Design, Office } from './office.ts';
import { TokenBucket } from './ratelimit.ts';
import type { Client, Room } from './room.ts';
import { createStore } from './store.ts';
import type { Store } from './store.ts';

export interface ServerDeps {
  cfg?: Config;
  store?: Store;
  auth?: Authenticator;
  membership?: Membership;
  /** Verifier for the GitHub OIDC tokens CI sends to `/hooks/ci` (tests inject a fake). */
  oidc?: OidcVerifier;
}

export interface TeamServer {
  app: Hono;
  office: Office;
  design: Design;
  cfg: Config;
  /** Starts listening (port 0 = any free port) and resolves to the port. */
  listen(port?: number): Promise<number>;
  close(): Promise<void>;
}

const HELLO_TIMEOUT_MS = 10_000;
const OFFICE_FRAME_MAX = 256 * 1024;

/** Per-socket state, kept on `ws.data`. */
interface SocketData {
  kind: 'office' | 'design';
  origin: string | null;
  inbound: TokenBucket;
  helloTimer?: ReturnType<typeof setTimeout>;
  client?: Client;
  room?: Room;
  conn?: DesignClientConn;
  droom?: DesignRoom;
  /** Set once `hello` has been accepted for processing, so a second hello cannot start another sign-in. */
  helloSeen?: boolean;
}
type Sock = ServerWebSocket<SocketData>;

export function createTeamServer(deps: ServerDeps = {}): TeamServer {
  const cfg = deps.cfg ?? loadConfig();
  const store = deps.store ?? createStore(cfg);
  const auth = deps.auth ?? createAuthenticator(cfg);
  const membership = deps.membership ?? createMembership(cfg);
  const office = new Office(store, cfg);
  const design = new Design(store);

  /* ───────────── HTTP ───────────── */

  const app = new Hono();
  app.use('*', async (c, next) => {
    await next();
    c.header('cache-control', 'no-store');
    c.header('access-control-allow-origin', '*');
  });
  app.get('/', (c) => c.json({ name: 'worktrees-team-server', ws: '/ws', design: '/design' }));
  app.get('/healthz', (c) => c.json({ ok: true, ...office.stats() }));
  // Public, non-secret facts a client can use to check it is talking to the right project's server.
  app.get('/config', (c) => c.json({ repo: cfg.repo, designUrl: cfg.designUrl || undefined, firebaseProjectId: cfg.firebaseProjectId || undefined }));
  app.route('/', createHooks({ cfg, design, oidc: deps.oidc }));
  app.notFound((c) => c.json({ error: 'not_found' }, 404));
  app.onError((e, c) => {
    log.error('request failed', { path: c.req.path, err: String(e) });
    return c.json({ error: 'internal' }, 500);
  });

  /* ───────────── WebSockets ───────────── */

  const sockets = new Set<Sock>();

  const reject = (ws: Sock, send: (m: { t: 'error'; code: string; message: string }) => void, e: unknown, what: string) => {
    const code = e instanceof AuthzError ? e.code : 'auth_failed';
    if (!(e instanceof AuthzError)) log.warn(`${what} auth failed`, { err: String(e) });
    send({ t: 'error', code, message: e instanceof AuthzError ? e.message : 'Sign-in failed.' });
    ws.close(4003, code);
  };

  async function officeMessage(ws: Sock, text: string) {
    const d = ws.data;
    const send = (m: ServerMsg) => {
      if (ws.readyState === 1) ws.send(JSON.stringify(m));
    };
    const msg = parseClientMsg(text);
    if (!msg) return send({ t: 'error', code: 'bad_message', message: 'Malformed message.' });
    if (d.client && d.room) return d.room.handle(d.client, msg);
    if (msg.t !== 'hello' || d.helloSeen) return;
    d.helloSeen = true;
    clearTimeout(d.helloTimer);
    try {
      const id = await auth.verify(msg.token);
      const member = await membership.resolve(id, msg.github);
      const entered = await office.enter(id.uid, member);
      if (ws.readyState !== 1) return;
      d.room = entered.room;
      d.client = {
        uid: id.uid,
        role: entered.role,
        transport: { send: (s) => ws.readyState === 1 && ws.send(s), close: (c, r) => ws.close(c, r) },
        send,
        buckets: {
          move: new TokenBucket(40, 30),
          chat: new TokenBucket(5, 2.5),
          emote: new TokenBucket(3, 1),
          edit: new TokenBucket(200, 100),
          misc: new TokenBucket(10, 5),
        },
        lastMoveAt: Date.now(),
      };
      entered.room.join(d.client, { uid: id.uid, name: msg.name || id.name || member.login || 'Guest', look: msg.look, email: id.email, role: entered.role });
    } catch (e) {
      reject(ws, send, e, 'office');
    }
  }

  async function designMessage(ws: Sock, text: string) {
    const d = ws.data;
    const send = (m: DesignServerMsg) => {
      if (ws.readyState === 1) ws.send(JSON.stringify(m));
    };
    const msg = parseDesignClientMsg(text);
    if (!msg) return send({ t: 'error', code: 'bad_message', message: 'Malformed message.' });
    if (d.conn && d.droom) return d.droom.handle(d.conn, msg);
    if (msg.t !== 'hello' || d.helloSeen) return;
    d.helloSeen = true;
    clearTimeout(d.helloTimer);
    try {
      const id = await auth.verify(msg.token);
      const member = await membership.resolve(id, msg.github);
      if (!designOriginAllowed(d.origin, cfg)) throw new AuthzError('origin_not_allowed', 'This site is not allowed to join the design room.');
      const room = await design.get();
      if (ws.readyState !== 1) return;
      d.droom = room;
      d.conn = {
        id: room.newConnectionId(id.uid),
        uid: id.uid,
        role: member.role,
        send,
        buckets: {
          cursor: new TokenBucket(60, 40),
          view: new TokenBucket(30, 15),
          chat: new TokenBucket(5, 2.5),
          pin: new TokenBucket(10, 2),
          misc: new TokenBucket(10, 5),
        },
      };
      room.join(d.conn, { name: msg.name || id.name || member.login || 'Guest', look: msg.look });
    } catch (e) {
      reject(ws, send, e, 'design');
    }
  }

  const websocket = {
    maxPayloadLength: Math.max(OFFICE_FRAME_MAX, DESIGN_LIMITS.frame),
    idleTimeout: 60,
    sendPings: true,
    open(ws: Sock) {
      sockets.add(ws);
      ws.data.helloTimer = setTimeout(() => ws.close(4008, 'hello timeout'), HELLO_TIMEOUT_MS);
    },
    async message(ws: Sock, data: string | Buffer) {
      if (typeof data !== 'string') return; // binary frames are not part of either protocol
      const d = ws.data;
      if (data.length > (d.kind === 'office' ? OFFICE_FRAME_MAX : DESIGN_LIMITS.frame)) return void ws.close(1009, 'frame too large');
      if (!d.inbound.take()) return void ws.close(1008, 'rate limit');
      await (d.kind === 'office' ? officeMessage(ws, data) : designMessage(ws, data));
    },
    close(ws: Sock) {
      sockets.delete(ws);
      clearTimeout(ws.data.helloTimer);
      if (ws.data.client && ws.data.room) ws.data.room.leave(ws.data.client);
      if (ws.data.conn && ws.data.droom) ws.data.droom.leave(ws.data.conn);
    },
  };

  const fetch = (req: Request, server: Server<SocketData>): Response | undefined | Promise<Response> => {
    const path = new URL(req.url).pathname;
    if ((path === '/ws' || path === '/design') && req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
      const origin = req.headers.get('origin');
      const kind = path === '/ws' ? 'office' : 'design';
      // The design socket checks the Origin after sign-in (it may be the project's own design site); the office socket now.
      if (kind === 'office' && !officeOriginAllowed(origin, cfg)) return new Response('forbidden', { status: 403 });
      const data: SocketData = { kind, origin, inbound: new TokenBucket(kind === 'office' ? 120 : 200, kind === 'office' ? 90 : 120) };
      return server.upgrade(req, { data }) ? undefined : new Response('upgrade failed', { status: 400 });
    }
    return app.fetch(req);
  };

  let server: Server<SocketData> | null = null;
  return {
    app,
    office,
    design,
    cfg,
    async listen(port = cfg.port) {
      server = Bun.serve<SocketData>({ port, fetch, websocket, maxRequestBodySize: 512 * 1024 });
      return server.port ?? port;
    },
    async close() {
      for (const ws of sockets) ws.close(1012, 'server restarting');
      await Promise.all([office.shutdown(), design.shutdown()]);
      await store.close();
      await server?.stop(true);
    },
  };
}
