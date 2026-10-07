# Tauri v2 Desktop Reference & Guide

> Scraped from `https://v2.tauri.app/` (last fetch: 2026-09-25, Tauri v2 stable) and tailored to this Bun monorepo (`desktop/*` workspaces, Bun frontend + Rust backend split).
> Raw verbatim archive: `docs/tauri/raw/` (38 pages). The guides below are hand-distilled adaptations — always check the linked raw page for full detail.

Tauri is a toolkit for building small, fast, secure desktop (and mobile) apps with a web frontend and a Rust backend. The WebView renders the UI; Rust handles native work (processes, filesystem, git, PTY, updater).

## 📚 Guide index

| Guide                              | Covers                                                                                                  | Raw sources                                                                                                                                                                                                                                                                                                                                        |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [start.md](start.md)               | Prerequisites, scaffolding, Vite frontend, project structure                                            | [raw/start.md](raw/start.md), [raw/start-prerequisites.md](raw/start-prerequisites.md), [raw/start-create-project.md](raw/start-create-project.md), [raw/start-frontend-vite.md](raw/start-frontend-vite.md), [raw/start-project-structure.md](raw/start-project-structure.md)                                                                     |
| [develop.md](develop.md)           | Dev loop (`devUrl`/`frontendDist`), config files, state, sidecars, resources, debugging                 | [raw/develop.md](raw/develop.md), [raw/develop-configuration-files.md](raw/develop-configuration-files.md), [raw/develop-state-management.md](raw/develop-state-management.md), [raw/develop-sidecar.md](raw/develop-sidecar.md), [raw/develop-resources.md](raw/develop-resources.md), [raw/develop-debug.md](raw/develop-debug.md)               |
| [ipc.md](ipc.md)                   | Architecture, process model, commands (`invoke`), events, calling the frontend from Rust                | [raw/concept-architecture.md](raw/concept-architecture.md), [raw/concept-process-model.md](raw/concept-process-model.md), [raw/concept-inter-process-communication.md](raw/concept-inter-process-communication.md), [raw/develop-calling-rust.md](raw/develop-calling-rust.md), [raw/develop-calling-frontend.md](raw/develop-calling-frontend.md) |
| [capabilities.md](capabilities.md) | Capability files, permissions, scopes, CSP                                                              | [raw/security-capabilities.md](raw/security-capabilities.md), [raw/security-permissions.md](raw/security-permissions.md), [raw/security-csp.md](raw/security-csp.md), [raw/security-scope.md](raw/security-scope.md)                                                                                                                               |
| [plugins.md](plugins.md)           | shell, opener, fs, dialog, store, updater, process, window-state, single-instance, localhost, deep-link | [raw/plugin-*.md](raw/plugin-shell.md) (11 plugin pages)                                                                                                                                                                                                                                                                                           |
| [webview.md](webview.md)           | Multi-window/webview split panels, window customization, tray, splashscreen                             | [raw/learn-window-customization.md](raw/learn-window-customization.md), [raw/learn-system-tray.md](raw/learn-system-tray.md), [raw/learn-splashscreen.md](raw/learn-splashscreen.md)                                                                                                                                                               |
| [build.md](build.md)               | Bundling, macOS `.app`/DMG/signing, updater artifacts, release pipelines                                | [raw/distribute.md](raw/distribute.md), [raw/distribute-dmg.md](raw/distribute-dmg.md), [raw/distribute-macos-application-bundle.md](raw/distribute-macos-application-bundle.md), [raw/distribute-sign-macos.md](raw/distribute-sign-macos.md), [raw/plugin-updater.md](raw/plugin-updater.md)                                                     |
| [backend.md](backend.md)           | Super-app patterns: scoped command runner, PTY terminal, git via CLI/`git2`                             | Synthesized for `desktop/app-commands`; upstream: [raw/develop-sidecar.md](raw/develop-sidecar.md), [raw/plugin-shell.md](raw/plugin-shell.md), [raw/plugin-process.md](raw/plugin-process.md)                                                                                                                                     |

## 60-second quickstart (this repo)

```zsh
# 1. Prerequisites (macOS) — Rust + WebView deps; frontend stays on Bun
rustc --version          # install via https://rustup.rs if missing
bun --version            # expect 1.4.x (repo is Bun-only for JS/TS)

# 2. Scaffold inside the monorepo (Bun workspace: desktop/*)
mkdir -p desktop/app-commands
bunx --package create-tauri-app@latest create-tauri-app \
  --template react-ts --manager bun desktop/app-commands

# 3. Dev loop — Vite on :1420, Tauri opens it via devUrl
bun run tauri dev       # from desktop/app-commands/
bun run tauri build     # production bundle (.app/.dmg on macOS)
```

## ⚡ Monorepo anti-patterns

- **Bun for JS/TS, Cargo only for Rust:** never `npm`/`yarn`/`pnpm`; `cargo` is allowed exclusively under `desktop/*/src-tauri/`.
- **Workspace placement:** Tauri apps live in `desktop/*` (add to root `workspaces` + `lint`/`typecheck` filters). Never nest under `apps/` (Expo) or `flows/` (Metro web).
- **Shell access is scoped, never open:** every `shell`/`fs` capability allowlists exact binaries (`bun`, `bash`, `maestro`, `adb`, `xcrun`) and jails `cwd` to the monorepo root. No `*` scopes in committed capability files.
- **No secrets in capabilities or frontend:** tokens live in OS keychain via `stronghold` or env at runtime; never in `tauri.conf.json` or bundled JS.
- **Hex policy:** Tailwind v4 tokens in UI; raw color values only in canvas-primitive files (same rule as `flows/.../flow-colors.ts`).
