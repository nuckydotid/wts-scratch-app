/**
 * Set the Firebase custom claim `role` for a user (the API reads it in `requireRole`).
 *
 *   bun run set-claims -- --uid <firebase-uid> --role admin [--project <gcp-project>]
 *
 * Uses Application Default Credentials (`gcloud auth application-default login`) against the Identity Toolkit admin API.
 * The user must sign in again (or refresh their ID token) to pick the new claim up.
 */
export const ROLE_RE = /^[a-z][a-z0-9_-]{0,31}$/;

export function parseArgs(argv: string[]): { uid: string; role: string; project?: string } {
  const get = (name: string) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const uid = get("--uid");
  const role = get("--role");
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new Error("--uid <firebase-uid> is required");
  if (!role || !ROLE_RE.test(role)) throw new Error("--role must be lowercase letters, digits, - or _ (max 32)");
  return { uid, role, project: get("--project") };
}

export const claimsBody = (uid: string, role: string) => ({ localId: uid, customAttributes: JSON.stringify({ role }) });

if (import.meta.main) {
  const { uid, role, project } = parseArgs(process.argv.slice(2));
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const projectId = project ?? process.env.GOOGLE_CLOUD_PROJECT ?? (await auth.getProjectId());
  const token = await auth.getAccessToken();
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(claimsBody(uid, role)),
  });
  if (!res.ok) throw new Error(`set-claims failed: ${res.status} ${await res.text()}`);
  console.log(`role "${role}" set for ${uid} in ${projectId}`);
}
