# Process

> Scraped from `https://v2.tauri.app/plugin/process/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Process

[GitHub](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/process)[npm](https://www.npmx.dev/package/@tauri-apps/plugin-process)[crates.io](https://crates.io/crates/tauri-plugin-process)

API Reference:

This plugin provides APIs to access the current process. To spawn child processes, see the [shell](/plugin/shell/) plugin.

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

Install the plugin-process to get started.

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
npm run tauri add process
```

```
yarn run tauri add process
```

```
pnpm tauri add process
```

```
deno task tauri add process
```

```
bun tauri add process
```

```
cargo tauri add process
```

1. Run the following command in the `src-tauri` folder to add the plugin to the project’s dependencies in `Cargo.toml`:

   ```
   cargo add tauri-plugin-process
   ```

2. Modify `lib.rs` to initialize the plugin:

   src-tauri/src/lib.rs

   ```
   #[cfg_attr(mobile, tauri::mobile_entry_point)]

   pub fn run() {

   tauri::Builder::default()

   .plugin(tauri_plugin_process::init())

   .run(tauri::generate_context!())

   .expect("error while running tauri application");

   }
   ```

3. If you’d like to utilize the plugin in JavaScript then install the npm package as well:

   - [npm](#tab-panel-1-0)
   - [yarn](#tab-panel-1-1)
   - [pnpm](#tab-panel-1-2)
   - [deno](#tab-panel-1-3)
   - [bun](#tab-panel-1-4)

   ```
   npm install @tauri-apps/plugin-process
   ```

   ```
   yarn add @tauri-apps/plugin-process
   ```

   ```
   pnpm add @tauri-apps/plugin-process
   ```

   ```
   deno add npm:@tauri-apps/plugin-process
   ```

   ```
   bun add @tauri-apps/plugin-process
   ```

## Usage

[Section titled “Usage”](#usage)

The process plugin is available in both JavaScript and Rust.

- [JavaScript](#tab-panel-3-0)
- [Rust](#tab-panel-3-1)

```
import { exit, relaunch } from '@tauri-apps/plugin-process';

// when using `"withGlobalTauri": true`, you may use

// const { exit, relaunch } = window.__TAURI__.process;

// exits the app with the given status code

await exit(0);

// restarts the app

await relaunch();
```

Note that `app` is an instance of [`AppHandle`](https://docs.rs/tauri/2.0.0/tauri/struct.AppHandle.html).

```
// exits the app with the given status code

app.exit(0);

// restarts the app

app.restart();
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

"process:default",

]

}
```

## [Default Permission](#default-permission)

This permission set configures which
process features are by default exposed.

#### [Granted Permissions](#granted-permissions)

This enables to quit via `allow-exit` and restart via `allow-restart`
the application.

#### This default permission set includes the following:

- `allow-exit`
- `allow-restart`

## Permission Table

| Identifier              | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `process:allow-exit`    | Enables the exit command without any pre-configured scope.    |
| `process:deny-exit`     | Denies the exit command without any pre-configured scope.     |
| `process:allow-restart` | Enables the restart command without any pre-configured scope. |
| `process:deny-restart`  | Denies the restart command without any pre-configured scope.  |

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/plugin/process.mdx)

Last updated: Feb 22, 2025

[Previous  
Positioner](/plugin/positioner/)[Next  
Shell](/plugin/shell/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
