---
name: tauri-desktop-builder
description: Build Tauri v2 desktop apps in desktop/* workspaces. Use when scaffolding a Tauri app, wiring devUrl/frontendDist, writing invoke commands, Channels for PTY streaming, capability files, shell/opener/fs/dialog/store/updater plugins, multi-webview panels, or bundling/signing DMG releases.
---

# Tauri Desktop Builder Skill

Use this skill when scaffolding, building, or troubleshooting Tauri v2 desktop apps in `desktop/*` (Bun workspace, Vite + React + TS frontend, Rust backend) — including the `desktop/app-commands` super-app (Commands + Git tree + Flows/DS panels + terminal).

---

## 📚 Documentation Reference

- **Master Index & Quickstart**: `docs/tauri/README.md`
- **Scaffolding & Frontend**: `docs/tauri/start.md` (raw: `docs/tauri/raw/start*.md`)
- **Dev Loop & Config**: `docs/tauri/develop.md` (raw: `docs/tauri/raw/develop*.md`)
- **IPC (invoke, events, Channels)**: `docs/tauri/ipc.md` (raw: `docs/tauri/raw/develop-calling-rust.md`, `docs/tauri/raw/develop-calling-frontend.md`, `docs/tauri/raw/concept-*.md`)
- **Capabilities & CSP**: `docs/tauri/capabilities.md` (raw: `docs/tauri/raw/security-*.md`)
- **Plugins**: `docs/tauri/plugins.md` (raw: `docs/tauri/raw/plugin-*.md`)
- **Panels & Webviews**: `docs/tauri/webview.md` (raw: `docs/tauri/raw/learn-*.md`)
- **Build & Sign**: `docs/tauri/build.md` (raw: `docs/tauri/raw/distribute*.md`)
- **Super-App Backend**: `docs/tauri/backend.md` (allowlisted runner, PTY streaming, git)

---

## ⚡ Core Rules & Patterns

### 1. Workspace & Toolchain Split

Tauri apps live in `desktop/*` (Bun workspace). Frontend uses `bun`/`bunx` only; `cargo` is allowed exclusively under `desktop/*/src-tauri/`. Never `npm`/`yarn`/`pnpm`/`npx`.

```zsh
bunx --package create-tauri-app@latest create-tauri-app \
  --template react-ts --manager bun desktop/<name>
bun run tauri dev    # Vite :1420 via devUrl
bun run tauri build  # frontendDist → .app/.dmg
```

### 2. `tauri.conf.json` Frontend Wiring

`devUrl` → live Vite server; `frontendDist` → static `dist/`. Never point `frontendDist` at a dev server.

```jsonc
{
  "build": {
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist",
    "beforeDevCommand": "bun run dev",
    "beforeBuildCommand": "bun run build",
  },
}
```

### 3. `isTauri` Guard on Every Bridge Call

Panels must render in a plain browser (Expo web, CI screenshots) as well as in Tauri:

```ts
import { invoke } from "@tauri-apps/api/core";

export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

export function runCmd(program: string, args: string[], cwd: string) {
  if (!isTauri) return Promise.resolve(mockResult());
  return invoke("run_cmd", { program, args, cwd });
}
```

### 4. Commands: Allowlist + `cwd` Jail + Typed Errors

`#[tauri::command]` fns live in `lib.rs`, are not `pub`, have unique names, and return `Result<T, E: Serialize>`. All process execution goes through allowlisted commands (`bun`, `bunx`, `bash`, `maestro`, `adb`, `git`, `xcrun`) with `cwd` jailed to the monorepo root — reject escapes in code and in capability files.

```rust
#[tauri::command]
fn git_status(cwd: String) -> Result<String, String> {
    // 1. check cwd starts with MONOREPO_ROOT, 2. spawn, 3. map stderr to Err
}
```

### 5. Streaming Over `Channel`, Sessions in `State`

PTY output and long logs (Maestro, OTA) stream via `tauri::ipc::Channel`, never ad-hoc event spam. Every spawned session registers in shared `State` and is killable via `kill_session` (kill the process group, not just the parent).

```ts
import { Channel } from "@tauri-apps/api/core";
const onData = new Channel<string>();
onData.onmessage = (chunk) => term.write(chunk);
const sessionId = await invoke<number>("run_cmd_stream", {
  program: "bun",
  args,
  cwd,
  onData,
});
```

### 6. Capabilities: Least Privilege Per Surface

One capability file per surface under `src-tauri/capabilities/`. `shell:allow-execute` enumerates binaries with `cwd` set; no `args: true` without `cwd`. CSP keeps `frame-src`/`connect-src http://localhost:*` while Flows (`:8086`) / DS (`:8085`) dev-server panels exist; tighten on release. Never put secrets in capabilities, `tauri.conf.json`, or bundled JS.

### 7. Right-Panel Pattern for Dev Servers

Phase 0 embeds Flows/DS as `<iframe>` tabs with an offline fallback (`server_health` probe → `Empty: bun run start:web`); multi-webview split is the hardening follow-up. See `docs/tauri/webview.md`.
