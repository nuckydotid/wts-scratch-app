import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTVerifyGetKey } from 'jose';
import type { Config } from './config.ts';

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
    if (!m) throw new Error('invalid dev token');
    return { uid: `dev-${m[1]}`, name: m[2] || m[1] };
  }
}

const FIREBASE_JWKS = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

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
    if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required unless TEAM_DEV_AUTH=1');
  }

  async verify(token: string): Promise<Identity> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: `https://securetoken.google.com/${this.projectId}`,
      audience: this.projectId,
    });
    const uid = String(payload.sub ?? '');
    if (!UID_RE.test(uid)) throw new Error('bad uid');
    return {
      uid,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      email: typeof payload.email === 'string' && payload.email_verified !== false ? payload.email : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    };
  }
}

export function createAuthenticator(cfg: Config): Authenticator {
  return cfg.devAuth ? new DevAuthenticator() : new FirebaseAuthenticator(cfg.firebaseProjectId);
}
