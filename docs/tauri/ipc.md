# Tauri v2 — Architecture, Process Model, IPC

> Distilled from `raw/concept-architecture.md`, `raw/concept-process-model.md`, `raw/concept-inter-process-communication.md`, `raw/develop-calling-rust.md`, `raw/develop-calling-frontend.md`.

## Architecture in one paragraph

Two processes: **Core** (Rust) and **WebView** (UI). They talk over IPC. Rust can do anything native (spawn processes, read files, open sockets); the WebView can only do what capabilities explicitly grant. This is the security boundary — design around it.

## Process model

- Core: single Rust process, owns state, commands, sidecars, PTY sessions.
- WebView(s): one or more UI surfaces in a window (see `webview.md` for the split-panel pattern). Each WebView has its own JS context and capability scope.
- Mobile targets reuse the same model with platform WebViews — out of scope for `desktop/*`.

## Calling Rust: commands (`invoke`)

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn git_log(cwd: String, limit: Option<u8>) -> Result<String, String> {
    let out = std::process::Command::new("git")
        .args(["-C", &cwd, "log", "--oneline", "-n", &limit.unwrap_or(20).to_string()])
        .output()
        .map_err(|e| e.to_string())?;
    if !out.status.success() {
        return Err(String::from_utf8_lossy(&out.stderr).into_owned());
    }
    Ok(String::from_utf8_lossy(&out.stdout).into_owned())
}
```

```ts
// src/lib/tauri.ts
import { invoke } from "@tauri-apps/api/core";

export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

export function gitLog(cwd: string, limit = 20) {
  if (!isTauri) return Promise.resolve(mockGitLog()); // Expo web fallback
  return invoke<string>("git_log", { cwd, limit });
}
```

Rules from upstream: command names unique; define in `lib.rs` (not `pub` — glue-code limitation); args are camelCase in JS → snake_case in Rust automatically; return `Result<T, E>` where `E: Serialize` for typed errors. Async commands: `async fn` + `.await` freely.

## Calling the frontend: events + channels

```rust
use tauri::{AppHandle, Emitter};
app.emit("git:status-changed", payload)?;       // broadcast
```

```ts
import { listen } from "@tauri-apps/api/event";
await listen<string>("git:status-changed", (e) => setStatus(e.payload));
```

For streaming (PTY output, long `maestro` logs): prefer **Channels** over events — ordered, backpressured:

```rust
#[tauri::command]
async fn pty_spawn(on_data: tauri::ipc::Channel<String>) -> Result<u32, String> { /* ... */ }
```

```ts
import { Channel } from "@tauri-apps/api/core";
const onData = new Channel<string>();
onData.onmessage = (chunk) => term.write(chunk);
await invoke("pty_spawn", { onData });
```

## Frontend/backend split for the super-app

| Direction           | Mechanism                    | Used for                                         |
| :------------------ | :--------------------------- | :----------------------------------------------- |
| UI → Rust (request) | `invoke` commands            | `run_cmd`, `git_log`, `git_status`, dialogs      |
| Rust → UI (push)    | `emit` events                | Focus flows panel on `?node=`, toast on task end |
| Rust → UI (stream)  | `Channel`                    | PTY chunks, `maestro`/`ota` log tails            |
| UI → UI (panels)    | iframe `src` / `postMessage` | Flows `:8086` / DS `:8085` right-panel embed     |

Full API surface: `raw/develop-calling-rust.md` (1400+ lines) and `raw/develop-calling-frontend.md`.
