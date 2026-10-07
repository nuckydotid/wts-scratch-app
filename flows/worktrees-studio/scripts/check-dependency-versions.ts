import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export interface PackageSource {
  path: string;
  json: Record<string, unknown>;
}

export interface VersionViolation {
  name: string;
  specs: { spec: string; files: string[] }[];
}

const SECTIONS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const;

const EXEMPT_PREFIXES = [
  "workspace:",
  "file:",
  "link:",
  "portal:",
  "catalog:",
] as const;

const ALLOWED_MISMATCHES: Record<string, string> = {};

export function inspectPackageVersions(
  packages: PackageSource[],
): VersionViolation[] {
  const byName = new Map<string, Map<string, string[]>>();
  for (const pkg of packages) {
    for (const section of SECTIONS) {
      const deps = pkg.json[section];
      if (!deps || typeof deps !== "object") continue;
      for (const [name, value] of Object.entries(
        deps as Record<string, unknown>,
      )) {
        if (typeof value !== "string") continue;
        if (
          value === "*" ||
          EXEMPT_PREFIXES.some((prefix) => value.startsWith(prefix))
        ) {
          continue;
        }
        const specs = byName.get(name) ?? new Map<string, string[]>();
        const files = specs.get(value) ?? [];
        files.push(pkg.path);
        specs.set(value, files);
        byName.set(name, specs);
      }
    }
  }
  const violations: VersionViolation[] = [];
  for (const [name, specs] of byName) {
    if (specs.size > 1 && !ALLOWED_MISMATCHES[name]) {
      violations.push({
        name,
        specs: [...specs].map(([spec, files]) => ({
          spec,
          files: [...new Set(files)].sort(),
        })),
      });
    }
  }
  return violations.sort((a, b) => a.name.localeCompare(b.name));
}

export function discoverPackageJsonFiles(root: string): string[] {
  const glob = new Bun.Glob("{apps,packages,modules,flows}/*/package.json");
  const files = [...glob.scanSync({ cwd: root })].map((file) =>
    join(root, file),
  );
  files.push(join(root, "package.json"));
  return [...new Set(files)].sort();
}

function readPackages(root: string): PackageSource[] {
  const packages: PackageSource[] = [];
  for (const file of discoverPackageJsonFiles(root)) {
    if (!existsSync(file)) continue;
    try {
      packages.push({
        path: relative(root, file),
        json: JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>,
      });
    } catch (error) {
      throw new Error(`cannot parse ${relative(root, file)}: ${String(error)}`);
    }
  }
  return packages;
}

function main(): void {
  const root = resolve(import.meta.dir, "..", "..", "..");
  const violations = inspectPackageVersions(readPackages(root));
  if (violations.length === 0) {
    console.log(
      "check:deps ok — every workspace shares one version per dependency",
    );
    return;
  }
  console.error(
    `check:deps failed — ${violations.length} dependency(ies) use different versions:`,
  );
  for (const violation of violations) {
    console.error(`\n${violation.name}:`);
    for (const { spec, files } of violation.specs) {
      console.error(`  ${spec}  <- ${files.join(", ")}`);
    }
  }
  console.error(
    "\nUnify the specs in package.json (no cross-workspace drift).",
  );
  process.exit(1);
}

if (import.meta.main) {
  main();
}
