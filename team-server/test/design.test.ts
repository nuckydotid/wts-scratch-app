import assert from 'node:assert/strict';
import { afterAll, beforeAll, describe, test } from 'bun:test';
import { DesignClient } from '../src/shared/design/client.ts';
import type { DesignState } from '../src/shared/design/client.ts';
import { loadConfig } from '../src/config.ts';
import { setSilent } from '../src/log.ts';
import { createTeamServer } from '../src/server.ts';
import type { TeamServer } from '../src/server.ts';
import { MemoryStore } from '../src/store.ts';
import { designHello } from './helpers.ts';

setSilent(true);

const until = async (pred: () => boolean, ms = 2000) => {
  const t = Date.now();
  while (!pred()) {
    if (Date.now() - t > ms) throw new Error('timed out waiting for condition');
    await new Promise((r) => setTimeout(r, 10));
  }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Dev membership: the "GitHub token" is `dev:<role>`. Anyone without one is not on the team. */
const ROLES: Record<string, string> = { ann: 'founder', dan: 'designer', fay: 'frontend' };

describe('design room', () => {
  let server: TeamServer;
  let store: MemoryStore;
  let http = '';
  let wsUrl = '';
  const pid = 'main';
  const clients: DesignClient[] = [];

  const join = async (uid: string) => {
    const c = new DesignClient({ url: wsUrl, projectId: pid, name: uid, getToken: () => `dev:${uid}:${uid}`, getGithubToken: () => (ROLES[uid] ? `dev:${ROLES[uid]}` : undefined), reconnect: false, cursorIntervalMs: 0, viewIntervalMs: 0 });
    clients.push(c);
    c.connect();
    await until(() => c.getState().status === 'online' || c.getState().status === 'closed');
    return c;
  };

  beforeAll(async () => {
    const cfg = { ...loadConfig(), devAuth: true, store: 'memory' as const, repo: 'acme/garden', allowedOrigins: ['http://localhost:1420'], designUrl: 'https://garden-design.web.app' };
    store = new MemoryStore();
    server = createTeamServer({ cfg, store });
    const port = await server.listen(0);
    http = `http://127.0.0.1:${port}`;
    wsUrl = `ws://127.0.0.1:${port}/design`;
  });

  afterAll(async () => {
    for (const c of clients) c.close();
    await server.close();
  });

  test('only people on the team get in', async () => {
    const stranger = await join('mallory');
    assert.equal(stranger.getState().status, 'closed');
    assert.match(stranger.getState().error ?? '', /GitHub/);
  });

  test('members see each other, with distinct colours', async () => {
    const a = await join('ann');
    const b = await join('dan');
    assert.equal(a.getState().status, 'online');
    assert.equal(a.getState().role, 'founder');
    assert.equal(b.getState().role, 'designer');
    assert.ok(Object.values(b.getState().peers).some((p) => p.uid === 'dev-ann'));
    await until(() => Object.values(a.getState().peers).some((p) => p.uid === 'dev-dan'));
    assert.notEqual(a.getState().color, b.getState().color);
        a.close();
    await until(() => !Object.values(b.getState().peers).some((p) => p.uid === 'dev-ann'));
    b.close();
  });

  test('cursors are batched to others and never echoed back', async () => {
    const a = await join('ann');
    const b = await join('dan');
    await until(() => Object.keys(a.getState().peers).length === 1);
    a.cursor('button/primary', 0.25, 0.75);
    await until(() => Object.keys(b.getState().cursors).length === 1);
    const cur = Object.values(b.getState().cursors)[0];
    assert.deepEqual([cur.story, cur.x, cur.y], ['button/primary', 0.25, 0.75]);
    await sleep(150);
    assert.deepEqual(a.getState().cursors, {}, 'you never receive your own cursor');
    // the peer's current story follows their cursor
    await until(() => Object.values(b.getState().peers).find((p) => p.uid === 'dev-ann')?.story === 'button/primary');
    a.close();
    b.close();
  });

  test('a view reported before the socket opens is delivered once it is online', async () => {
    const early = new DesignClient({ url: wsUrl, projectId: pid, name: 'ann', getToken: () => 'dev:ann:ann', getGithubToken: () => 'dev:founder', reconnect: false, cursorIntervalMs: 0, viewIntervalMs: 0 });
    clients.push(early);
    early.view({ story: 'blocks/early', zoom: 1, sx: 0, sy: 0 }); // before connect(): the page published its story on mount
    early.connect();
    const watcher = await join('dan');
    await until(() => Object.values(watcher.getState().peers).some((p) => p.uid === 'dev-ann' && p.view?.story === 'blocks/early'));
    early.close();
    watcher.close();
  });

  test('following copies the leader’s view and stops when they leave', async () => {
    const lead = await join('ann');
    const fol = await join('dan');
    await until(() => Object.keys(fol.getState().peers).length === 1);
    const leadId = lead.getState().you!;
    const seen: string[] = [];
    fol.onFollowedView((v) => seen.push(`${v.story}@${v.zoom}`));

    lead.view({ story: 'card/plant', zoom: 2, sx: 10, sy: 20 });
    await until(() => !!fol.getState().peers[leadId]?.view);
    fol.follow(leadId);
    assert.deepEqual(seen, ['card/plant@2'], 'starting to follow applies the current view immediately');
    lead.view({ story: 'card/plant', zoom: 3, sx: 0, sy: 0 });
    await until(() => seen.length === 2);
    assert.equal(seen[1], 'card/plant@3');
    // everybody can see who follows whom
    await until(() => lead.getState().peers[fol.getState().you!]?.following === leadId);

    fol.follow('someone-else~000000'); // unknown target is ignored client-side
    assert.equal(fol.getState().following, leadId);
    lead.close();
    await until(() => fol.getState().following === null);
    fol.close();
  });

  test('chat reaches everyone, is remembered for late joiners, and is rate limited', async () => {
    const a = await join('ann');
    const b = await join('dan');
    await until(() => Object.keys(a.getState().peers).length === 1);
    a.sendChat('Make the CTA bigger', 'button/primary');
    await until(() => a.getState().chat.length === 1 && b.getState().chat.length === 1);
    assert.equal(b.getState().chat[0].fromName, 'ann');
    assert.equal(b.getState().chat[0].story, 'button/primary');
    const late = await join('fay');
    assert.equal(late.getState().chat.at(-1)?.text, 'Make the CTA bigger');
    for (let i = 0; i < 20; i++) a.sendChat(`spam ${i}`);
    await sleep(200);
    assert.ok(b.getState().chat.length < 15, 'burst is capped by the chat bucket');
    for (const c of [a, b, late]) c.close();
  });

  test('pins: add, resolve, permissions and persistence', async () => {
    const ann = await join('ann');
    const fay = await join('fay');
    const dan = await join('dan');
    fay.addPin('card/plant', 0.4, 0.6, 'Title is clipped on small phones');
    await until(() => ann.getState().pins.length === 1 && dan.getState().pins.length === 1);
    const pin = ann.getState().pins[0];
    assert.equal(pin.by.name, 'fay');
    assert.equal(pin.resolved, false);

    // anyone may resolve
    dan.updatePin(pin.id, { resolved: true });
    await until(() => fay.getState().pins[0].resolved);

    // only the author or a moderator may reword; a plain member cannot touch someone else's comment
    ann.updatePin(pin.id, { text: 'Clipped title' }); // founder = moderator
    await until(() => dan.getState().pins[0].text === 'Clipped title');
    fay.addPin('card/plant', 0.1, 0.1, 'Ann’s pin target');
    await until(() => ann.getState().pins.length === 2);
    const second = ann.getState().pins[1];
    ann.addPin('card/plant', 0.9, 0.9, 'Ann’s own pin');
    await until(() => fay.getState().pins.length === 3);
    const annsPin = fay.getState().pins.find((p) => p.by.name === 'ann')!;
    fay.deletePin(annsPin.id);
    await sleep(150);
    assert.ok(ann.getState().pins.some((p) => p.id === annsPin.id), 'members cannot delete others’ pins');
    dan.deletePin(annsPin.id); // designers moderate
    await until(() => ann.getState().pins.every((p) => p.id !== annsPin.id));
    fay.deletePin(second.id); // author can delete her own
    await until(() => ann.getState().pins.every((p) => p.id !== second.id));

    // persisted through the store and restored for the next session
    for (const c of [ann, fay, dan]) c.close();
    const room = await server.design.get();
    await room.flush();
    const saved = await store.loadDesign(pid);
    assert.equal(saved?.pins.length, 1);
    assert.equal(saved?.pins[0].text, 'Clipped title');
    const next = await join('ann');
    assert.equal(next.getState().pins.length, 1);
    next.close();
  });

  test('origin: the desktop app origin and the project’s own design site may connect; others may not', async () => {
    const hello = (origin: string | undefined) => designHello(wsUrl, origin, { token: 'dev:ann:ann', projectId: pid, name: 'ann', github: 'dev:founder' });
    assert.equal((await hello(undefined)).t, 'welcome', 'non-browser clients send no Origin');
    assert.equal((await hello('http://localhost:1420')).t, 'welcome');
    const evil = await hello('https://evil.example');
    assert.equal(evil.t === 'error' && evil.code, 'origin_not_allowed');
    assert.equal((await hello('https://garden-design.web.app')).t, 'welcome');
    assert.equal((await hello('https://garden-design.web.app.evil.example')).t, 'error');
  });

  test('malformed frames are answered, not fatal', async () => {
    const a = await join('ann');
    const state: DesignState[] = [];
    a.subscribe(() => state.push(a.getState()));
    (a as unknown as { ws: WebSocket }).ws.send('{"t":"cursor","story":"s","x":"no"}');
    await sleep(100);
    assert.equal(a.getState().status, 'online');
    a.close();
  });
});
