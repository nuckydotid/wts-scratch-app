import { createHmac, timingSafeEqual } from 'node:crypto';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { parseDesignVersion } from './shared/design/protocol.ts';
import type { DesignPrEvent } from './shared/design/protocol.ts';
import type { Config } from './config.ts';
import { sameDesignSite } from './design-access.ts';
import type { Design } from './office.ts';
import { log } from './log.ts';
import { TokenBucket } from './ratelimit.ts';

/**
 * Two server-to-server endpoints that keep the design room in sync with GitHub and CI:
 *
 *  - `POST /hooks/github` — repository webhook (`pull_request`), authenticated by `X-Hub-Signature-256` (HMAC of the raw body).
 *    Tells everyone in the design room when a pull request (for example Jules') opens, merges or closes.
 *  - `POST /hooks/ci` — called by the project's GitHub Actions with a GitHub OIDC token (no shared secret).
 *    The workflow reports `preview` (a Firebase preview-channel URL for a PR) and `live` (the site after a merge).
 *
 * Everything here is untrusted input: bodies are size-capped, schemas are checked, URLs must belong to the project's own
 * design site, and a repository that is not this project's gets the same quiet answer as one that is ignored.
 */

const MAX_BODY = 256 * 1024;

export interface OidcClaims {
  /** `owner/name` of the repository the workflow runs in. */
  repository: string;
  /** `refs/heads/main`, `refs/pull/12/merge`, … */
  ref: string;
  event_name?: string;
}

export interface OidcVerifier {
  verify(token: string, audience: string): Promise<OidcClaims>;
}

/** GitHub Actions OIDC: RS256 tokens from `token.actions.githubusercontent.com`, audience chosen by the workflow. */
export class GithubOidcVerifier implements OidcVerifier {
  private jwks = createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'));
  async verify(token: string, audience: string): Promise<OidcClaims> {
    const { payload } = await jwtVerify(token, this.jwks, { issuer: 'https://token.actions.githubusercontent.com', audience });
    if (typeof payload.repository !== 'string' || typeof payload.ref !== 'string') throw new Error('not a GitHub Actions token');
    return { repository: payload.repository, ref: payload.ref, event_name: typeof payload.event_name === 'string' ? payload.event_name : undefined };
  }
}

/** `X-Hub-Signature-256: sha256=<hex>` over the exact bytes GitHub sent. Constant-time. */
export function verifyGithubSignature(secret: string, raw: Buffer, header: string | undefined | null): boolean {
  if (!secret || !header?.startsWith('sha256=')) return false;
  const given = Buffer.from(header.slice('sha256='.length), 'hex');
  const want = createHmac('sha256', secret).update(raw).digest();
  return given.length === want.length && timingSafeEqual(given, want);
}

const REPO_RE = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Pull the fields we use out of a `pull_request` webhook payload, or null when it is not one we can act on. */
export function parsePullRequestEvent(body: unknown, now = Date.now()): { repo: string; event: DesignPrEvent } | null {
  if (!isObj(body) || !isObj(body.repository) || !isObj(body.pull_request)) return null;
  const repo = body.repository.full_name;
  const pr = body.pull_request;
  if (typeof repo !== 'string' || !REPO_RE.test(repo)) return null;
  const url = pr.html_url;
  if (!Number.isInteger(pr.number) || (pr.number as number) < 1 || typeof url !== 'string' || !url.startsWith('https://github.com/') || url.length > 300) return null;
  const state: DesignPrEvent['state'] = pr.merged === true ? 'merged' : pr.state === 'closed' ? 'closed' : 'open';
  const head = isObj(pr.head) && typeof pr.head.ref === 'string' ? pr.head.ref.slice(0, 200) : undefined;
  const title = typeof pr.title === 'string' ? pr.title.slice(0, 200) : undefined;
  return { repo, event: { pr: pr.number as number, url, state, branch: head, title, at: now } };
}

export interface HooksDeps {
  cfg: Pick<Config, 'githubWebhookSecret' | 'oidcAudience' | 'repo' | 'designUrl'>;
  design: Design;
  oidc?: OidcVerifier;
  now?: () => number;
}

export function createHooks(deps: HooksDeps) {
  const { cfg, design } = deps;
  const oidc = deps.oidc ?? new GithubOidcVerifier();
  const now = deps.now ?? Date.now;
  // One shared bucket: these endpoints are called by a handful of workflows, never by browsers.
  const bucket = new TokenBucket(40, 5);
  const isOurRepo = (repo: string) => !!cfg.repo && repo.toLowerCase() === cfg.repo.toLowerCase();

  const app = new Hono();
  app.all('/hooks/*', async (c, next) => {
    if (c.req.method !== 'POST') return c.json({ error: 'method_not_allowed' }, 405);
    if (!bucket.take()) return c.json({ error: 'rate_limited' }, 429);
    return next();
  });

  /** Body bytes, or null when it is larger than `max` (checked on the declared length first, then on the bytes read). */
  async function readRaw(c: Context, max: number): Promise<Buffer | null> {
    if (Number(c.req.header('content-length') ?? 0) > max) return null;
    const raw = Buffer.from(await c.req.arrayBuffer());
    return raw.length > max ? null : raw;
  }

  app.post('/hooks/github', async (c) => {
    if (!cfg.githubWebhookSecret) return c.json({ error: 'not_configured' }, 503);
    const raw = await readRaw(c, MAX_BODY);
    if (!raw) return c.json({ error: 'too_large' }, 413);
    if (!verifyGithubSignature(cfg.githubWebhookSecret, raw, c.req.header('x-hub-signature-256'))) return c.json({ error: 'bad_signature' }, 401);
    const event = c.req.header('x-github-event');
    if (event === 'ping') return c.json({ ok: true });
    if (event !== 'pull_request') return c.json({ ignored: true }, 202);
    let body: unknown;
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      return c.json({ error: 'bad_json' }, 400);
    }
    const parsed = parsePullRequestEvent(body, now());
    if (!parsed || !isOurRepo(parsed.repo)) return c.json({ ignored: true }, 202);
    (await design.get()).announcePr(parsed.event);
    return c.json({ ok: true });
  });

  app.post('/hooks/ci', async (c) => {
    const bearer = /^Bearer (.+)$/.exec(c.req.header('authorization') ?? '');
    if (!bearer) return c.json({ error: 'unauthorized' }, 401);
    let claims: OidcClaims;
    try {
      claims = await oidc.verify(bearer[1], cfg.oidcAudience);
    } catch (e) {
      log.warn('ci hook: oidc rejected', { err: String(e) });
      return c.json({ error: 'unauthorized' }, 401);
    }
    const raw = await readRaw(c, 16 * 1024);
    if (!raw) return c.json({ error: 'too_large' }, 413);
    let body: unknown;
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      return c.json({ error: 'bad_json' }, 400);
    }
    const input = isObj(body) ? { kind: body.event, url: body.url, sha: body.sha, pr: body.pr } : null;
    const version = parseDesignVersion(input, now());
    if (!version) return c.json({ error: 'bad_version' }, 400);

    if (!isOurRepo(claims.repository) || !cfg.designUrl) return c.json({ error: 'unknown_project' }, 404);

    // The URL shown to the whole team must be this project's own site (or one of its preview channels).
    const origin = new URL(version.url).origin;
    if (!sameDesignSite(origin, cfg.designUrl)) return c.json({ error: 'foreign_url' }, 400);
    if (version.kind === 'live') {
      // Live = the site itself, announced from a branch build (never from a pull request ref).
      if (origin !== new URL(cfg.designUrl).origin || !claims.ref.startsWith('refs/heads/')) return c.json({ error: 'not_live' }, 400);
    } else if (claims.event_name !== 'pull_request' && !claims.ref.startsWith('refs/pull/')) {
      return c.json({ error: 'not_a_pull_request' }, 400);
    }
    (await design.get()).announceVersion(version);
    return c.json({ ok: true });
  });

  return app;
}
