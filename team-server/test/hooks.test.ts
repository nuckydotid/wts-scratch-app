import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { afterAll, beforeAll, describe, test } from 'bun:test';
import { DesignClient } from '../src/shared/design/client.ts';
import { loadConfig } from '../src/config.ts';
import { sameDesignSite } from '../src/design-access.ts';
import { parsePullRequestEvent, verifyGithubSignature } from '../src/hooks.ts';
import type { OidcClaims, OidcVerifier } from '../src/hooks.ts';
import { setSilent } from '../src/log.ts';
import { createTeamServer } from '../src/server.ts';
import type { TeamServer } from '../src/server.ts';
import { MemoryStore } from '../src/store.ts';
import { designHello } from './helpers.ts';

setSilent(true);

const SECRET = 'whsec_test';
const AUDIENCE = 'studio-test';
const SITE = 'https://garden-design.web.app';
const sig = (body: string) => 'sha256=' + createHmac('sha256', SECRET).update(body).digest('hex');

const until = async (pred: () => boolean, ms = 2000) => {
  const t = Date.now();
  while (!pred()) {
    if (Date.now() - t > ms) throw new Error('timed out waiting for condition');
    await new Promise((r) => setTimeout(r, 10));
  }
};

/** Stands in for GitHub's JWKS: the token string selects the claims. */
class FakeOidc implements OidcVerifier {
  async verify(token: string, audience: string): Promise<OidcClaims> {
    assert.equal(audience, AUDIENCE, 'the hook asks for its configured audience');
    const claims: Record<string, OidcClaims> = {
      'tok-pr': { repository: 'acme/garden', ref: 'refs/pull/7/merge', event_name: 'pull_request' },
      'tok-main': { repository: 'acme/garden', ref: 'refs/heads/main', event_name: 'push' },
      'tok-stranger': { repository: 'someone/else', ref: 'refs/heads/main', event_name: 'push' },
    };
    const c = claims[token];
    if (!c) throw new Error('invalid token');
    return c;
  }
}

describe('sameDesignSite', () => {
  const ok = (o: string) => sameDesignSite(o, SITE);
  test('the site itself and its Firebase preview channels', () => {
    assert.equal(ok('https://garden-design.web.app'), true);
    assert.equal(ok('https://garden-design--pr-7-abc123.web.app'), true);
    assert.equal(sameDesignSite('https://garden-design--pr-7-abc123.firebaseapp.com', 'https://garden-design.firebaseapp.com'), true);
  });
  test('look-alikes are rejected', () => {
    assert.equal(ok('https://garden-design--pr-7-abc123.web.app.evil.example'), false, 'suffix trick');
    assert.equal(ok('https://other-design--pr-7-abc123.web.app'), false, 'different site');
    assert.equal(ok('https://garden-design-pr-7.web.app'), false, 'needs the -- separator');
    assert.equal(ok('https://garden-design--.web.app'), false, 'empty channel');
    assert.equal(ok('http://garden-design--pr-7-abc123.web.app'), false, 'plain http');
    assert.equal(ok('https://garden-design--pr-7-abc123.web.app:8443'), false, 'port');
    assert.equal(ok('https://x.garden-design--pr-7.web.app'), false, 'extra label');
    assert.equal(ok('not a url'), false);
    assert.equal(sameDesignSite('https://garden-design--pr-7.web.app', undefined), false);
  });
  test('only Firebase Hosting domains have preview channels; other hosts need an exact origin', () => {
    assert.equal(sameDesignSite('https://design--pr-7.example.com', 'https://design.example.com'), false);
    assert.equal(sameDesignSite('https://design.example.com', 'https://design.example.com/app'), true);
  });
});

describe('webhook payloads', () => {
  test('signature: exact bytes, constant-time, rejects malformed headers', () => {
    const raw = Buffer.from('{"a":1}');
    assert.equal(verifyGithubSignature(SECRET, raw, sig('{"a":1}')), true);
    assert.equal(verifyGithubSignature(SECRET, raw, sig('{"a":2}')), false);
    assert.equal(verifyGithubSignature(SECRET, raw, undefined), false);
    assert.equal(verifyGithubSignature(SECRET, raw, 'sha256=zz'), false);
    assert.equal(verifyGithubSignature(SECRET, raw, 'sha1=abc'), false);
    assert.equal(verifyGithubSignature('', raw, sig('{"a":1}')), false, 'no secret configured → never valid');
  });
  test('pull_request parsing maps merged/closed/open and rejects junk', () => {
    const mk = (pr: object) => ({ repository: { full_name: 'acme/garden' }, pull_request: { number: 7, html_url: 'https://github.com/acme/garden/pull/7', state: 'open', head: { ref: 'jules/x' }, title: 'T', ...pr } });
    assert.equal(parsePullRequestEvent(mk({}))?.event.state, 'open');
    assert.equal(parsePullRequestEvent(mk({ state: 'closed' }))?.event.state, 'closed');
    assert.equal(parsePullRequestEvent(mk({ state: 'closed', merged: true }))?.event.state, 'merged');
    assert.equal(parsePullRequestEvent(mk({ html_url: 'https://evil.example/x' })), null);
    assert.equal(parsePullRequestEvent(mk({ number: 0 })), null);
    assert.equal(parsePullRequestEvent({ repository: { full_name: '../x' }, pull_request: {} }), null);
    assert.equal(parsePullRequestEvent(null), null);
  });
});

describe('hooks over HTTP', () => {
  let server: TeamServer;
  let http = '';
  let wsUrl = '';
  const pid = 'main';
  const clients: DesignClient[] = [];

  const join = async (uid: string) => {
    const c = new DesignClient({ url: wsUrl, projectId: pid, name: uid, getToken: () => `dev:${uid}:${uid}`, getGithubToken: () => 'dev:founder', reconnect: false, cursorIntervalMs: 0, viewIntervalMs: 0 });
    clients.push(c);
    c.connect();
    await until(() => c.getState().status === 'online' || c.getState().status === 'closed');
    return c;
  };
  const github = (body: string, headers: Record<string, string> = {}) =>
    fetch(`${http}/hooks/github`, { method: 'POST', headers: { 'x-hub-signature-256': sig(body), 'x-github-event': 'pull_request', 'content-type': 'application/json', ...headers }, body });
  const ci = (token: string | null, body: unknown) =>
    fetch(`${http}/hooks/ci`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  const prPayload = (over: object = {}) =>
    JSON.stringify({ action: 'opened', repository: { full_name: 'Acme/Garden' }, pull_request: { number: 7, html_url: 'https://github.com/acme/garden/pull/7', state: 'open', head: { ref: 'jules/restyle-1' }, title: 'Restyle', ...over } });

  beforeAll(async () => {
    const cfg = { ...loadConfig(), devAuth: true, store: 'memory' as const, repo: 'acme/garden', designUrl: SITE, allowedOrigins: [], githubWebhookSecret: SECRET, oidcAudience: AUDIENCE };
    server = createTeamServer({ cfg, store: new MemoryStore(), oidc: new FakeOidc() });
    const port = await server.listen(0);
    http = `http://127.0.0.1:${port}`;
    wsUrl = `ws://127.0.0.1:${port}/design`;
  });
  afterAll(async () => {
    for (const c of clients) c.close();
    await server.close();
  });

  describe('POST /hooks/github', () => {
    test('rejects a bad or missing signature and non-POST', async () => {
      const body = prPayload();
      assert.equal((await github(body, { 'x-hub-signature-256': 'sha256=' + '0'.repeat(64) })).status, 401);
      assert.equal((await fetch(`${http}/hooks/github`, { method: 'POST', body })).status, 401);
      assert.equal((await fetch(`${http}/hooks/github`)).status, 405);
    });

    test('ping is acknowledged; other events and unknown repositories are quietly ignored', async () => {
      assert.equal((await github('{}', { 'x-github-event': 'ping' })).status, 200);
      assert.equal((await github('{}', { 'x-github-event': 'push' })).status, 202);
      const unknown = await github(JSON.stringify({ repository: { full_name: 'nobody/nothing' }, pull_request: { number: 1, html_url: 'https://github.com/nobody/nothing/pull/1', state: 'open' } }));
      assert.equal(unknown.status, 202);
      assert.deepEqual(await unknown.json(), { ignored: true });
    });

    test('a PR opening and merging reaches everyone in the room', async () => {
      const a = await join('ann');
      assert.equal((await github(prPayload())).status, 200);
      await until(() => a.getState().prs.length === 1);
      assert.deepEqual([a.getState().prs[0].pr, a.getState().prs[0].state, a.getState().prs[0].branch], [7, 'open', 'jules/restyle-1']);
      assert.equal((await github(prPayload({ state: 'closed', merged: true }))).status, 200);
      await until(() => a.getState().prs[0].state === 'merged');
      assert.equal(a.getState().prs.length, 1, 'same PR replaces its earlier event');
      a.close();
    });

    test('oversized bodies are refused', async () => {
      assert.equal((await github('x'.repeat(300 * 1024))).status, 413);
    });
  });

  describe('POST /hooks/ci', () => {
    const preview = { event: 'preview', url: 'https://garden-design--pr-7-abc123.web.app', sha: 'a1b2c3d', pr: 7 };

    test('needs a valid GitHub OIDC token', async () => {
      assert.equal((await ci(null, preview)).status, 401);
      assert.equal((await ci('garbage', preview)).status, 401);
    });

    test('a preview from a pull request is announced and remembered for late joiners', async () => {
      const a = await join('ann');
      assert.equal((await ci('tok-pr', preview)).status, 200);
      await until(() => a.getState().previews.length === 1);
      assert.equal(a.getState().previews[0].url, 'https://garden-design--pr-7-abc123.web.app/');
      assert.equal(a.getState().previews[0].pr, 7);
      const late = await join('ann');
      assert.equal(late.getState().previews.length, 1, 'welcome carries open previews');
      a.close();
      late.close();
    });

    test('live deployments come from branch builds on the project’s own site', async () => {
      const a = await join('ann');
      const live = { event: 'live', url: SITE, sha: 'deadbeef' };
      assert.equal((await ci('tok-main', live)).status, 200);
      await until(() => a.getState().live?.sha === 'deadbeef');
      assert.equal(a.getState().previews.length, 1, 'a different commit does not clear the open preview');
      assert.equal((await ci('tok-pr', live)).status, 400, 'a pull request ref cannot announce the live site');
      assert.equal((await ci('tok-main', { ...live, url: preview.url })).status, 400, 'live must be the site itself');
      const late = await join('ann');
      assert.equal(late.getState().live?.sha, 'deadbeef');
      a.close();
      late.close();
    });

    test('rejects URLs outside the project’s site, unknown repositories and malformed bodies', async () => {
      assert.equal((await ci('tok-pr', { ...preview, url: 'https://evil.web.app' })).status, 400);
      assert.equal((await ci('tok-pr', { ...preview, url: 'https://other-design--pr-7-abc123.web.app' })).status, 400);
      assert.equal((await ci('tok-pr', { ...preview, url: 'http://garden-design--pr-7-abc123.web.app' })).status, 400);
      assert.equal((await ci('tok-stranger', preview)).status, 404);
      assert.equal((await ci('tok-pr', { ...preview, sha: 'not a sha' })).status, 400);
      assert.equal((await ci('tok-pr', { ...preview, pr: undefined })).status, 400, 'a preview needs its PR number');
      assert.equal((await ci('tok-pr', '{nope')).status, 400);
    });

    test('a merged PR drops its preview', async () => {
      const a = await join('ann');
      await until(() => a.getState().previews.length === 1);
      assert.equal((await github(prPayload({ state: 'closed', merged: true }))).status, 200);
      await until(() => a.getState().previews.length === 0);
      a.close();
    });
  });

  test('a browser on a preview channel of the project’s site may join the room; look-alikes may not', async () => {
    const hello = (origin: string) => designHello(wsUrl, origin, { token: 'dev:ann:ann', projectId: pid, name: 'ann', github: 'dev:founder' });
    assert.equal((await hello('https://garden-design--pr-7-abc123.web.app')).t, 'welcome');
    assert.equal((await hello('https://garden-design--pr-7-abc123.web.app.evil.example')).t, 'error');
    assert.equal((await hello('https://other-design--pr-7-abc123.web.app')).t, 'error');
  });
});

describe('hooks are off without configuration', () => {
  test('/hooks/github answers 503 when no webhook secret is set', async () => {
    const cfg = { ...loadConfig(), devAuth: true, store: 'memory' as const, githubWebhookSecret: '' };
    const s = createTeamServer({ cfg, store: new MemoryStore(), oidc: new FakeOidc() });
    const port = await s.listen(0);
    const res = await fetch(`http://127.0.0.1:${port}/hooks/github`, { method: 'POST', body: '{}' });
    assert.equal(res.status, 503);
    await s.close();
  });
});
