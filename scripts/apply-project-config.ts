/**
 * Applies project identity to the template (used by the Worktrees Studio onboarding wizard and by hand):
 *
 *   bun scripts/apply-project-config.ts --name "Pocket Garden" --bundle com.acme.garden --scheme garden \
 *       --primary "#2f9e44" [--gcp-project my-gcp] [--region us-central1] [--api-url https://api-xyz.run.app]
 *       [--firebase-api-key K --firebase-app-id ID --google-web-client-id X.apps.googleusercontent.com]
 *       [--onesignal-app-id UUID] [--studio-url https://studio.example.com --studio-project-id garden-ab12cd]
 *
 * Only `project.config.json` is rewritten; app.config.ts and the backend read it at build/run time.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const file = join(root, "project.config.json");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "app";

export function validateBundleId(id: string): boolean {
  return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(id);
}

const cfg = JSON.parse(readFileSync(file, "utf8"));
const name = arg("name");
if (name) {
  cfg.name = name.trim();
  cfg.slug = slugify(name);
  cfg.scheme = (arg("scheme") ?? cfg.slug.replace(/-/g, "")).toLowerCase();
}
const bundle = arg("bundle");
if (bundle) {
  if (!validateBundleId(bundle)) throw new Error(`Invalid bundle id: ${bundle} (expected e.g. com.acme.app)`);
  cfg.ios.bundleIdentifier = bundle;
  cfg.android.package = bundle;
}
const primary = arg("primary");
if (primary) {
  if (!/^#[0-9a-fA-F]{6}$/.test(primary)) throw new Error("--primary must be #RRGGBB");
  cfg.brand.primary = primary;
}
if (arg("gcp-project")) cfg.gcp.projectId = arg("gcp-project");
if (arg("firebase-api-key")) cfg.firebase.apiKey = arg("firebase-api-key");
if (arg("firebase-app-id")) cfg.firebase.appId = arg("firebase-app-id");
if (arg("google-web-client-id")) cfg.firebase.webClientId = arg("google-web-client-id");
if (arg("onesignal-app-id")) cfg.onesignal.appId = arg("onesignal-app-id");
if (arg("studio-url")) cfg.designRoom.studioUrl = arg("studio-url");
if (arg("studio-project-id")) cfg.designRoom.projectId = arg("studio-project-id");
if (arg("region")) cfg.gcp.region = arg("region");
if (arg("api-url")) cfg.api.url = arg("api-url");
if (arg("version")) cfg.version = arg("version");

writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
console.log(`project.config.json updated: ${cfg.name} (${cfg.ios.bundleIdentifier})`);
