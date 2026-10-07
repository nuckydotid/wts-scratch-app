import assert from 'node:assert/strict';
import { describe, test } from 'bun:test';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { DevAuthenticator, FirebaseAuthenticator } from '../src/auth.ts';
import { GithubMembership, roleFromPermissions } from '../src/membership.ts';
import type { TeamMember } from '../src/membership.ts';

const PROJECT = 'garden-prod';

async function firebaseFixture() {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const { privateKey: otherKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
  const auth = new FirebaseAuthenticator(PROJECT, createLocalJWKSet({ keys: [jwk] }));
  const sign = (claims: Record<string, unknown>, o: { key?: CryptoKey; iss?: string; aud?: string; exp?: string; kid?: string } = {}) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: o.kid ?? 'k1' })
      .setIssuer(o.iss ?? `https://securetoken.google.com/${PROJECT}`)
      .setAudience(o.aud ?? PROJECT)
      .setSubject('uid-1')
      .setIssuedAt()
      .setExpirationTime(o.exp ?? '1h')
      .sign(o.key ?? privateKey);
  return { auth, sign, otherKey };
}

describe('FirebaseAuthenticator', () => {
  test('accepts a token from the project and reads the profile', async () => {
    const { auth, sign } = await firebaseFixture();
    const id = await auth.verify(await sign({ name: 'Ann', email: 'ann@example.com', email_verified: true, picture: 'https://x/y.png' }));
    assert.deepEqual(id, { uid: 'uid-1', name: 'Ann', email: 'ann@example.com', picture: 'https://x/y.png' });
  });

  test('drops an unverified email', async () => {
    const { auth, sign } = await firebaseFixture();
    assert.equal((await auth.verify(await sign({ email: 'a@b.c', email_verified: false }))).email, undefined);
  });

  test('rejects wrong project, wrong issuer, expired, forged and garbage tokens', async () => {
    const { auth, sign, otherKey } = await firebaseFixture();
    await assert.rejects(auth.verify(await sign({}, { aud: 'other-project' })));
    await assert.rejects(auth.verify(await sign({}, { iss: 'https://securetoken.google.com/other-project' })));
    await assert.rejects(auth.verify(await sign({}, { iss: 'https://evil.example' })));
    await assert.rejects(auth.verify(await sign({}, { exp: '-1m' })));
    await assert.rejects(auth.verify(await sign({}, { key: otherKey })), 'signed by a key Google does not publish');
    await assert.rejects(auth.verify('not-a-jwt'));
  });

  test('refuses to run without a project id', () => {
    assert.throws(() => new FirebaseAuthenticator(''));
  });
});

describe('DevAuthenticator', () => {
  test('parses dev tokens and rejects anything else', async () => {
    assert.deepEqual(await new DevAuthenticator().verify('dev:ann:Ann B'), { uid: 'dev-ann', name: 'Ann B' });
    await assert.rejects(new DevAuthenticator().verify('ann'));
  });
});

describe('roleFromPermissions', () => {
  test('admin → founder, maintain → pm, push → frontend; read-only is not a member', () => {
    assert.equal(roleFromPermissions({ admin: true, push: true }), 'founder');
    assert.equal(roleFromPermissions({ maintain: true, push: true }), 'pm');
    assert.equal(roleFromPermissions({ push: true }), 'frontend');
    assert.equal(roleFromPermissions({ pull: true } as never), null);
    assert.equal(roleFromPermissions(undefined), null);
  });
});

describe('GithubMembership', () => {
  const ann = { uid: 'u1' };
  /** Fake GitHub: token → repo permissions + login. */
  function fakeGithub(table: Record<string, { permissions?: object; login?: string; repoStatus?: number }>) {
    const calls: string[] = [];
    const impl = (async (url: string, init: RequestInit) => {
      const token = String((init.headers as Record<string, string>).authorization).replace('Bearer ', '');
      calls.push(`${new URL(url).pathname} ${token}`);
      const row = table[token];
      if (!row) return new Response('{}', { status: 401 });
      if (new URL(url).pathname === '/user') return Response.json({ login: row.login });
      if (row.repoStatus) return new Response('{}', { status: row.repoStatus });
      return Response.json({ permissions: row.permissions });
    }) as unknown as typeof fetch;
    return { impl, calls };
  }

  test('asks GitHub with the user’s own token and maps permissions to roles', async () => {
    const gh = fakeGithub({ t_admin: { permissions: { admin: true, push: true }, login: 'owner' }, t_push: { permissions: { push: true }, login: 'friend' } });
    const m = new GithubMembership('acme/garden', gh.impl);
    assert.deepEqual(await m.resolve(ann, 't_admin'), { role: 'founder', login: 'owner' });
    assert.deepEqual(await m.resolve(ann, 't_push'), { role: 'frontend', login: 'friend' });
    assert.ok(gh.calls.includes('/repos/acme/garden t_admin'));
  });

  test('read-only collaborators, strangers and private-repo 404s are refused', async () => {
    const gh = fakeGithub({
      t_read: { permissions: { pull: true }, login: 'reader' },
      t_none: { permissions: undefined, login: 'x' },
      t_404: { repoStatus: 404, login: 'y' },
    });
    const m = new GithubMembership('acme/garden', gh.impl);
    for (const t of ['t_read', 't_none', 't_404']) await assert.rejects(m.resolve(ann, t), { code: 'not_a_member' });
  });

  test('missing or invalid GitHub tokens have their own errors', async () => {
    const m = new GithubMembership('acme/garden', fakeGithub({}).impl);
    await assert.rejects(m.resolve(ann, undefined), { code: 'github_required' });
    await assert.rejects(m.resolve(ann, 'revoked'), { code: 'github_token_invalid' });
  });

  test('results are cached for a few minutes, so a removal takes effect soon but not instantly', async () => {
    let now = 1_000_000;
    const table: Record<string, { permissions?: object; login?: string }> = { tok: { permissions: { push: true }, login: 'friend' } };
    const gh = fakeGithub(table);
    const m = new GithubMembership('acme/garden', gh.impl, () => now);
    await m.resolve(ann, 'tok');
    const first = gh.calls.length;
    await m.resolve(ann, 'tok');
    assert.equal(gh.calls.length, first, 'second join is served from cache');
    table.tok = { permissions: { pull: true }, login: 'friend' }; // removed from the repo
    now += 60_000;
    assert.equal(((await m.resolve(ann, 'tok')) as TeamMember).role, 'frontend', 'still cached after 1 minute');
    now += 5 * 60_000;
    await assert.rejects(m.resolve(ann, 'tok'), { code: 'not_a_member' });
  });

  test('a token is bound to the uid that first presented it for caching', async () => {
    const gh = fakeGithub({ tok: { permissions: { push: true }, login: 'friend' } });
    const m = new GithubMembership('acme/garden', gh.impl);
    await m.resolve({ uid: 'a' }, 'tok');
    const before = gh.calls.length;
    await m.resolve({ uid: 'b' }, 'tok');
    assert.ok(gh.calls.length > before, 'a different user is checked afresh');
  });

  test('PROJECT_REPO must look like owner/name', () => {
    assert.throws(() => new GithubMembership('not a repo'));
    assert.throws(() => new GithubMembership(''));
  });
});
