import { createHash } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTVerifyGetKey } from "jose";
import type { Config } from "./config.ts";

export interface Identity {
  uid: string;
  name?: string;
  email?: string;
  picture?: string;
}

export interface Authenticator {
  verify(token: string): Promise<Identity>;
}

const UID_RE = /^[A-Za-z0-9_:-]{1,128}$/;

/** `dev:<uid>:<name>` tokens — never enabled in production (TEAM_DEV_AUTH). */
export class DevAuthenticator implements Authenticator {
  async verify(token: string): Promise<Identity> {
    const m = /^dev:([A-Za-z0-9_-]{1,64}):?(.*)$/.exec(token);
    if (!m) throw new Error("invalid dev token");
    return { uid: `dev-${m[1]}`, name: m[2] || m[1] };
  }
}

const FIREBASE_JWKS =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

/**
 * Verifies Firebase Authentication ID tokens (Google sign-in) against Google's public keys: signature, issuer,
 * audience (the Firebase project) and expiry. No Admin SDK or service-account key is needed.
 */
export class FirebaseAuthenticator implements Authenticator {
  constructor(
    private projectId: string,
    /** Google's signing keys (cached by jose); tests pass a local key set. */
    private jwks: JWTVerifyGetKey = createRemoteJWKSet(new URL(FIREBASE_JWKS)),
  ) {
    if (!projectId)
      throw new Error("FIREBASE_PROJECT_ID is required unless TEAM_DEV_AUTH=1");
  }

  async verify(token: string): Promise<Identity> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: `https://securetoken.google.com/${this.projectId}`,
      audience: this.projectId,
    });
    const uid = String(payload.sub ?? "");
    if (!UID_RE.test(uid)) throw new Error("bad uid");
    return {
      uid,
      name: typeof payload.name === "string" ? payload.name : undefined,
      email:
        typeof payload.email === "string" && payload.email_verified !== false
          ? payload.email
          : undefined,
      picture:
        typeof payload.picture === "string" ? payload.picture : undefined,
    };
  }
}

/** Credential prefix for a GitHub identity: `github:<the user's GitHub access token>`. */
export const GITHUB_PREFIX = "github:";

// Classic (`gho_`, `ghp_`, `ghu_`), fine-grained (`github_pat_`) and legacy 40-hex tokens: letters, digits, underscore.
const GH_TOKEN_RE = /^[A-Za-z0-9_]{20,255}$/;

/**
 * Identity from GitHub: the user's own access token is checked against `GET /user` (a fixed GitHub host, so a
 * client-supplied token can never point the server anywhere else). Whether that person may join is a separate question
 * answered by the membership check. This is what lets the desktop app sign in with the GitHub login it already has, with
 * no per-project Google OAuth client. Results are cached briefly so a reconnect does not cost a GitHub call.
 */
/** The slice of `fetch` we use; a plain function satisfies it (Bun's `typeof fetch` also demands `preconnect`). */
export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export class GithubAuthenticator implements Authenticator {
  private cache = new Map<string, { id: Identity; until: number }>();

  constructor(
    private fetchImpl: FetchLike = fetch,
    private ttlMs = 5 * 60_000,
    private now: () => number = Date.now,
  ) {}

  async verify(token: string): Promise<Identity> {
    if (!token.startsWith(GITHUB_PREFIX))
      throw new Error("not a GitHub credential");
    const gh = token.slice(GITHUB_PREFIX.length);
    if (!GH_TOKEN_RE.test(gh)) throw new Error("malformed GitHub token");
    const key = createHash("sha256").update(gh).digest("hex");
    const hit = this.cache.get(key);
    if (hit && hit.until > this.now()) return hit.id;

    const res = await this.fetchImpl("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${gh}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "worktrees-team-server",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`GitHub rejected the token (${res.status})`);
    const u = (await res.json()) as {
      id?: unknown;
      login?: unknown;
      name?: unknown;
      avatar_url?: unknown;
    };
    if (typeof u.id !== "number" || !Number.isSafeInteger(u.id) || u.id <= 0)
      throw new Error("GitHub returned no user id");
    const id: Identity = {
      uid: `gh-${u.id}`,
      name:
        typeof u.name === "string" && u.name.trim()
          ? u.name.trim().slice(0, 80)
          : typeof u.login === "string"
            ? u.login.slice(0, 80)
            : undefined,
      picture:
        typeof u.avatar_url === "string" && u.avatar_url.startsWith("https://")
          ? u.avatar_url
          : undefined,
    };
    if (this.cache.size > 1000) this.cache.clear();
    this.cache.set(key, { id, until: this.now() + this.ttlMs });
    return id;
  }
}

/** `github:` credentials go to GitHub; anything else is a Firebase ID token (the design site's browser sign-in). */
export class CompositeAuthenticator implements Authenticator {
  constructor(
    private github: Authenticator,
    private firebase: Authenticator | null,
  ) {}

  verify(token: string): Promise<Identity> {
    if (token.startsWith(GITHUB_PREFIX)) return this.github.verify(token);
    if (!this.firebase)
      return Promise.reject(
        new Error("Firebase sign-in is not configured on this server"),
      );
    return this.firebase.verify(token);
  }
}

export function createAuthenticator(cfg: Config): Authenticator {
  if (cfg.devAuth) return new DevAuthenticator();
  return new CompositeAuthenticator(
    new GithubAuthenticator(),
    cfg.firebaseProjectId
      ? new FirebaseAuthenticator(cfg.firebaseProjectId)
      : null,
  );
}
