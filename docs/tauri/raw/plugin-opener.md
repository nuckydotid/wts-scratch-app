# Opener

> Scraped from `https://v2.tauri.app/plugin/opener/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Opener

[GitHub](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/opener)[npm](https://www.npmx.dev/package/@tauri-apps/plugin-opener)[crates.io](https://crates.io/crates/tauri-plugin-opener)

API Reference:

This plugin allows you to open files and URLs in a specified, or the default, application. It also supports “revealing” files in the system’s file explorer.

## Supported Platforms

[Section titled “Supported Platforms”](#supported-platforms)

_This plugin requires a Rust version of at least **1.77.2**_

| Platform | Level | Notes                               |
| -------- | ----- | ----------------------------------- |
| windows  |       |                                     |
| linux    |       |                                     |
| macos    |       |                                     |
| android  |       | Only allows to open URLs via `open` |
| ios      |       | Only allows to open URLs via `open` |

## Setup

[Section titled “Setup”](#setup)

Install the opener plugin to get started.

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
npm run tauri add opener
```

```
yarn run tauri add opener
```

```
pnpm tauri add opener
```

```
deno task tauri add opener
```

```
bun tauri add opener
```

```
cargo tauri add opener
```

1. Run the following command in the `src-tauri` folder to add the plugin to the project’s dependencies in `Cargo.toml`:

   ```
   cargo add tauri-plugin-opener
   ```

2. Modify `lib.rs` to initialize the plugin:

   src-tauri/src/lib.rs

   ```
   #[cfg_attr(mobile, tauri::mobile_entry_point)]

   pub fn run() {

   tauri::Builder::default()

   .plugin(tauri_plugin_opener::init())

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
   npm install @tauri-apps/plugin-opener
   ```

   ```
   yarn add @tauri-apps/plugin-opener
   ```

   ```
   pnpm add @tauri-apps/plugin-opener
   ```

   ```
   deno add npm:@tauri-apps/plugin-opener
   ```

   ```
   bun add @tauri-apps/plugin-opener
   ```

## Usage

[Section titled “Usage”](#usage)

The opener plugin is available in both JavaScript and Rust.

- [JavaScript](#tab-panel-3-0)
- [Rust](#tab-panel-3-1)

```
import { openPath, openUrl } from '@tauri-apps/plugin-opener';

// when using `"withGlobalTauri": true`, you may use

// const { openPath } = window.__TAURI__.opener;

// opens a file using the default program:

await openPath('/path/to/file');

// opens a file using `vlc` command on Windows:

await openPath('C:/path/to/file', 'vlc');

// opens a URL using the default program:

await openUrl('https://tauri.app');
```

Note that `app` is an instance of `App` or [`AppHandle`](https://docs.rs/tauri/2.0.0/tauri/struct.AppHandle.html).

```
use tauri_plugin_opener::OpenerExt;

// opens a file using the default program:

app.opener().open_path("/path/to/file", None::<&str>);

// opens a file using `vlc` command on Windows:

app.opener().open_path("C:/path/to/file", Some("vlc"));

// opens a URL using the default program:

app.opener().open_url("https://tauri.app", None::<&str>);
```

## Permissions

[Section titled “Permissions”](#permissions)

By default all potentially dangerous plugin commands and scopes are blocked and cannot be accessed. You must modify the permissions in your `capabilities` configuration to enable these.

See the [Capabilities Overview](/security/capabilities/) for more information and the [step by step guide](/learn/security/using-plugin-permissions/) to use plugin permissions.

Below are two example scope configurations. Both `path` and `url` use the [glob pattern syntax](https://docs.rs/glob/latest/glob/struct.Pattern.html) to define allowed file paths and URLs.

First, an example on how to add permissions to specific paths for the `openPath()` function:

src-tauri/capabilities/default.json

```
{

"$schema": "../gen/schemas/desktop-schema.json",

"identifier": "main-capability",

"description": "Capability for the main window",

"windows": ["main"],

"permissions": [

{

"identifier": "opener:allow-open-path",

"allow": [

{

"path": "/path/to/file"

},

{

"path": "$APPDATA/file"

}

]

}

]

}
```

Lastly, an example on how to add permissions for the exact `https://tauri.app` URL and all URLs on a custom protocol (must be known to the OS) for the `openUrl()` function:

src-tauri/capabilities/default.json

```
{

"$schema": "../gen/schemas/desktop-schema.json",

"identifier": "main-capability",

"description": "Capability for the main window",

"windows": ["main"],

"permissions": [

{

"identifier": "opener:allow-open-url",

"allow": [

{

"url": "https://tauri.app"

},

{

"url": "custom:*"

}

]

}

]

}
```

## [Default Permission](#default-permission)

This permission set allows opening `mailto:`, `tel:`, `https://` and `http://` urls using their default application
as well as reveal file in directories using default file explorer

#### This default permission set includes the following:

- `allow-open-url`
- `allow-reveal-item-in-dir`
- `allow-default-urls`

## Permission Table

| Identifier                        | Description                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `opener:allow-default-urls`       | This enables opening `mailto:`, `tel:`, `https://` and `http://` urls using their default application. |
| `opener:allow-open-path`          | Enables the open\_path command without any pre-configured scope.                                       |
| `opener:deny-open-path`           | Denies the open\_path command without any pre-configured scope.                                        |
| `opener:allow-open-url`           | Enables the open\_url command without any pre-configured scope.                                        |
| `opener:deny-open-url`            | Denies the open\_url command without any pre-configured scope.                                         |
| `opener:allow-reveal-item-in-dir` | Enables the reveal\_item\_in\_dir command without any pre-configured scope.                            |
| `opener:deny-reveal-item-in-dir`  | Denies the reveal\_item\_in\_dir command without any pre-configured scope.                             |

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/plugin/opener.mdx)

Last updated: Dec 10, 2025

[Previous  
Notifications](/plugin/notification/)[Next  
OS Information](/plugin/os-info/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
