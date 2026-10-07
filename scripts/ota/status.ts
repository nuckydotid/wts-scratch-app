/** List published OTA bundles, or roll one back: bun scripts/ota/status.ts [--disable <native> <bundleId>] [--enable <native> <bundleId>] */
import { api, otaTarget } from "./lib.ts";

const { url, token, channel } = otaTarget();
const i = process.argv.findIndex((a) => a === "--disable" || a === "--enable");
if (i >= 0) {
  const [native, id] = [process.argv[i + 1], process.argv[i + 2]];
  await api(url, token, `/api/ota/bundles/${encodeURIComponent(native)}/${Number(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ disabled: process.argv[i] === "--disable" }),
  });
  console.log(`${process.argv[i].slice(2)}d bundle ${native}#${id}`);
}
const { bundles } = await api<{ bundles: { bundle_id: number; native_id: string; published_at: string; has_android: boolean; has_ios: boolean; disabled: boolean }[] }>(
  url,
  token,
  "/api/ota/bundles",
);
console.log(`OTA bundles on ${channel} (${url})`);
for (const b of bundles) console.log(`  ${b.native_id}#${b.bundle_id}  ${b.published_at}  android=${b.has_android} ios=${b.has_ios}${b.disabled ? "  DISABLED" : ""}`);
if (bundles.length === 0) console.log("  (none)");
