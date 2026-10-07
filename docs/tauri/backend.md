# Tauri v2 — Super-App Backend Patterns (`desktop/app-commands`)

> Synthesized for this repo from upstream `raw/develop-sidecar.md`, `raw/plugin-shell.md`, `raw/plugin-process.md`, `raw/develop-calling-rust.md`. Ports `gui/Sources/CommandsGUI/{AppCommands,AppState,Models}.swift` semantics to Rust commands.

## Command surface (Phase 0)

| Tauri command            | Ports Swift                        | Behavior                                                                                  |
| :----------------------- | :--------------------------------- | :---------------------------------------------------------------------------------------- |
| `run_cmd`                | `AppState.launch` (simple)         | One-shot: template + `%TOKEN%` substitutions + `cwd`, returns combined output + exit code |
| `run_cmd_stream`         | `runParallelShells`, Start/Run     | Streaming via `Channel<String>`; returns session id; `kill_session(id)` stops it          |
| `kill_session`           | `killSession`/`removeSessionGroup` | Kills process group (PTY or child), frees registry entry                                  |
| `git_log` / `git_status` | — (new, Git tab)                   | `git -C <cwd> …` with `--porcelain` parsing, JSON to frontend                             |
| `server_health`          | — (new, panels)                    | TCP probe of `:8085`/`:8086`, returns up/down + pid hint                                  |

## `run_cmd`: template execution with guardrails

```rust
use std::collections::HashMap;
use std::process::Stdio;
use tauri::State;

const MONOREPO_ROOT: &str = ".";
const ALLOW: &[&str] = &["bun", "bunx", "bash", "maestro", "adb", "git", "xcrun"];

#[tauri::command]
async fn run_cmd(
    program: String,
    args: Vec<String>,
    cwd: String,
    substitutions: HashMap<String, String>,
) -> Result<CommandResult, String> {
    if !ALLOW.contains(&program.as_str()) {
        return Err(format!("program not allowlisted: {program}"));
    }
    let root = std::path::Path::new(MONOREPO_ROOT);
    let dir = root.join(cwd.trim_start_matches('/'));
    if !dir.starts_with(root) {
        return Err("cwd escapes monorepo root".into());
    }
    // Substitute %TOKEN% in args (same semantics as Swift substitute(_:_:))
    let args: Vec<String> = args.iter().map(|a| {
        let mut s = a.clone();
        for (k, v) in &substitutions {
            s = s.replace(&format!("%{k}%"), v);
        }
        s
    }).collect();
    let out = tokio::process::Command::new(&program)
        .args(&args).current_dir(&dir)
        .stdout(Stdio::piped()).stderr(Stdio::piped())
        .output().await.map_err(|e| e.to_string())?;
    Ok(CommandResult {
        code: out.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&out.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&out.stderr).into_owned(),
    })
}
```

Notes: allowlist + `cwd` jail are the capability-file counterparts in code (defense in depth); log tails append to `.artifacts/logs/<suite>-<timestamp>.log` from the frontend after completion to preserve current log layout; `dropdown`/`dropdownWithText`/`parallelShells` from `Models.swift:CommandUI` map to `substitutions` + multi-`run_cmd_stream` calls sharing a `sessionGroupId`.

## Streaming + PTY (Terminal tab)

Phase 0: `run_cmd_stream` spawns via `tokio::process` with piped stdout/stderr, forwards lines over `Channel<String>`, tracks `Child` in `Mutex<HashMap<u32, Child>>` state. `kill_session` kills the whole process group (`nix::sys::signal::killpg` on Unix) so `maestro`/`expo` children die too — parity with Swift `killHandler`.

Hardening (follow-up): replace pipes with `portable-pty` for true terminal emulation (colors, cursor addressing, `xterm.js` fit-addon). The `Channel` + session-registry shape stays identical, so the frontend does not change.

## Git via CLI first, `git2` later

`git_log`/`git_status` shell out to system `git` (always correct: LFS, worktrees, auth). Parse `--pretty=format:` + `--parents` in `packages/git-core` (TS) — Rust stays a dumb pipe. Move to Rust `git2` only if profiling demands it; the command signatures do not change.

## Frontend store shape (Zustand, mirrors `AppState`)

```ts
type Session = {
  id: string;
  group: string;
  breadcrumb: string;
  command: string;
  cwd: string;
  running: boolean;
  groupId?: string;
};
```

`sessions[]`, `selectedSessionId`, `terminals` (xterm instances by id), `runDropdownCommand` (template + substitutions → `run_cmd` or N× `run_cmd_stream`), `removeSessionGroup` — 1:1 with `AppState.swift`.
