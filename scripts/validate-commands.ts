#!/usr/bin/env bun
/**
 * validate-commands.ts — validates .manggis/commands.yaml
 *
 * Standalone mirror of the Manggis parser's validation rules. Keeps the
 * Research catalog honest without depending on the Manggis source tree.
 *
 * Usage: bun scripts/validate-commands.ts [path-to-config]
 * Exit 0 = valid, 1 = errors (printed with file + path context).
 */
import { readFileSync, existsSync } from "node:fs";
import { basename, dirname, resolve, join } from "node:path";
import { parse } from "yaml";

const CANDIDATES = [
  ".worktree/commands.yaml",
  ".worktree/commands.yml",
  "worktree.commands.yaml",
  ".worktree/commands.json",
  ".manggis/commands.yaml",
  ".manggis/commands.yml",
  "manggis.commands.yaml",
  ".manggis/commands.json",
];

// Tokens are 2+ chars to avoid matching single-letter strftime codes (%Y%m%d).
const TOKEN_RE = /%([a-zA-Z][a-zA-Z0-9]+)%/g;
const VAR_RE = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

type Errors = string[];

function findConfig(explicit?: string): string | null {
  if (explicit) return existsSync(explicit) ? resolve(explicit) : null;
  let dir = process.cwd();
  for (;;) {
    for (const c of CANDIDATES) {
      const p = join(dir, c);
      if (existsSync(p)) return p;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function collectTokens(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(TOKEN_RE)) out.push(m[1]);
  return out;
}

function collectVars(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(VAR_RE)) out.push(m[1]);
  return out;
}

/** Substitute built-in {{VARS}} in path-like strings before resolving. */
function resolveP(s: string, root: string, appRoot: string): string {
  const out = s
    .replace(/\{\{ROOT\}\}/g, root)
    .replace(/\{\{APP_ROOT\}\}/g, appRoot)
    .replace(/\{\{REPO\}\}/g, root);
  return resolve(root, out);
}

function validateUi(
  ui: Record<string, unknown>,
  ctx: string,
  declaredTokens: Set<string>,
  root: string,
  appRoot: string,
  errors: Errors,
  warnings: Errors,
): void {
  const type = ui.type;
  const shells: string[] = [];
  if (type === "shell") {
    shells.push(String(ui.shell ?? ""));
  } else if (type === "split") {
    const list = Array.isArray(ui.shells) ? ui.shells : [];
    if (list.length < 2) errors.push(`${ctx}: split requires >=2 shells`);
    for (const s of list)
      shells.push(String((s as { shell?: string }).shell ?? ""));
  } else if (type === "form") {
    const fields = Array.isArray(ui.fields) ? ui.fields : [];
    if (fields.length === 0) errors.push(`${ctx}: form requires >=1 field`);
    const fieldTokens = new Set<string>();
    const fieldValues: Record<string, string[]> = {};
    for (const f of fields) {
      const ff = f as Record<string, unknown>;
      if (!ff.token) errors.push(`${ctx}: field missing token`);
      else fieldTokens.add(String(ff.token));
      if (ff.kind === "select") {
        const opts = Array.isArray(ff.options) ? ff.options : [];
        if (opts.length < 2)
          errors.push(`${ctx}: select '${ff.token}' requires >=2 options`);
        fieldValues[String(ff.token)] = opts.map((o) =>
          String((o as { value?: unknown }).value),
        );
      }
    }
    if (ui.shell) shells.push(String(ui.shell));
    const cases = Array.isArray(ui.cases) ? ui.cases : [];
    for (const c of cases) {
      const cc = c as Record<string, unknown>;
      const when = (cc.when ?? {}) as Record<string, string>;
      for (const [k, v] of Object.entries(when)) {
        if (!fieldTokens.has(k))
          errors.push(`${ctx}: case references unknown field '${k}'`);
        else if (fieldValues[k] && !fieldValues[k].includes(v))
          errors.push(`${ctx}: case value '${v}' not in options of '${k}'`);
      }
      shells.push(String(cc.shell ?? ""));
    }
    const validation = ui.validation as Record<string, unknown> | undefined;
    if (validation) {
      if (!fieldTokens.has(String(validation.token)))
        errors.push(
          `${ctx}: validation.token '${validation.token}' is not a field`,
        );
    }
    const secret = ui.secretEnv as Record<string, unknown> | undefined;
    if (secret) {
      const file = resolveP(String(secret.file ?? ""), root, appRoot);
      if (!existsSync(file))
        warnings.push(`${ctx}: secretEnv.file not found: ${secret.file}`);
      if (
        !fieldTokens.has(String(secret.token)) &&
        !shells.some((s) => s.includes(`%${secret.token}%`))
      )
        errors.push(`${ctx}: secretEnv.token '${secret.token}' not used`);
    }
    // Every %token% in shells must be a field token, picker token, or secretEnv token.
    const allowed = new Set([...declaredTokens, ...fieldTokens]);
    if (secret) allowed.add(String(secret.token));
    for (const s of shells) {
      for (const t of collectTokens(s)) {
        if (!allowed.has(t))
          errors.push(
            `${ctx}: unknown token %${t}% (declared: ${[...allowed].join(", ") || "none"})`,
          );
      }
    }
  } else {
    errors.push(`${ctx}: unknown ui.type '${String(type)}'`);
  }
  for (const s of shells) {
    if (!s || !s.trim()) errors.push(`${ctx}: empty shell`);
  }
}

function validateConfig(
  configPath: string,
  errors: Errors,
  warnings: Errors,
): void {
  const parent = basename(dirname(configPath));
  const root =
    parent === ".worktree" || parent === ".manggis"
      ? dirname(dirname(configPath))
      : dirname(configPath);
  let doc: Record<string, unknown>;
  try {
    const raw = readFileSync(configPath, "utf8");
    doc = configPath.endsWith(".json")
      ? JSON.parse(raw)
      : (parse(raw) as Record<string, unknown>);
  } catch (e) {
    errors.push(`parse error: ${(e as Error).message}`);
    return;
  }
  if (doc.version !== 1)
    errors.push(`version must be 1 (got ${String(doc.version)})`);
  const apps = Array.isArray(doc.apps) ? doc.apps : [];
  if (apps.length === 0) errors.push("apps must be a non-empty array");
  const appIds = new Set(apps.map((a) => String((a as { id?: unknown }).id)));
  const generated = Array.isArray(doc.generated) ? doc.generated : [];
  const generatedIds = new Set(
    generated.map((g) => String((g as { id?: unknown }).id)),
  );

  for (const a of apps) {
    const app = a as Record<string, unknown>;
    const ctx = `app:${app.id}`;
    if (!app.id || !app.label || !app.root)
      errors.push(`${ctx}: id/label/root required`);
    const appRoot = resolve(root, String(app.root ?? ""));
    if (!existsSync(appRoot))
      errors.push(`${ctx}: root not found: ${app.root}`);
    const badge = app.badge as Record<string, unknown> | undefined;
    if (badge?.file) {
      const bf = resolveP(String(badge.file), root, appRoot);
      if (!existsSync(bf))
        warnings.push(`${ctx}: badge.file not found: ${badge.file}`);
    }
    const scopes = Array.isArray(app.scopes) ? app.scopes : [];
    for (const s of scopes) {
      const scope = s as Record<string, unknown>;
      const sctx = `${ctx}/scope:${scope.id}`;
      const pickers = Array.isArray(scope.pickers) ? scope.pickers : [];
      const pickerTokens = new Set(
        pickers.map((p) => String((p as { token?: unknown }).token)),
      );
      const groups = scope.groups;
      if (!groups) errors.push(`${sctx}: groups required`);
      // Walk nested group leaves.
      const walk = (node: unknown, path: string): void => {
        if (Array.isArray(node)) {
          for (const g of node) {
            const group = g as Record<string, unknown>;
            // In-place generated provider placeholder: { generated: id }
            if (typeof group.generated === "string") {
              if (!generatedIds.has(group.generated))
                errors.push(
                  `${sctx}${path}: unknown generated provider '${group.generated}'`,
                );
              continue;
            }
            if (!group.name || !Array.isArray(group.commands))
              errors.push(`${sctx}${path}: group requires name + commands`);
            for (const c of (group.commands as unknown[]) ?? []) {
              const cmd = c as Record<string, unknown>;
              const cctx = `${sctx}${path}/${group.name}/${String(cmd.title)}`;
              if (!cmd.title || !cmd.ui)
                errors.push(`${cctx}: title + ui required`);
              const ui = cmd.ui as Record<string, unknown>;
              // picker tokens are allowed in shell too
              const declared = new Set([...pickerTokens]);
              validateUi(ui, cctx, declared, root, appRoot, errors, warnings);
              if (cmd.cwd) {
                const cwd = resolveP(String(cmd.cwd), root, appRoot);
                if (!existsSync(cwd))
                  errors.push(`${cctx}: cwd not found: ${cmd.cwd}`);
              }
            }
          }
        } else if (node && typeof node === "object") {
          for (const [k, v] of Object.entries(node)) walk(v, `${path}/${k}`);
        }
      };
      walk(groups, "");
    }
  }

  for (const g of generated) {
    const gen = g as Record<string, unknown>;
    const gctx = `generated:${gen.id}`;
    const src = resolveP(String(gen.source ?? ""), root, root);
    if (!existsSync(src))
      warnings.push(`${gctx}: source not found: ${gen.source}`);
    for (const k of ["titleFrom", "groupName", "runAll", "run"] as const) {
      if (!gen[k]) errors.push(`${gctx}: ${k} required`);
    }
  }
}

const explicit = process.argv[2];
const configPath = findConfig(explicit);
if (!configPath) {
  console.error("No .worktree/commands.yaml found (searched upward from cwd).");
  process.exit(1);
}

const errors: Errors = [];
const warnings: Errors = [];
validateConfig(configPath, errors, warnings);
if (warnings.length > 0) {
  console.warn(`⚠ ${configPath}`);
  for (const w of warnings) console.warn(`  - ${w}`);
}
if (errors.length > 0) {
  console.error(`✖ ${configPath}`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✔ ${configPath} — valid${warnings.length > 0 ? ` (${warnings.length} warning${warnings.length > 1 ? "s" : ""})` : ""}`,
);
