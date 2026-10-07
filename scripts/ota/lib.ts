import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const root = resolve(import.meta.dir, "..", "..");

export interface ProjectConfig {
  version: string;
  slug: string;
  gcp: { projectId: string; region: string };
  api: { url: string };
  ota: { enabled: boolean; channel: string; urls?: Record<string, string> };
}

export const loadProjectConfig = (): ProjectConfig => JSON.parse(readFileSync(join(root, "project.config.json"), "utf8"));

/** Reads KEY=value pairs from an untracked env file (never committed). */
function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
  return out;
}

export function otaTarget(channel = process.env.OTA_CHANNEL ?? "staging") {
  const cfg = loadProjectConfig();
  const env = { ...readEnvFile(join(root, ".env.ota")), ...process.env } as Record<string, string | undefined>;
  const url = (env.OTA_SERVICE_URL ?? cfg.ota.urls?.[channel] ?? cfg.api.url).replace(/\/$/, "");
  const token = env.OTA_SCRIPT_TOKEN ?? "";
  if (!token) throw new Error("OTA_SCRIPT_TOKEN is not set (put it in .env.ota or export it; it lives in Secret Manager as <slug>-ota-token).");
  return { cfg, url, token, channel };
}

export async function api<T = unknown>(url: string, token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...(init.body && !(init.body instanceof FormData) ? { "content-type": "application/json" } : {}), ...(init.headers ?? {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}
