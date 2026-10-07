# Localhost

> Scraped from `https://v2.tauri.app/plugin/localhost/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Localhost

[GitHub](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/localhost)[crates.io](https://crates.io/crates/tauri-plugin-localhost)

API Reference:

Expose your app’s assets through a localhost server instead of the default custom protocol.

Caution

This plugin brings considerable security risks and you should only use it if you know what you are doing. If in doubt, use the default custom protocol implementation.

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

Install the localhost plugin to get started.

- [Automatic](#tab-panel-1-0)
- [Manual](#tab-panel-1-1)

Use your project’s package manager to add the dependency:

- [npm](#tab-panel-0-0)
- [yarn](#tab-panel-0-1)
- [pnpm](#tab-panel-0-2)
- [deno](#tab-panel-0-3)
- [bun](#tab-panel-0-4)
- [cargo](#tab-panel-0-5)

```
npm run tauri add localhost
```

```
yarn run tauri add localhost
```

```
pnpm tauri add localhost
```

```
deno task tauri add localhost
```

```
bun tauri add localhost
```

```
cargo tauri add localhost
```

1. Run the following command in the `src-tauri` folder to add the plugin to the project’s dependencies in `Cargo.toml`:

   ```
   cargo add tauri-plugin-localhost
   ```

2. Modify `lib.rs` to initialize the plugin:

   src-tauri/src/lib.rs

   ```
   #[cfg_attr(mobile, tauri::mobile_entry_point)]

   pub fn run() {

   tauri::Builder::default()

   .plugin(tauri_plugin_localhost::Builder::new().build())

   .run(tauri::generate_context!())

   .expect("error while running tauri application");

   }
   ```

## Usage

[Section titled “Usage”](#usage)

The localhost plugin is available in Rust.

src-tauri/src/lib.rs

```
use tauri::{webview::WebviewWindowBuilder, WebviewUrl};

pub fn run() {

let port: u16 = 9527;

tauri::Builder::default()

.plugin(tauri_plugin_localhost::Builder::new(port).build())

.setup(move |app| {

let url = format!("http://localhost:{}", port).parse().unwrap();

WebviewWindowBuilder::new(app, "main".to_string(), WebviewUrl::External(url))

.title("Localhost Example")

.build()?;

Ok(())

})

.run(tauri::generate_context!())

.expect("error while running tauri application");

}
```

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/plugin/localhost.mdx)

Last updated: Feb 22, 2025

[Previous  
HTTP Client](/plugin/http-client/)[Next  
Logging](/plugin/logging/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
