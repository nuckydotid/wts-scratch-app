import { Hono } from "hono";
import { timingSafeEqual } from "./auth.ts";

/** Cloud Scheduler calls `/internal/cron/<task>` with an OIDC token minted for a dedicated service account. */
export interface SchedulerVerifier {
  verify(token: string): Promise<void>;
}

export class GoogleSchedulerVerifier implements SchedulerVerifier {
  private jwks?: ReturnType<typeof import("jose").createRemoteJWKSet>;
  /** @param audience the URL configured on the Scheduler job (the service URL); @param serviceAccountEmail the job's SA. */
  constructor(
    private audience: string,
    private serviceAccountEmail: string,
  ) {}
  async verify(token: string) {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    this.jwks ??= createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: this.audience,
    });
    if (payload.email_verified !== true || payload.email !== this.serviceAccountEmail) throw new Error("not the scheduler service account");
  }
}

/** Local/dev only: a fixed bearer token. */
export class DevSchedulerVerifier implements SchedulerVerifier {
  async verify(token: string) {
    if (!timingSafeEqual(token, "dev-scheduler")) throw new Error("bad dev scheduler token");
  }
}

export type CronTasks = Record<string, () => Promise<unknown>>;

export function internalRoutes(deps: { verifier: SchedulerVerifier; tasks: CronTasks }) {
  return new Hono().post("/cron/:task", async (c) => {
    const m = /^Bearer (.+)$/.exec(c.req.header("authorization") ?? "");
    if (!m) return c.json({ error: "unauthorized" }, 401);
    try {
      await deps.verifier.verify(m[1]);
    } catch {
      return c.json({ error: "unauthorized" }, 401);
    }
    const name = c.req.param("task");
    const run = Object.hasOwn(deps.tasks, name) ? deps.tasks[name] : undefined;
    if (!run) return c.json({ error: "unknown_task" }, 404);
    return c.json({ task: name, result: await run() });
  });
}
