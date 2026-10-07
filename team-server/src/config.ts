/** Runtime configuration, all from environment variables (Cloud Run friendly). Provisioned by infra/terraform. */
const env = process.env;

const bool = (v: string | undefined, d = false) => (v === undefined ? d : /^(1|true|yes|on)$/i.test(v));
const list = (v: string | undefined) => (v ?? '').split(',').map((s) => s.trim()).filter(Boolean);

export interface Config {
  port: number;
  /** Accept `dev:<uid>:<name>` tokens and `dev:<role>` GitHub tokens (local development only). */
  devAuth: boolean;
  /** `memory` (no persistence) or `firestore`. */
  store: 'memory' | 'firestore';
  /** Firebase / GCP project that issues the sign-in tokens and holds Firestore. */
  firebaseProjectId: string;
  /** `owner/name` of the project's GitHub repository. Membership = push access to it. */
  repo: string;
  /** The project's design site (Firebase Hosting), allowed to open the design socket from a browser. */
  designUrl: string;
  allowedOrigins: string[];
  /** HMAC secret of the GitHub webhook (Secret Manager). Empty disables `/hooks/github`. */
  githubWebhookSecret: string;
  /** Audience CI's GitHub OIDC tokens must carry for `/hooks/ci` (this service's URL). */
  oidcAudience: string;
  maxPlayers: number;
}

export function loadConfig(): Config {
  const devAuth = bool(env.TEAM_DEV_AUTH, false);
  const firebaseProjectId = env.FIREBASE_PROJECT_ID ?? env.GOOGLE_CLOUD_PROJECT ?? '';
  return {
    port: Number(env.PORT ?? 8080),
    devAuth,
    store: (env.TEAM_STORE as Config['store'] | undefined) ?? (firebaseProjectId && !devAuth ? 'firestore' : 'memory'),
    firebaseProjectId,
    repo: env.PROJECT_REPO ?? '',
    designUrl: env.DESIGN_URL ?? '',
    allowedOrigins: list(env.ALLOWED_ORIGINS).length
      ? list(env.ALLOWED_ORIGINS)
      : ['tauri://localhost', 'http://tauri.localhost', 'https://tauri.localhost', 'http://localhost:1420', 'http://127.0.0.1:1420'],
    githubWebhookSecret: env.GITHUB_WEBHOOK_SECRET ?? '',
    oidcAudience: env.OIDC_AUDIENCE ?? env.PUBLIC_URL ?? 'team-server',
    maxPlayers: Number(env.MAX_PLAYERS ?? 100),
  };
}
