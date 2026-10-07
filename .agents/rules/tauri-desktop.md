# Tauri Desktop Rules

Rules for Tauri v2 desktop workspaces in `desktop/*` (`desktop/app-commands` super-app: Commands + Git tree + Flows/DS panels + terminal).

## Workspace & Toolchain

- Tauri apps live in `desktop/*` (Bun workspace). Never under `apps/` (Expo) or `flows/` (Metro web).
- **Bun for JS/TS, Cargo only for Rust:** `bun`, `bunx` for frontend/deps; `cargo` exclusively under `desktop/*/src-tauri/`. Never `npm`/`yarn`/`pnpm`/`npx`.
- Root `package.json` must list `"desktop/*"` in `workspaces` and include the `--filter './desktop/*'` entries in `lint`/`typecheck` scripts.

## Frontend

- Vite + React + TS for desktop shells. Expo/Metro stays in `apps/` and `flows/`.
- `tauri.conf.json`: `devUrl` → Vite dev server (`http://localhost:1420`), `frontendDist` → static `dist/`. Never point `frontendDist` at a dev server.
- Guard every Tauri API call with an `isTauri` check (`'__TAURI__' in window`) and a web fallback — panels must still render in a plain browser.
- UI tokens: Tailwind CSS v4 + `@repo/worktrees-studio-ds`. Raw color values only in canvas-primitive files.

## Backend (Rust)

- All process execution goes through allowlisted commands (`run_cmd`, `run_cmd_stream`, `git_log`, …). Binary allowlist: `bun`, `bunx`, `bash`, `maestro`, `adb`, `git`, `xcrun`. `cwd` is always jailed to the monorepo root — reject paths escaping it in code and in capability files.
- Streaming (PTY, long logs) uses `tauri::ipc::Channel`, not ad-hoc event spam. Every spawned session is registered in shared `State` and killable via `kill_session` (kill the process group, not just the parent).
- `#[tauri::command]` fns live in `lib.rs`, are not `pub`, and return `Result<T, E: Serialize>`. Command names are unique.

## Security & Capabilities

- One capability file per surface under `src-tauri/capabilities/`. Least privilege: `shell:allow-execute` enumerates binaries with `cwd` set; no `args: true` without `cwd`.
- CSP in `tauri.conf.json > app.security.csp` must include `frame-src`/`connect-src http://localhost:*` while dev-server panels exist; tighten on release.
- Never put secrets in `tauri.conf.json`, capabilities, or bundled JS. Runtime secrets come from the OS keychain (`stronghold`) or env.

## Distribution

- `bun run tauri icon` at scaffold time; `bun run tauri build` produces `.app`/`.dmg` (replaces `gui/build-app.sh`).
- Sign + notarize release builds (Developer ID + `notarytool` + `stapler`); PR builds stay unsigned. Record DMG checksum + install smoke in the sprint file.
- Updater (`latest.json` + signed artifacts) uses a per-environment keypair; staging key ≠ prod key.
