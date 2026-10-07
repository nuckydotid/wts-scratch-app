import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const ROOT_NODE_MODULES = join(ROOT, "node_modules");
const SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
] as const;

function link(target: string, linkPath: string): boolean {
  try {
    if (existsSync(linkPath)) {
      rmSync(linkPath, { recursive: true, force: true });
    }
    mkdirSync(dirname(linkPath), { recursive: true });
    symlinkSync(relative(dirname(linkPath), target), linkPath);
    return true;
  } catch {
    return false;
  }
}

function dependencyNames(pkg: Record<string, unknown>): string[] {
  const names = new Set<string>();
  for (const section of SECTIONS) {
    const deps = pkg[section];
    if (!deps || typeof deps !== "object") continue;
    for (const name of Object.keys(deps as Record<string, unknown>)) {
      names.add(name);
    }
  }
  return [...names].sort();
}

function linkWorkspace(workspaceFile: string): void {
  const workspaceDir = dirname(join(ROOT, workspaceFile));
  const pkg = JSON.parse(
    readFileSync(join(ROOT, workspaceFile), "utf8"),
  ) as Record<string, unknown>;
  const nodeModules = join(workspaceDir, "node_modules");
  let linked = 0;
  let bins = 0;

  for (const name of dependencyNames(pkg)) {
    const target = join(ROOT_NODE_MODULES, name);
    if (!existsSync(target)) continue;
    if (link(target, join(nodeModules, name))) linked += 1;

    const manifest = join(target, "package.json");
    if (!existsSync(manifest)) continue;
    const dep = JSON.parse(readFileSync(manifest, "utf8")) as {
      name?: string;
      bin?: string | Record<string, string>;
    };
    const bin =
      typeof dep.bin === "string"
        ? { [dep.name?.split("/").pop() ?? name]: dep.bin }
        : (dep.bin ?? {});
    for (const [binName, binPath] of Object.entries(bin)) {
      const binTarget = join(target, binPath);
      if (!existsSync(binTarget)) continue;
      if (link(binTarget, join(nodeModules, ".bin", binName))) bins += 1;
    }
  }
  console.log(
    `linked ${relative(ROOT, workspaceDir)}: ${linked} packages, ${bins} bins`,
  );
}

const glob = new Bun.Glob("{apps,packages,modules,flows}/*/package.json");
const workspaceFiles = [...glob.scanSync({ cwd: ROOT })].sort();

for (const workspaceFile of workspaceFiles) {
  linkWorkspace(workspaceFile);
}
console.log(
  `workspace links ready (${workspaceFiles.length} workspaces, hoisted layout)`,
);
