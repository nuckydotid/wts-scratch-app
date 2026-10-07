/** Runtime configuration (all from environment variables; see backend/README.md). */
export interface Env {
  port: number;
  /** GCP / Firebase project id (also the expected Firebase ID-token audience). */
  projectId: string;
  /** Accept `dev:<uid>` bearer tokens. Never set in production. */
  authDev: boolean;
  /** Postgres connection string (Cloud SQL). Empty → embedded PGlite (dev/tests). */
  databaseUrl: string;
  /** GCS bucket for uploads + OTA bundles. Empty → in-memory storage (dev/tests). */
  bucket: string;
  /** Static token the publish scripts use for /api/ota/upload (Secret Manager in production). */
  otaScriptToken: string;
  signedUrlTtlSec: number;
  /** OneSignal REST credentials (API key from Secret Manager). Empty → pushes are logged, not sent. */
  oneSignalAppId: string;
  oneSignalApiKey: string;
  /** Public URL of this service (the OIDC audience Cloud Scheduler uses) and the Scheduler job's service account. */
  serviceUrl: string;
  schedulerServiceAccount: string;
  /** Delete chat messages older than N days (0 = keep). */
  chatRetentionDays: number;
  /** Comma-separated browser origins for CORS (`CORS_ORIGINS`). Empty = none (dev mode allows all). */
  corsOrigins: string[];
}

export function loadEnv(src: Record<string, string | undefined> = process.env): Env {
  const projectId = src.GOOGLE_CLOUD_PROJECT ?? src.GCLOUD_PROJECT ?? "";
  return {
    port: Number(src.PORT ?? 8080),
    projectId,
    authDev: /^(1|true)$/i.test(src.AUTH_DEV ?? ""),
    databaseUrl: src.DATABASE_URL ?? "",
    bucket: src.OTA_BUCKET ?? src.BUCKET ?? "",
    otaScriptToken: src.OTA_SCRIPT_TOKEN ?? "",
    signedUrlTtlSec: Number(src.SIGNED_URL_TTL_SEC ?? 900),
    oneSignalAppId: src.ONESIGNAL_APP_ID ?? "",
    oneSignalApiKey: src.ONESIGNAL_API_KEY ?? "",
    serviceUrl: src.SERVICE_URL ?? "",
    schedulerServiceAccount: src.SCHEDULER_SA_EMAIL ?? "",
    chatRetentionDays: Number(src.CHAT_RETENTION_DAYS ?? 0),
    corsOrigins: (src.CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
  };
}
