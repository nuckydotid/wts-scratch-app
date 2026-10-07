# Tauri v2 — Capabilities, Permissions, Scopes, CSP

> Distilled from `raw/security-capabilities.md`, `raw/security-permissions.md`, `raw/security-csp.md`, `raw/security-scope.md`. This is the must-read before writing any backend command.

## Mental model

Nothing is allowed by default. A **capability** file grants specific **permissions** (optionally narrowed by **scope**) to specific **windows/webviews**. Ship one capability per surface:

```
src-tauri/capabilities/
  main.json       # main window: core + shell (scoped) + dialog + store
  git-panel.json  # if split into its own webview later
```

## Example: scoped command runner (super-app)

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main",
  "description": "Main window: scoped shell for monorepo commands",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:default",
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "bun",
          "cmd": "bun",
          "args": true,
          "cwd": "."
        },
        {
          "name": "bash-scripts",
          "cmd": "bash",
          "args": true,
          "cwd": "."
        },
        { "name": "maestro", "cmd": "maestro", "args": true },
        { "name": "adb", "cmd": "adb", "args": true },
        {
          "name": "git",
          "cmd": "git",
          "args": true,
          "cwd": "."
        }
      ]
    },
    "dialog:default",
    "store:default",
    "opener:default"
  ]
}
```

Rules: least privilege; `args: true` only where templates need it (prefer enumerated `args` arrays per command in later hardening); `cwd` jails execution to the monorepo; never commit a capability with `"args": true` + no `cwd` for shells.

## Plugin permissions

Each plugin ships granular permissions (`fs:allow-read-file`, `dialog:allow-open`, …). Enable `default` sets during prototyping, then trim to exact allows before release. Writing custom permissions for own plugin code: see `raw/security-permissions.md` — needed only if we author a `pty` plugin; Phase 0 uses app commands instead.

## Scopes (fs example)

```json
{
  "identifier": "fs:allow-read-text-file",
  "allow": [
    { "path": "apps/app/.maestro-gen/**" }
  ]
}
```

Scope globs to the artifact/log dirs the UI actually reads (`.artifacts/logs/**`, `.maestro-gen/**`). Deny everything else implicitly.

## Content Security Policy

Set in `tauri.conf.json > app.security.csp`. Requirements for the super-app:

- `default-src 'self'` baseline.
- `connect-src 'self' http://localhost:* ipc: http://ipc.localhost` — dev servers + Tauri IPC scheme.
- `frame-src http://localhost:*` — Flows `:8086` / DS `:8085` right-panel iframes.
- Tighten for release builds (drop `localhost:*` once panels embed static exports).

Reference pages: `raw/security-csp.md`, plus `reference/acl/*` on site for the full permission catalog.
