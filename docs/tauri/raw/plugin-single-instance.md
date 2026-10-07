# Single Instance

> Scraped from `https://v2.tauri.app/plugin/single-instance/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Single Instance

[GitHub](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/single-instance)[crates.io](https://crates.io/crates/tauri-plugin-single-instance)

API Reference:

Ensure that a single instance of your tauri app is running at a time using the Single Instance Plugin.

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

Install the Single Instance plugin to get started.

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
npm run tauri add single-instance
```

```
yarn run tauri add single-instance
```

```
pnpm tauri add single-instance
```

```
deno task tauri add single-instance
```

```
bun tauri add single-instance
```

```
cargo tauri add single-instance
```

1. Run the following command in the `src-tauri` folder to add the plugin to the project’s dependencies in `Cargo.toml`:

   ```
   cargo add tauri-plugin-single-instance --target 'cfg(any(target_os = "macos", windows, target_os = "linux"))'
   ```

2. Modify `lib.rs` to initialize the plugin:

   lib.rs

   ```
   #[cfg_attr(mobile, tauri::mobile_entry_point)]

   pub fn run() {

   tauri::Builder::default()

   .setup(|app| {

   #[cfg(desktop)]

   app.handle().plugin(tauri_plugin_single_instance::init(|app, args, cwd| {}));

   Ok(())

   })

   .run(tauri::generate_context!())

   .expect("error while running tauri application");

   }
   ```

Note

The Single Instance plugin must be the first one to be registered to work well. This assures that it runs before other plugins can interfere.

## Usage

[Section titled “Usage”](#usage)

The plugin is already installed and initialized, and it should be functioning correctly right away. Nevertheless, we can also enhance its functionality with the `init()` method.

The plugin `init()` method takes a closure that is invoked when a new app instance was started, but closed by the plugin.
The closure has three arguments:

1. **`app`:** The [AppHandle](https://docs.rs/tauri/2.0.0/tauri/struct.AppHandle.html) of the application.
2. **`args`:** The list of arguments, that was passed by the user to initiate this new instance.
3. **`cwd`:** The Current Working Directory denotes the directory from which the new application instance was launched.

So, the closure should look like below

```
.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {

// Write your code here...

}))
```

### Focusing on New Instance

[Section titled “Focusing on New Instance”](#focusing-on-new-instance)

By default, when you initiate a new instance while the application is already running, no action is taken. To focus the window of the running instance when user tries to open a new instance, alter the callback closure as follows:

src-tauri/src/lib.rs

```
use tauri::{AppHandle, Manager};

pub fn run() {

let mut builder = tauri::Builder::default();

#[cfg(desktop)]

{

builder = builder.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {

let _ = app.get_webview_window("main")

.expect("no main window")

.set_focus();

}));

}

builder

.run(tauri::generate_context!())

.expect("error while running tauri application");

}
```

## Usage in Snap and Flatpak

[Section titled “Usage in Snap and Flatpak”](#usage-in-snap-and-flatpak)

On Linux the Single Instance plugin uses DBus to ensure that there will be only one instance running. It does so by publishing a service to DBus when the first instance starts running.
Then, the following instances will try to publish the same service and, if it is already published, they will send a request to the service to notify the first instance, and exit right away.

Despite this working pretty well when your app is bundled as a deb or rpm package or an AppImage, it won’t work as intended for snap or flatpak packages by default because these packages run in a constrained sandboxed environment, where most of the communication to DBus services will be blocked if not explicitly declared on the packaging manifest.

Here’s a guide that shows how to declare the needed permissions to enable the Single Instance for snap and flatpak packages:

### Getting your app ID

[Section titled “Getting your app ID”](#getting-your-app-id)

The Single Instance plugin will publish a service named `org.{id}.SingleInstance`.

`{id}` will be the `identifier` from your `tauri.conf.json` file, but with dots (`.`) and dashes (`-`) replaced by underline (`_`).

For example, if your identifier is `net.mydomain.MyApp`:

- `net_mydomain_MyApp` will be your app `{id}`
- `org.net_mydomain_MyApp.SingleInstance` will be your app SingleInstance service name

You will need the service name to authorize your app to use the DBus service on snap and flatpak manifests, as seen below.

### Snap

[Section titled “Snap”](#snap)

In your snapcraft.yml file, declare a plug and a slot for the single instance service, and use both on your app declaration:

snapcraft.yml

```
# ...

slots:

single-instance:

interface: dbus

bus: session

name: org.net_mydomain_MyApp.SingleInstance # Remember to change net_mydomain_MyApp to your app ID

plugs:

single-instance-plug:

interface: dbus

bus: session

name: org.net_mydomain_MyApp.SingleInstance # Remember to change net_mydomain_MyApp to your app ID

# .....

apps:

my-app:

# ...

plugs:

# ....

- single-instance-plug

slots:

# ...

- single-instance

# ....
```

This will allow your app to send and receive requests from/to the DBus service as expected by the Single Instance plugin.

### Flatpak

[Section titled “Flatpak”](#flatpak)

In your flatpak manifest file (your.app.id.yml or your.app.id.json), declare a `--talk-name` and a `--own-name` finish args with the service name:

net.mydomain.MyApp.yml

```
# ...

finish-args:

- --socket=wayland

- --socket=fallback-x11

- --device=dri

- --share=ipc

# ....

- --talk-name=org.net_mydomain_MyApp.SingleInstance # Remember to change net_mydomain_MyApp to your app ID

- --own-name=org.net_mydomain_MyApp.SingleInstance # Remember to change net_mydomain_MyApp to your app ID

# ...
```

This will allow your app to send and receive requests from/to the DBus service as expected by the Single Instance plugin.

## Permissions

[Section titled “Permissions”](#permissions)

Because this Plugin currently does not have JavaScript APIs you do not have to configure [capabilities](/security/capabilities/) to use it.

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/plugin/single-instance.mdx)

Last updated: Aug 28, 2026

[Previous  
Shell](/plugin/shell/)[Next  
SQL](/plugin/sql/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
