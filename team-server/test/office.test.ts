import assert from 'node:assert/strict';
import { afterAll, afterEach, beforeAll, describe, test } from 'bun:test';
import { WebSocket } from 'ws';
import { lookFromSeed } from '../src/shared/workspace/looks.ts';
import type { ClientMsg, ServerMsg, WelcomeMsg } from '../src/shared/workspace/protocol.ts';
import { loadConfig } from '../src/config.ts';
import { setSilent } from '../src/log.ts';
import { createTeamServer } from '../src/server.ts';
import type { TeamServer } from '../src/server.ts';
import { AuthzError } from '../src/membership.ts';
import { MemoryStore } from '../src/store.ts';

setSilent(true);

class Bot {
  ws!: WebSocket;
  inbox: ServerMsg[] = [];
  closed: { code: number } | null = null;
  welcome!: WelcomeMsg;
  private waiters: { pred: (m: ServerMsg) => boolean; res: (m: ServerMsg) => void }[] = [];

  constructor(
    readonly uid: string,
    private url: string,
    /** Dev membership: the "GitHub token" is `dev:<role>`. founder = repo admin, pm = maintain, frontend = push. */
    private role = 'frontend',
  ) {}

  async connect(opts: { token?: string; github?: string; expectWelcome?: boolean } = {}) {
    this.ws = new WebSocket(this.url);
    this.ws.on('message', (d) => {
      const m = JSON.parse(d.toString()) as ServerMsg;
      this.inbox.push(m);
      this.waiters = this.waiters.filter((w) => {
        if (w.pred(m)) {
          w.res(m);
          return false;
        }
        return true;
      });
    });
    this.ws.on('close', (code) => {
      this.closed = { code };
    });
    await new Promise<void>((res, rej) => {
      this.ws.once('open', () => res());
      this.ws.once('error', rej);
    });
    this.send({ t: 'hello', token: opts.token ?? `dev:${this.uid}:${this.uid}`, workspaceId: 'main', name: this.uid, look: lookFromSeed(this.uid), github: 'github' in opts ? opts.github : `dev:${this.role}` });
    if (opts.expectWelcome !== false) this.welcome = (await this.waitFor((m) => m.t === 'welcome')) as WelcomeMsg;
    return this;
  }

  send(m: ClientMsg) {
    this.ws.send(JSON.stringify(m));
  }

  waitFor(pred: (m: ServerMsg) => boolean, ms = 2000): Promise<ServerMsg> {
    const hit = this.inbox.find(pred);
    if (hit) return Promise.resolve(hit);
    return new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('timeout waiting for message')), ms);
      this.waiters.push({
        pred,
        res: (m) => {
          clearTimeout(t);
          res(m);
        },
      });
    });
  }

  /** Assert that no message matching pred arrives within ms. */
  async expectNone(pred: (m: ServerMsg) => boolean, ms = 250) {
    await new Promise((r) => setTimeout(r, ms));
    assert.equal(this.inbox.filter(pred).length, 0, 'unexpected message received');
  }

  close() {
    this.ws.close();
  }
}

describe('office server', () => {
  let server: TeamServer;
  let url = '';
  const bots: Bot[] = [];
  const newBot = (uid: string, role?: string) => {
    const b = new Bot(uid, url, role);
    bots.push(b);
    return b;
  };

  beforeAll(async () => {
    const cfg = { ...loadConfig(), devAuth: true, store: 'memory' as const, repo: 'acme/garden', allowedOrigins: ['*'], designUrl: 'https://garden-design.web.app' };
    server = createTeamServer({ cfg, store: new MemoryStore() });
    const port = await server.listen(0);
    url = `ws://127.0.0.1:${port}/ws`;
  });

  // One project = one office, so every test starts from an empty room.
  afterEach(async () => {
    for (const b of bots.splice(0)) b.ws?.terminate();
    await new Promise((r) => setTimeout(r, 30));
  });

  afterAll(async () => {
    await server.close();
  });

  test('healthz and public config', async () => {
    const base = url.replace('ws://', 'http://').replace('/ws', '');
    const h = (await (await fetch(`${base}/healthz`)).json()) as { ok: boolean };
    assert.equal(h.ok, true);
    const c = (await (await fetch(`${base}/config`)).json()) as { repo: string; designUrl: string };
    assert.deepEqual(c, { repo: 'acme/garden', designUrl: 'https://garden-design.web.app' });
    assert.equal((await fetch(`${base}/projects`)).status, 404, 'the multi-tenant project API is gone');
    assert.equal((await fetch(`${base}/ai/generate`, { method: 'POST' })).status, 404, 'no server-side AI');
  });

  test('join returns the world with agent NPCs seated at desks', async () => {
    const a = await newBot('alice', 'founder').connect();
    const w = a.welcome;
    assert.equal(w.you, 'dev-alice');
    assert.equal(w.role, 'owner');
    assert.equal(w.map.width, 64);
    const agents = w.players.filter((p) => p.kind === 'agent');
    assert.equal(agents.length, 5);
    assert.ok(agents.every((p) => p.sitting && p.desk), 'agents start seated');
    assert.equal(Object.keys(w.deskOwners).length, 5);
  });

  test('rejects bad tokens and malformed frames', async () => {
    const bad = await newBot('mallory').connect({ token: 'garbage', expectWelcome: false });
    const err = (await bad.waitFor((m) => m.t === 'error')) as Extract<ServerMsg, { t: 'error' }>;
    assert.equal(err.code, 'auth_failed');
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(bad.closed?.code, 4003);

    const a = await newBot('alice2').connect();
    a.ws.send('{"t":"move","x":"nope"}');
    await a.waitFor((m) => m.t === 'error' && m.code === 'bad_message');
  });

  test('players see each other and positions stream', async () => {
    const a = await newBot('p1').connect();
    const b = await newBot('p2').connect();
    await a.waitFor((m) => m.t === 'join' && m.player.id === 'dev-p2');
    assert.ok(b.welcome.players.some((p) => p.id === 'dev-p1'));
    const me = b.welcome.players.find((p) => p.id === 'dev-p2')!;
    b.send({ t: 'move', x: me.x + 0.1, y: me.y, dir: 'right', moving: true });
    const st = (await a.waitFor((m) => m.t === 'state' && m.p.some((t) => t[0] === 'dev-p2'))) as Extract<ServerMsg, { t: 'state' }>;
    const tup = st.p.find((t) => t[0] === 'dev-p2')!;
    assert.equal(tup[3], 'right');
    // never echoes your own position back
    await b.expectNone((m) => m.t === 'state' && m.p.some((t) => t[0] === 'dev-p2'));
    b.close();
    await a.waitFor((m) => m.t === 'leave' && m.id === 'dev-p2');
  });

  test('teleporting and walking through walls is rejected', async () => {
    const a = await newBot('tp').connect();
    const me = a.welcome.players.find((p) => p.id === 'dev-tp')!;
    a.send({ t: 'move', x: me.x, y: me.y - 20, dir: 'up', moving: true });
    const c = (await a.waitFor((m) => m.t === 'correct')) as Extract<ServerMsg, { t: 'correct' }>;
    assert.ok(Math.abs(c.x - me.x) < 0.01 && Math.abs(c.y - me.y) < 0.01);
    // inside the south wall of the building
    a.inbox.length = 0;
    a.send({ t: 'move', x: me.x, y: 33.5, dir: 'down', moving: true });
    await a.waitFor((m) => m.t === 'correct');
  });

  test('nearby chat respects distance and private rooms', async () => {
    const a = await newBot('c1').connect();
    const b = await newBot('c2').connect();
    const c = await newBot('c3').connect();
    const room = await server.office.enter('dev-c1', { role: 'frontend' });
    const P = (u: string) => room.room.players.get(`dev-${u}`)!;
    // c1 + c2 in the open plaza, c3 far across the plaza; then c1 & c3 inside the standup room.
    Object.assign(P('c1'), { x: 30.5, y: 19.5 });
    Object.assign(P('c2'), { x: 32.5, y: 19.5 });
    Object.assign(P('c3'), { x: 40.5, y: 21.5 });
    a.send({ t: 'chat', scope: 'nearby', text: 'hello plaza' });
    await b.waitFor((m) => m.t === 'chat' && m.msg.text === 'hello plaza');
    await a.waitFor((m) => m.t === 'chat' && m.msg.text === 'hello plaza'); // echo to sender
    await c.expectNone((m) => m.t === 'chat' && m.msg.text === 'hello plaza');

    // private zone: c1 + c2 in standup (x 2..10, y 24..32), c3 right outside above the wall
    Object.assign(P('c1'), { x: 4.5, y: 27.5 });
    Object.assign(P('c2'), { x: 9.5, y: 31.5 });
    Object.assign(P('c3'), { x: 5.5, y: 22.5 });
    await new Promise((r) => setTimeout(r, 450));
    a.send({ t: 'chat', scope: 'nearby', text: 'secret plan' });
    await b.waitFor((m) => m.t === 'chat' && m.msg.text === 'secret plan');
    await c.expectNone((m) => m.t === 'chat' && m.msg.text === 'secret plan');

    // room-wide reaches everyone, even across zones
    await new Promise((r) => setTimeout(r, 450));
    a.send({ t: 'chat', scope: 'room', text: 'all hands' });
    await c.waitFor((m) => m.t === 'chat' && m.msg.text === 'all hands');
  });

  test('dm only reaches its recipient', async () => {
    const a = await newBot('d1').connect();
    const b = await newBot('d2').connect();
    const c = await newBot('d3').connect();
    a.send({ t: 'chat', scope: 'dm', to: 'dev-d2', text: 'psst' });
    await b.waitFor((m) => m.t === 'chat' && m.msg.text === 'psst');
    await c.expectNone((m) => m.t === 'chat' && m.msg.text === 'psst');
  });

  test('chat is rate limited', async () => {
    const a = await newBot('spam').connect();
    const b = await newBot('listener').connect();
    for (let i = 0; i < 20; i++) a.send({ t: 'chat', scope: 'room', text: `m${i}` });
    await new Promise((r) => setTimeout(r, 300));
    const got = b.inbox.filter((m) => m.t === 'chat').length;
    assert.ok(got <= 8, `expected rate limiting, got ${got}`);
    assert.ok(got >= 1);
  });

  test('desk claims are exclusive and broadcast', async () => {
    const a = await newBot('o1').connect();
    const b = await newBot('o2').connect();
    const free = a.welcome.map.props.find((p) => p.kind === 'desk' && !a.welcome.deskOwners[p.id])!;
    a.send({ t: 'desk.claim', deskId: free.id });
    await b.waitFor((m) => m.t === 'desk.owner' && m.deskId === free.id && m.ownerId === 'dev-o1');
    b.send({ t: 'desk.claim', deskId: free.id });
    await b.waitFor((m) => m.t === 'error' && m.code === 'desk_taken');
    a.send({ t: 'desk.claim', deskId: null });
    await b.waitFor((m) => m.t === 'desk.owner' && m.deskId === free.id && m.ownerId === null);
  });

  test('sitting requires being near the desk', async () => {
    const a = await newBot('s1').connect();
    const desk = a.welcome.map.props.find((p) => p.kind === 'desk' && !a.welcome.deskOwners[p.id])!;
    a.send({ t: 'sit', deskId: desk.id });
    await a.waitFor((m) => m.t === 'correct'); // far away: refused
    const room = await server.office.enter('dev-s1', { role: 'frontend' });
    Object.assign(room.room.players.get('dev-s1')!, { x: desk.x + 1.5, y: desk.y + 2.2 });
    a.inbox.length = 0;
    a.send({ t: 'sit', deskId: desk.id });
    await new Promise((r) => setTimeout(r, 100));
    const p = room.room.players.get('dev-s1')!;
    assert.equal(p.sitting, desk.id);
    assert.equal(p.dir, 'up');
  });

  test('only admins edit the map; edits broadcast', async () => {
    const owner = await newBot('boss', 'founder').connect();
    const guest = await newBot('guest').connect();
    assert.equal(guest.welcome.role, 'member');
    guest.send({ t: 'edit', op: { op: 'floor', cells: [[5, 40, 3]] } });
    await guest.waitFor((m) => m.t === 'error' && m.code === 'forbidden');
    owner.send({ t: 'edit', op: { op: 'prop.add', prop: { id: 'new-plant', kind: 'plant', x: 4, y: 40 } } });
    await guest.waitFor((m) => m.t === 'map.edit' && m.op.op === 'prop.add');
    const room = await server.office.enter('dev-boss', { role: 'founder' });
    assert.ok(room.room.map.props.some((p) => p.id === 'new-plant'));
    // an invalid op never reaches the room
    owner.send({ t: 'edit', op: { op: 'prop.add', prop: { id: 'x', kind: 'plant', x: 999, y: 4 } } } as ClientMsg);
    await guest.expectNone((m) => m.t === 'map.edit' && m.op.op === 'prop.add' && m.op.prop.id === 'x');
  });

  test('office teammates do not talk: the server has no AI and says so', async () => {
    const a = await newBot('asker').connect();
    a.send({ t: 'agent.chat', agentId: 'frontend-engineer', text: 'hello there', reqId: 'r1' });
    const err = (await a.waitFor((m) => m.t === 'agent.error' && m.reqId === 'r1')) as Extract<ServerMsg, { t: 'agent.error' }>;
    assert.match(err.message, /cannot chat/);
    await a.expectNone((m) => m.t === 'agent.delta');
  });

  test('second login replaces the first connection', async () => {
    const a1 = await newBot('twin').connect();
    const a2 = await newBot('twin').connect();
    await new Promise((r) => setTimeout(r, 150));
    assert.equal(a1.closed?.code, 4001);
    assert.ok(a2.welcome);
  });

  test('the role follows the GitHub permission on every join', async () => {
    const first = await newBot('flip', 'pm').connect();
    assert.equal(first.welcome.role, 'admin');
    first.close();
    await new Promise((r) => setTimeout(r, 100));
    const demoted = await newBot('flip', 'frontend').connect();
    assert.equal(demoted.welcome.role, 'member', 'a demoted collaborator loses admin rights');
  });

  test('rooms never tell members an invite code (there are none)', async () => {
    const a = await newBot('nocode', 'founder').connect();
    assert.equal((a.welcome as { inviteCode?: string }).inviteCode, undefined);
  });
});

describe('membership gate (dev auth off)', () => {
  const bots: Bot[] = [];
  let strict: TeamServer;
  let url = '';
  const seen: { uid: string; github?: string }[] = [];

  beforeAll(async () => {
    const cfg = { ...loadConfig(), devAuth: false, store: 'memory' as const, repo: 'acme/garden', allowedOrigins: ['*'] };
    strict = createTeamServer({
      cfg,
      store: new MemoryStore(),
      auth: { verify: async (t) => ({ uid: t, email: `${t}@example.com` }) },
      membership: {
        resolve: async (id, github) => {
          seen.push({ uid: id.uid, github });
          if (!github) throw new AuthzError('github_required', 'Sign in to GitHub.');
          if (github === 'ghp_collab') return { role: 'frontend', login: 'friend' };
          if (github === 'ghp_admin') return { role: 'founder', login: 'owner' };
          throw new AuthzError('not_a_member', 'No write access.');
        },
      },
    });
    url = `ws://127.0.0.1:${await strict.listen(0)}/ws`;
  });

  afterAll(async () => {
    for (const b of bots) b.ws?.terminate();
    await strict.close();
  });

  test('only people with write access to the repository get in', async () => {
    const owner = new Bot('x', url);
    bots.push(owner);
    await owner.connect({ token: 'owner1', github: 'ghp_admin' });
    assert.equal(owner.welcome.role, 'owner');

    const friend = new Bot('x', url);
    bots.push(friend);
    await friend.connect({ token: 'friend', github: 'ghp_collab' });
    assert.equal(friend.welcome.role, 'member');

    const outsider = new Bot('x', url);
    bots.push(outsider);
    await outsider.connect({ token: 'rando', github: 'ghp_stranger', expectWelcome: false });
    await outsider.waitFor((m) => m.t === 'error' && m.code === 'not_a_member');

    const noGithub = new Bot('x', url);
    bots.push(noGithub);
    await noGithub.connect({ token: 'nogh', github: undefined, expectWelcome: false });
    await noGithub.waitFor((m) => m.t === 'error' && m.code === 'github_required');
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(noGithub.closed?.code, 4003);
  });
});
