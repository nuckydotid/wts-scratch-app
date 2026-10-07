import type { MiddlewareHandler } from "hono";

export interface VerifiedUser {
  uid: string;
  email?: string;
  /** Custom claim `role` set with `bun run set-claims`. */
  role?: string;
}

export interface TokenVerifier {
  /** Returns the verified user, or throws. */
  verify(token: string): Promise<VerifiedUser>;
}

const ROLE_RE = /^[a-z][a-z0-9_-]{0,31}$/;
const roleOf = (v: unknown): string | undefined => (typeof v === "string" && ROLE_RE.test(v) ? v : undefined);

/** Firebase Auth ID tokens: RS256 signed by Google's securetoken service. */
export class FirebaseVerifier implements TokenVerifier {
  private jwks?: ReturnType<typeof import("jose").createRemoteJWKSet>;
  constructor(private projectId: string) {}
  async verify(token: string): Promise<VerifiedUser> {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    this.jwks ??= createRemoteJWKSet(
      new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
    );
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: `https://securetoken.google.com/${this.projectId}`,
      audience: this.projectId,
    });
    if (!payload.sub) throw new Error("token has no subject");
    return { uid: payload.sub, email: typeof payload.email === "string" ? payload.email : undefined, role: roleOf(payload.role) };
  }
}

/** `dev:<uid>[:<role>]` tokens for local development and tests only. */
export class DevVerifier implements TokenVerifier {
  async verify(token: string): Promise<VerifiedUser> {
    const m = /^dev:([A-Za-z0-9_-]{1,64})(?::([a-z][a-z0-9_-]{0,31}))?$/.exec(token);
    if (!m) throw new Error("bad dev token");
    return { uid: m[1], role: m[2] };
  }
}

export type AuthVars = { uid: string; email?: string; role?: string };

export const requireUser =
  (verifier: TokenVerifier): MiddlewareHandler<{ Variables: AuthVars }> =>
  async (c, next) => {
    const m = /^Bearer (.+)$/.exec(c.req.header("authorization") ?? "");
    if (!m) return c.json({ error: "unauthorized" }, 401);
    try {
      const u = await verifier.verify(m[1]);
      c.set("uid", u.uid);
      if (u.email) c.set("email", u.email);
      if (u.role) c.set("role", u.role);
    } catch {
      return c.json({ error: "unauthorized" }, 401);
    }
    await next();
  };

/** Run after `requireUser`: only users whose Firebase custom claim `role` is one of `roles`. */
export const requireRole =
  (...roles: string[]): MiddlewareHandler<{ Variables: AuthVars }> =>
  async (c, next) => {
    const role = c.get("role");
    if (!role || !roles.includes(role)) return c.json({ error: "forbidden" }, 403);
    await next();
  };

/** Constant-time comparison for the OTA publish token. */
export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}
