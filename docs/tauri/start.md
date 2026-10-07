# Tauri v2 — Start: Prerequisites, Scaffolding, Frontend

> Distilled from `raw/start.md`, `raw/start-prerequisites.md`, `raw/start-create-project.md`, `raw/start-frontend-vite.md`, `raw/start-project-structure.md`. Adapted to Bun + `desktop/*`.

## What Tauri is

Tauri pairs a system WebView UI (WKWebView on macOS, WebView2 on Windows, WebKitGTK on Linux) with a Rust backend. Result: ~10 MB bundles, native performance for backend work, web tech for UI. The frontend can be any framework that produces static files — here: **Vite + React + TS** for desktop workspaces (Expo/Metro stays in `apps/` and `flows/`).

## Prerequisites (macOS)

```zsh
xcode-select --install        # Xcode CLT: compilers + git
rustup --version || curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version               # stable toolchain
bun --version                 # 1.4.x
```

Linux/Windows need extra WebView deps — see `raw/start-prerequisites.md`. CI runners need the same (`raw/develop-tests-webdriver-ci` is out of scope for now).

## Scaffolding in this monorepo

```zsh
mkdir -p desktop/app-commands
bunx --package create-tauri-app@latest create-tauri-app \
  --template react-ts --manager bun desktop/app-commands
```

Then register the workspace:

1. Root `package.json` → `workspaces`: add `"desktop/*"`.
2. Root `scripts.lint` / `typecheck`: add `--filter './desktop/*'`.
3. Workspace `.gitignore`: `target/`, `dist/`, `src-tauri/target/`.

## Frontend: Vite (not Expo)

`start-frontend-vite.md` is the reference; Expo export is a valid alternative for the Flows spike but the real desktop shell uses Vite:

- Dev server default `http://localhost:1420` (Vite strict port to match `devUrl`).
- `tauri.conf.json` wiring:

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

- `devUrl` = live Vite server during `tauri dev`; `frontendDist` = static `dist/` output bundled by `tauri build`. Never point `frontendDist` at a dev server.

## Project structure

```
desktop/app-commands/
  package.json            # name: desktop-app-commands, private, type: module
  vite.config.ts          # react plugin, server.strictPort: 1420
  src/                    # React TS UI (pages, components, lib)
  src-tauri/
    Cargo.toml            # tauri + tauri-build + plugins
    tauri.conf.json       # app metadata, build, security, bundle
    build.rs              # tauri-build
    src/main.rs           # entry (mobile) / src/lib.rs (desktop pattern v2)
    capabilities/         # *.json capability files (see capabilities.md)
    icons/                # generated via `bun run tauri icon`
```

Key detail from `raw/develop.md`: Tauri v2 desktop entry is `src/lib.rs` with `#[cfg_attr(mobile, tauri::mobile_entry_point)]`; `main.rs` stays thin. Run `bun run tauri icon <png>` to generate all platform icons at scaffold time.
