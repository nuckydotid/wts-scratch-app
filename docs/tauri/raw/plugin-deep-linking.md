# Deep Linking

> Scraped from `https://v2.tauri.app/plugin/deep-linking/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Deep Linking

[GitHub](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/deep-link)[npm](https://www.npmx.dev/package/@tauri-apps/plugin-deep-link)[crates.io](https://crates.io/crates/tauri-plugin-deep-link)

API Reference:

Set your Tauri application as the default handler for an URL.

## Supported Platforms

[Section titled “Supported Platforms”](#supported-platforms)

_This plugin requires a Rust version of at least **1.77.2**_

| Platform | Level | Notes                                                                                      |
| -------- | ----- | ------------------------------------------------------------------------------------------ |
| windows  |       |                                                                                            |
| linux    |       |                                                                                            |
| macos    |       | Deep links must be registered in config. Dynamic registration at runtime is not supported. |
| android  |       | Deep links must be registered in config. Dynamic registration at runtime is not supported. |
| ios      |       | Deep links must be registered in config. Dynamic registration at runtime is not supported. |

## Setup

[Section titled “Setup”](#setup)

Install the deep-link plugin to get started.

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
npm run tauri add deep-link
```

```
yarn run tauri add deep-link
```

```
pnpm tauri add deep-link
```

```
deno task tauri add deep-link
```

```
bun tauri add deep-link
```

```
cargo tauri add deep-link
```

1. Run the following command in the `src-tauri` folder to add the plugin to the project’s dependencies in `Cargo.toml`:

   ```
   cargo add tauri-plugin-deep-link@2.0.0
   ```

2. Modify `lib.rs` to initialize the plugin:

   src-tauri/src/lib.rs

   ```
   #[cfg_attr(mobile, tauri::mobile_entry_point)]

   pub fn run() {

   tauri::Builder::default()

   .plugin(tauri_plugin_deep_link::init())

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
   npm install @tauri-apps/plugin-deep-link
   ```

   ```
   yarn add @tauri-apps/plugin-deep-link
   ```

   ```
   pnpm add @tauri-apps/plugin-deep-link
   ```

   ```
   deno add npm:@tauri-apps/plugin-deep-link
   ```

   ```
   bun add @tauri-apps/plugin-deep-link
   ```

## Setting up

[Section titled “Setting up”](#setting-up)

### Android

[Section titled “Android”](#android)

There are two ways to open your app from links on Android:

1. **App Links (http/https + host, verified)**
   For [app links](https://developer.android.com/training/app-links#android-app-links), you need a server with a
   `.well-known/assetlinks.json` endpoint that must return a text response in the given format:

.well-known/assetlinks.json

```
[

{

"relation": ["delegate_permission/common.handle_all_urls"],

"target": {

"namespace": "android_app",

"package_name": "$APP_BUNDLE_ID",

"sha256_cert_fingerprints": [

$CERT_FINGERPRINT

]

}

}

]
```

Where `$APP_BUNDLE_ID` is the value defined on [`tauri.conf.json > identifier`](/reference/config/#identifier) with `-` replaced with `_` and
`$CERT_FINGERPRINT` is a list of SHA256 fingerprints of your app’s signing certificates,
see [verify Android applinks](https://developer.android.com/training/app-links/verify-android-applinks#web-assoc) for more information.

2. **Custom URI schemes (no host required, no verification)**
   For URIs like `myapp://...`, you can declare a custom scheme without hosting any files. Use the `scheme` field in the mobile configuration and omit the `host`.

### iOS

[Section titled “iOS”](#ios)

There are two ways to open your app from links on iOS:

1. **Universal Links (https + host, verified)**
   For [universal links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content?language=objc), you need a server with a `.well-known/apple-app-site-association` endpoint that must return a JSON response
   in the given format:

.well-known/apple-app-site-association

```
{

"applinks": {

"details": [

{

"appIDs": ["$DEVELOPMENT_TEAM_ID.$APP_BUNDLE_ID"],

"components": [

{

"/": "/open/*",

"comment": "Matches any URL whose path starts with /open/"

}

]

}

]

}

}
```

Note

The response `Content-Type` header must be `application/json`.

The `.well-known/apple-app-site-association` endpoint must be served over HTTPS.
To test localhost you can either use a self-signed TLS certificate and install it on the iOS simulator or use services like [ngrok](https://ngrok.com/).

Where `$DEVELOPMENT_TEAM_ID` is the value defined on `tauri.conf.json > bundle > iOS > developmentTeam` or the
`TAURI_APPLE_DEVELOPMENT_TEAM` environment variable and `$APP_BUNDLE_ID` is the value defined on [`tauri.conf.json > identifier`](/reference/config/#identifier).

To verify if your domain has been properly configured to expose the app associations, you can run the following command,
replacing with your actual host:

Terminal window

```
curl -v https://app-site-association.cdn-apple.com/a/v1/
```

See [applinks.details](https://developer.apple.com/documentation/bundleresources/applinks/details-swift.dictionary) for more information.

2. **Custom URI schemes (no host, no verification)**
   For URIs like `myapp://...`, you can declare a custom scheme under mobile configuration with `"appLink": false` (or omit it). The plugin generates the appropriate `CFBundleURLTypes` entries in your app’s Info.plist. No `.well-known` files or HTTPS host are needed.

### Desktop

[Section titled “Desktop”](#desktop)

On Linux and Windows deep links are delivered as a command line argument to a new app process.
The deep link plugin has integration with the [single instance](/plugin/single-instance/) plugin if you prefer having a unique app instance receiving the events.

- First you must add the `deep-link` feature to the single instance plugin:

src-tauri/Cargo.toml

```
[target."cfg(any(target_os = \"macos\", windows, target_os = \"linux\"))".dependencies]

tauri-plugin-single-instance = { version = "2.0.0", features = ["deep-link"] }
```

- Then configure the single instance plugin which should always be the first plugin you register:

src-tauri/lib.rs

```
#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {

let mut builder = tauri::Builder::default();

#[cfg(desktop)]

{

builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {

println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");

// when defining deep link schemes at runtime, you must also check `argv` here

}));

}

builder = builder.plugin(tauri_plugin_deep_link::init());

}
```

Caution

The user could trigger a fake deep link manually by including the URL as argument.
Tauri matches the command line argument against the configured schemes to mitigate this,
but you should still check if the URL matches the format you expect.

This means Tauri only handles deep links for schemes that were statically configured,
and schemes registered at runtime must be manually checked using [`Env::args_os`](https://docs.rs/tauri/2.0.0/tauri/struct.Env.html#structfield.args_os).

## Configuration

[Section titled “Configuration”](#configuration)

Under `tauri.conf.json > plugins > deep-link`, configure mobile domains/schemes and desktop schemes you want to associate with your application.

### Examples

[Section titled “Examples”](#examples)

**Custom scheme on mobile (no server required):**

tauri.conf.json

```
{

"plugins": {

"deep-link": {

"mobile": [

{

"scheme": ["ovi"],

"appLink": false

}

]

}

}

}
```

This registers the `ovi://*` scheme on Android and iOS.

**App Link / Universal Link (verified https + host):**

```
{

"plugins": {

"deep-link": {

"mobile": [

{

"scheme": ["https"],

"host": "your.website.com",

"pathPrefix": ["/open"],

"appLink": true

}

]

}

}

}
```

This registers `https://your.website.com/open/*` as an app/universal link.

**Desktop custom schemes:**

```
{

"plugins": {

"deep-link": {

"desktop": {

"schemes": ["something", "my-tauri-app"]

}

}

}

}
```

## Usage

[Section titled “Usage”](#usage)

The deep-link plugin is available in both JavaScript and Rust.

### Listening to Deep Links

[Section titled “Listening to Deep Links”](#listening-to-deep-links)

- [JavaScript](#tab-panel-3-0)
- [Rust](#tab-panel-3-1)

When a deep link triggers your app while it’s running, the `onOpenUrl` callback is called. To detect whether your app was opened via a deep link, use `getCurrent` on app start.

```
import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';

// when using `"withGlobalTauri": true`, you may use

// const { getCurrent, onOpenUrl } = window.__TAURI__.deepLink;

const startUrls = await getCurrent();

if (startUrls) {

// App was likely started via a deep link

// Note that getCurrent's return value will also get updated every time onOpenUrl gets triggered.

}

await onOpenUrl((urls) => {

console.log('deep link:', urls);

});
```

When a deep link triggers your app while it’s running, the plugin’s `on_open_url` closure is called. To detect whether your app was opened via a deep link, use `get_current` on app start.

src-tauri/src/lib.rs

```
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {

tauri::Builder::default()

.plugin(tauri_plugin_deep_link::init())

.setup(|app| {

// Note that get_current's return value will also get updated every time on_open_url gets triggered.

let start_urls = app.deep_link().get_current()?;

if let Some(urls) = start_urls {

// app was likely started by a deep link

println!("deep link URLs: {:?}", urls);

}

app.deep_link().on_open_url(|event| {

println!("deep link URLs: {:?}", event.urls());

});

Ok(())

})

.run(tauri::generate_context!())

.expect("error while running tauri application");

}
```

Note

The open URL event is triggered with a list of URLs that were requested to be compatible with the macOS API for deep links,
but in most cases your app will only receive a single URL.

### Registering Desktop Deep Links at Runtime

[Section titled “Registering Desktop Deep Links at Runtime”](#registering-desktop-deep-links-at-runtime)

The [configuration](#configuration) section describes how to define static deep link schemes for your application.

On Linux and Windows it is possible to also associate schemes with your application at runtime via the `register` Rust function.

In the following snippet, we will register the `my-app` scheme at runtime. After executing the app for the first time,
the operating system will open `my-app://*` URLs with our application:

src-tauri/src/lib.rs

```
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {

tauri::Builder::default()

.plugin(tauri_plugin_deep_link::init())

.setup(|app| {

#[cfg(desktop)]

app.deep_link().register("my-app")?;

Ok(())

})

.run(tauri::generate_context!())

.expect("error while running tauri application");

}
```

Note

Registering the deep links at runtime can be useful for developing on Linux and Windows
as by default the deep link is only registered when your app is installed.

Installing an AppImage can be complicated as it requires an AppImage launcher.

Registering the deep links at runtime might be preferred, so Tauri also includes a
helper function to force register all statically configured deep links at runtime.
Calling this function also ensures the deep links is registered for development mode:

```
#[cfg(any(target_os = "linux", all(debug_assertions, windows)))]

{

use tauri_plugin_deep_link::DeepLinkExt;

app.deep_link().register_all()?;

}
```

## Testing

[Section titled “Testing”](#testing)

There are some caveats to test deep links for your application.

### Desktop

[Section titled “Desktop”](#desktop-1)

Deep links are only triggered for installed applications on desktop.
On Linux and Windows you can circumvent this using the [`register_all`](https://docs.rs/tauri-plugin-deep-link/2.0.0/tauri_plugin_deep_link/struct.DeepLink.html#method.register_all) Rust function,
which registers all configured schemes to trigger the current executable:

src-tauri/src/lib.rs

```
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {

tauri::Builder::default()

.plugin(tauri_plugin_deep_link::init())

.setup(|app| {

#[cfg(any(windows, target_os = "linux"))]

{

use tauri_plugin_deep_link::DeepLinkExt;

app.deep_link().register_all()?;

}

Ok(())

})

.run(tauri::generate_context!())

.expect("error while running tauri application");

}
```

Note

Installing an AppImage that supports deep links on Linux requires an AppImage launcher to integrate the AppImage with the operating system.
Using the `register_all` function you can support deep links out of the box, without requiring your users to use external tools.

When the AppImage is moved to a different location in the file system, the deep link is invalidated since it leverages an absolute path
to the executable, which makes registering the schemes at runtime even more important.

See the [Registering Desktop Deep Links at Runtime](#registering-desktop-deep-links-at-runtime) section for more information.

Caution

Registering deep links at runtime is not possible on macOS, so deep links can only be tested on the bundled application,
which must be installed in the `/Applications` directory.

#### Windows

[Section titled “Windows”](#windows)

To trigger a deep link on Windows you can either open `://url` in the browser or run the following command in the terminal:

Terminal window

```
start ://url
```

#### Linux

[Section titled “Linux”](#linux)

To trigger a deep link on Linux you can either open `://url` in the browser or run `xdg-open` in the terminal:

Terminal window

```
xdg-open ://url
```

### iOS

[Section titled “iOS”](#ios-1)

To trigger an app link on iOS you can open the `https:///path` URL in the browser. For simulators you can leverage the `simctl` CLI to directly open a link from the terminal:

Terminal window

```
xcrun simctl openurl booted https:///path
```

### Android

[Section titled “Android”](#android-1)

To trigger an app link on Android you can open the `https:///path` URL in the browser. For emulators you can leverage the `adb` CLI to directly open a link from the terminal:

Terminal window

```
adb shell am start -a android.intent.action.VIEW -d https:///path
```

## Permissions

[Section titled “Permissions”](#permissions)

By default all potentially dangerous plugin commands and scopes are blocked and cannot be accessed. You must modify the permissions in your `capabilities` configuration to enable these.

See the [Capabilities Overview](/security/capabilities/) for more information and the [step by step guide](/learn/security/using-plugin-permissions/) to use plugin permissions.

src-tauri/capabilities/default.json

```
{

"$schema": "../gen/schemas/mobile-schema.json",

"identifier": "mobile-capability",

"windows": ["main"],

"platforms": ["iOS", "android"],

"permissions": [

// Usually you will need core:event:default to listen to the deep-link event

"core:event:default",

"deep-link:default"

]

}
```

## [Default Permission](#default-permission)

Allows reading the opened deep link via the get\_current command

#### This default permission set includes the following:

- `allow-get-current`

## Permission Table

| Identifier                      | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `deep-link:allow-get-current`   | Enables the get\_current command without any pre-configured scope.   |
| `deep-link:deny-get-current`    | Denies the get\_current command without any pre-configured scope.    |
| `deep-link:allow-is-registered` | Enables the is\_registered command without any pre-configured scope. |
| `deep-link:deny-is-registered`  | Denies the is\_registered command without any pre-configured scope.  |
| `deep-link:allow-register`      | Enables the register command without any pre-configured scope.       |
| `deep-link:deny-register`       | Denies the register command without any pre-configured scope.        |
| `deep-link:allow-unregister`    | Enables the unregister command without any pre-configured scope.     |
| `deep-link:deny-unregister`     | Denies the unregister command without any pre-configured scope.      |

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/plugin/deep-linking.mdx)

Last updated: Jun 15, 2026

[Previous  
Clipboard](/plugin/clipboard/)[Next  
Dialog](/plugin/dialog/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
