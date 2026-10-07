import { createHash } from 'node:crypto';
import type { Config } from './config.ts';
import type { Identity } from './auth.ts';
import { PROJECT_ROLES } from './roles.ts';
import type { ProjectRole } from './roles.ts';

export interface TeamMember {
  role: ProjectRole;
  /** GitHub login, when known. */
  login?: string;
}

/** Thrown when someone signed in but may not use this project's team server. */
export class AuthzError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Decides who belongs to the team. The server has no user database of its own: the repository is the source of truth. */
export interface Membership {
  resolve(identity: Identity, githubToken: string | undefined): Promise<TeamMember>;
}

interface RepoPermissions {
  admin?: boolean;
  maintain?: boolean;
  push?: boolean;
}

/** GitHub permission → role. Read-only access (triage/pull) does not make someone a team member. */
export function roleFromPermissions(p: RepoPermissions | undefined): ProjectRole | null {
  if (p?.admin) return 'founder';
  if (p?.maintain) return 'pm';
  if (p?.push) return 'frontend';
  return null;
}

const CACHE_MS = 5 * 60_000;
const DENY_CACHE_MS = 30_000;

/**
 * Membership = the user has push (or higher) access to the project's repository. The user's own GitHub token (from
 * the device flow the desktop app already runs) is used to ask GitHub, so the server holds no GitHub secret and
 * collaborators are managed purely on GitHub: invite them there and they are in; remove them and they are out
 * within a few minutes.
 */
export class GithubMembership implements Membership {
  private cache = new Map<string, { until: number; result: TeamMember | null }>();

  constructor(
    private repo: string,
    private fetchImpl: typeof fetch = fetch,
    private now: () => number = Date.now,
  ) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('PROJECT_REPO must be "owner/name"');
  }

  async resolve(identity: Identity, githubToken: string | undefined): Promise<TeamMember> {
    if (!githubToken) throw new AuthzError('github_required', 'Sign in to GitHub in Worktrees Studio to join this project.');
    const key = createHash('sha256').update(`${identity.uid}\0${githubToken}`).digest('hex');
    const hit = this.cache.get(key);
    const t = this.now();
    if (hit && hit.until > t) {
      if (!hit.result) throw new AuthzError('not_a_member', 'This GitHub account does not have write access to the project repository.');
      return hit.result;
    }
    const result = await this.lookup(githubToken);
    this.cache.set(key, { until: t + (result ? CACHE_MS : DENY_CACHE_MS), result });
    if (this.cache.size > 500) for (const [k, v] of this.cache) if (v.until < t) this.cache.delete(k);
    if (!result) throw new AuthzError('not_a_member', 'This GitHub account does not have write access to the project repository.');
    return result;
  }

  private async gh(path: string, token: string): Promise<Response> {
    return this.fetchImpl(`https://api.github.com${path}`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'worktrees-team-server' },
      signal: AbortSignal.timeout(8000),
    });
  }

  private async lookup(token: string): Promise<TeamMember | null> {
    const [repo, user] = await Promise.all([this.gh(`/repos/${this.repo}`, token), this.gh('/user', token)]);
    if (repo.status === 401 || user.status === 401) throw new AuthzError('github_token_invalid', 'Your GitHub sign-in expired. Sign in again.');
    if (repo.status === 404 || repo.status === 403) return null; // no access to a private repo looks like 404
    if (!repo.ok || !user.ok) throw new Error(`GitHub answered ${repo.status}/${user.status}`);
    const role = roleFromPermissions(((await repo.json()) as { permissions?: RepoPermissions }).permissions);
    if (!role) return null;
    const login = ((await user.json()) as { login?: unknown }).login;
    return { role, login: typeof login === 'string' ? login : undefined };
  }
}

/** Local development: the "GitHub token" is `dev:<role>` (a missing or malformed one is "not signed in to GitHub"). */
export class DevMembership implements Membership {
  async resolve(_identity: Identity, githubToken: string | undefined): Promise<TeamMember> {
    if (!githubToken) throw new AuthzError('github_required', 'Sign in to GitHub in Worktrees Studio to join this project.');
    const want = githubToken.replace(/^dev:/, '');
    if (!(PROJECT_ROLES as readonly string[]).includes(want)) throw new AuthzError('not_a_member', 'Unknown dev role.');
    return { role: want as ProjectRole };
  }
}

export function createMembership(cfg: Config): Membership {
  return cfg.devAuth ? new DevMembership() : new GithubMembership(cfg.repo);
}
