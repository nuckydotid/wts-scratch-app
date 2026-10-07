# Tauri v2 — Plugins for the Super-App

> Distilled from 11 `raw/plugin-*.md` pages. Only what `desktop/app-commands` needs, with install + minimal usage.

Install pattern (Cargo + JS + capability):

```zsh
bun run tauri add shell   # wires Cargo dep, JS package, capability stub
```

## shell — scoped command execution (core of Commands tab)

```ts
import { Command } from "@tauri-apps/plugin-shell";
const out = await Command.create("bun", ["run", "e2e:quick"], {
  cwd: "apps/app",
}).execute();
```

Prefer app-defined Rust commands (`backend.md`) over raw `Command.create` for anything with templates/kill/streaming — shell plugin is the escape hatch for simple one-shots. Full: `raw/plugin-shell.md`.

## opener — `openURL` parity (`localhost:8086/?node=`)

```ts
import { openUrl } from "@tauri-apps/plugin-opener";
await openUrl("http://localhost:8086/?node=parent-home");
```

Used when the user pops a panel out to the system browser. In-app default stays the iframe panel (`webview.md`).

## fs — reading generated artifacts

```ts
import { readTextFile } from "@tauri-apps/plugin-fs";
const coverage = await readTextFile(".maestro-gen/coverage.json");
```

Scope to `.maestro-gen/**` + `.artifacts/logs/**` (see `capabilities.md`). Full API (61k chars): `raw/plugin-file-system.md`.

## dialog — file pickers, confirmations

```ts
import { open, confirm } from "@tauri-apps/plugin-dialog";
const dir = await open({
  directory: true,
  defaultPath: ".",
});
const ok = await confirm("Refresh staging DB?", { title: "Refresh DB" });
```

Replaces Swift `NSAlert`/`NSOpenPanel` flows from `gui/`.

## store — lightweight persistence

```ts
import { Store } from "@tauri-apps/plugin-store";
const store = await Store.load("prefs.json");
await store.set("last-command-set", "app");
```

Holds UI prefs (selected command set, panel sizes, last repo root). Not a secret store.

## updater — OTA for the desktop app itself

Active-update flow with pubkey-signed artifacts; manifest served over HTTPS. Essentials:

```jsonc
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.example.com/{{target}}/{{current_version}}",
      ],
      "pubkey": "<minisign pubkey>",
    },
  },
}
```

Keygen/sign in CI (`tauri signer generate`, `tauri signer sign`). Detail: `raw/plugin-updater.md` (25k chars). Do not confuse with `worktrees-studio-ota-updates` (mobile JS bundles) — different mechanism, same release-notes discipline.

## process — relaunch/exit

```ts
import { relaunch, exit } from "@tauri-apps/plugin-process";
await relaunch(); // after updater install
```

## window-state — remember geometry

Saves/restores window size/position across launches. One line in `lib.rs` + capability; see `raw/plugin-window-state.md`.

## single-instance — one super-app only

Second launch focuses the running window and emits args (e.g. deep `worktrees-studio://` command to run). See `raw/plugin-single-instance.md`; pairs with `deep-linking` for `worktrees-studio://e2e-mock-*`-style hooks if needed later.

## localhost — serve bundled panels offline

Serves `frontendDist` sub-paths over `http://localhost:{port}` so the Flows/DS panels keep working without dev servers once embedded as static exports. See `raw/plugin-localhost.md`; Phase 1+ concern.

## deep-link — `worktrees-studio://` URLs

Registers the scheme and routes URLs to the app (`raw/plugin-deep-linking.md`). Needed if Maestro mock hooks or CI must address the desktop app; otherwise defer.
