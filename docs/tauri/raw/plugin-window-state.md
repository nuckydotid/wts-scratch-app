# Window State

> Scraped from `https://v2.tauri.app/plugin/window-state/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Window State

[GitHub](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/window-state)[npm](https://www.npmx.dev/package/@tauri-apps/plugin-window-state)[crates.io](https://crates.io/crates/tauri-plugin-window-state)

API Reference:

Save window positions and sizes and restore them when the app is reopened.

## Supported Platforms

[Section titled “Supported Platforms”](#supported-platforms)

_This plugin requires a Rust version of at least **1.77.2**_

| Platform | Level | Notes |
| -------- | ----- | ----- |
| windows  |       |       |
| linux    |       |       |
| macos    |       |       |
| android  |       |       |
| ios      |       |       |

## Setup

[Section titled “Setup”](#setup)

Install the window-state plugin to get started.

- [Automatic](#tab-panel-2-0)
- [Manual](#tab-panel-2-1)

Use your project’s package manager to add the dependency:

- [npm](#tab-panel-0-0)
- [yarn](#tab-panel-0-1)
- [pnpm](#tab-panel-0-2)
- [deno](#tab-panel-0-3)
- [bun](#tab-panel-0-4)
- [cargo](#tab-panel-0-5)

```
npm run tauri add window-state
```

```
yarn run tauri add window-state
```

```
pnpm tauri add window-state
```

```
deno task tauri add window-state
```

```
bun tauri add window-state
```

```
cargo tauri add window-state
```

1. Run the following command in the `src-tauri` folder to add the plugin to the project’s dependencies in `Cargo.toml`:

   ```
   cargo add tauri-plugin-window-state --target 'cfg(any(target_os = "macos", windows, target_os = "linux"))'
   ```

2. Modify `lib.rs` to initialize the plugin:

   src-tauri/src/lib.rs

   ```
   #[cfg_attr(mobile, tauri::mobile_entry_point)]

   pub fn run() {

   tauri::Builder::default()

   .setup(|app| {

   #[cfg(desktop)]

   app.handle().plugin(tauri_plugin_window_state::Builder::default().build());

   Ok(())

   })

   .run(tauri::generate_context!())

   .expect("error while running tauri application");

   }
   ```

3. Install the JavaScript Guest bindings using your preferred JavaScript package manager:

   - [npm](#tab-panel-1-0)
   - [yarn](#tab-panel-1-1)
   - [pnpm](#tab-panel-1-2)
   - [deno](#tab-panel-1-3)
   - [bun](#tab-panel-1-4)

   ```
   npm install @tauri-apps/plugin-window-state
   ```

   ```
   yarn add @tauri-apps/plugin-window-state
   ```

   ```
   pnpm add @tauri-apps/plugin-window-state
   ```

   ```
   deno add npm:@tauri-apps/plugin-window-state
   ```

   ```
   bun add @tauri-apps/plugin-window-state
   ```

## Usage

[Section titled “Usage”](#usage)

After adding the window-state plugin, all windows will remember their state when the app is being closed and will restore to their previous state on the next launch.

You can also access the window-state plugin in both JavaScript and Rust.

Tip

Restoring the state will happen after window creation,
so to prevent the window from flashing, you can set `visible` to `false` when creating the window,
the plugin will show the window when it restores the state

### JavaScript

[Section titled “JavaScript”](#javascript)

You can use `saveWindowState` to manually save the window state:

```
import { saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state';

// when using `"withGlobalTauri": true`, you may use

// const { saveWindowState, StateFlags } = window.__TAURI__.windowState;

saveWindowState(StateFlags.ALL);
```

Similarly you can manually restore a window’s state from disk:

```
import {

restoreStateCurrent,

StateFlags,

} from '@tauri-apps/plugin-window-state';

// when using `"withGlobalTauri": true`, you may use

// const { restoreStateCurrent, StateFlags } = window.__TAURI__.windowState;

restoreStateCurrent(StateFlags.ALL);
```

### Rust

[Section titled “Rust”](#rust)

You can use the `save_window_state()` method exposed by the `AppHandleExt` trait:

```
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

// `tauri::AppHandle` now has the following additional method

app.save_window_state(StateFlags::all()); // will save the state of all open windows to disk
```

Similarly you can manually restore a window’s state from disk using the `restore_state()` method exposed by the `WindowExt` trait:

```
use tauri_plugin_window_state::{WindowExt, StateFlags};

// all `Window` types now have the following additional method

window.restore_state(StateFlags::all()); // will restore the window's state from disk
```

## Permissions

[Section titled “Permissions”](#permissions)

By default all potentially dangerous plugin commands and scopes are blocked and cannot be accessed. You must modify the permissions in your `capabilities` configuration to enable these.

See the [Capabilities Overview](/security/capabilities/) for more information and the [step by step guide](/learn/security/using-plugin-permissions/) to use plugin permissions.

src-tauri/capabilities/default.json

```
{

"permissions": [

...,

"window-state:default",

]

}
```

## [Default Permission](#default-permission)

This permission set configures what kind of
operations are available from the window state plugin.

#### [Granted Permissions](#granted-permissions)

All operations are enabled by default.

#### This default permission set includes the following:

- `allow-filename`
- `allow-restore-state`
- `allow-save-window-state`

## Permission Table

| Identifier                             | Description                                                               |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `window-state:allow-filename`          | Enables the filename command without any pre-configured scope.            |
| `window-state:deny-filename`           | Denies the filename command without any pre-configured scope.             |
| `window-state:allow-restore-state`     | Enables the restore\_state command without any pre-configured scope.      |
| `window-state:deny-restore-state`      | Denies the restore\_state command without any pre-configured scope.       |
| `window-state:allow-save-window-state` | Enables the save\_window\_state command without any pre-configured scope. |
| `window-state:deny-save-window-state`  | Denies the save\_window\_state command without any pre-configured scope.  |

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/plugin/window-state.mdx)

Last updated: Apr 11, 2025

[Previous  
Websocket](/plugin/websocket/)[Next  
About Tauri](/about/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
