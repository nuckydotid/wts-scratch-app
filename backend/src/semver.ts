/** Canonical form for `native_id` keys: a leading v/V before a digit is stripped. */
export function normalizeNativeMarketingVersion(s: string): string {
  let t = s.trim();
  if (/^v\d/i.test(t)) t = t.slice(1).trimStart();
  return t;
}

/** Loose semver comparison for native marketing versions ("1.2.3", "10.0"). */
export function compareSemVer(a: string, b: string): number {
  const parse = (s: string): number[] =>
    normalizeNativeMarketingVersion(s)
      .split(".")
      .map((part) => {
        const num = Number.parseInt(/^(\d+)/.exec(part)?.[1] ?? "0", 10);
        return Number.isFinite(num) ? num : 0;
      });
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da < db) return -1;
    if (da > db) return 1;
  }
  return 0;
}

export const isValidNativeVersion = (s: string): boolean => /^\d+(\.\d+){0,3}$/.test(normalizeNativeMarketingVersion(s));
