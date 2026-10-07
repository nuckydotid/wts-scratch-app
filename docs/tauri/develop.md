# Tauri v2 — Develop Loop, Config, State, Sidecars, Resources, Debug

> Distilled from `raw/develop.md`, `raw/develop-configuration-files.md`, `raw/develop-state-management.md`, `raw/develop-sidecar.md`, `raw/develop-resources.md`, `raw/develop-debug.md`.

## Dev loop

```zsh
bun run tauri dev     # Vite (:1420) + Rust rebuild on change + WebView with devtools
bun run tauri build   # Vite build → frontendDist → Rust release → bundler artifacts
```

`beforeDevCommand` / `beforeBuildCommand` in `tauri.conf.json` run the frontend steps. Rust changes recompile automatically; frontend HMR comes from Vite.

## Configuration files (`tauri.conf.json`)

Single source of truth for app metadata, build, security, bundle. Essentials:

```jsonc
{
  "productName": "Worktrees Studio Commands",
  "version": "0.1.0",
  "identifier": "id.sch.myapp.commands",
  "build": {
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist",
  },
  "app": {
    "security": {
      // CSP for the WebView; localhost panels need explicit frame/connect-src
      "csp": "default-src 'self'; connect-src 'self' http://localhost:*; frame-src http://localhost:*",
    },
  },
  "bundle": {
    "category": "DeveloperTool",
    "targets": ["dmg", "app"],
  },
}
```

Full schema: upstream `raw/develop-configuration-files.md` + `reference/config/` on site.

## State management (Rust side)

Shared state via `tauri::Manager`:

```rust
use tauri::{Manager, State};
use std::sync::Mutex;

struct AppState { cwd: Mutex<String> }

#[tauri::command]
fn get_cwd(state: State<'_, AppState>) -> String {
    state.cwd.lock().unwrap().clone()
}

fn main() {
    tauri::Builder::default()
        .manage(AppState { cwd: Mutex::new(String::from(".")) })
        .invoke_handler(tauri::generate_handler![get_cwd])
        .run(tauri::generate_context!())
        .expect("tauri app failed");
}
```

Use for: current repo root, PTY session registry, git status cache. Never store secrets in state — keychain/`stronghold` instead.

## Sidecars

Ship helper binaries (e.g. a `bun`-compiled CLI) alongside the app via `externalBin`:

```jsonc
{ "bundle": { "externalBin": ["binaries/git-helper"] } }
```

```rust
use tauri_plugin_shell::ShellExt;
let out = app.shell()
    .sidecar("git-helper")?.args(["log", "--oneline", "-5"])
    .output().await?;
```

Prefer sidecars over `shell.open` for anything needing version pinning. For the super-app, the system `git`/`bun` via scoped `shell` is enough for Phase 0 (see `backend.md`).

## Resources

Read-only bundled files via `bundle.resources`:

```jsonc
{ "bundle": { "resources": ["data/commands.json"] } }
```

```rust
use tauri::Manager;
let path = app.path().resolve("data/commands.json", tauri::path::BaseDirectory::Resource)?;
```

Use for the ported `AppCommands` registry JSON, seed fixtures, icons.

## Debugging

- **Frontend:** WebView devtools open automatically in `tauri dev` (right-click → Inspect on macOS debug builds).
- **Rust:** `console_log` + `tauri_plugin_log`; attach via `RAW/develop-debug-vscode.md` patterns (lldb `CodeLLDB`, `rust-analyzer`).
- **WebDriver E2E:** `tauri-driver` exists but is out of scope — Maestro + vitest remain the E2E story here; Tauri UI gets component tests via vitest in the Vite workspace.
