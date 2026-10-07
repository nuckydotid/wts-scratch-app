# Debug

> Scraped from `https://v2.tauri.app/develop/debug/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Debug

With all the moving pieces in Tauri, you may run into a problem that requires debugging. There are many locations where error details are printed, and Tauri includes some tools to make the debugging process more straightforward.

## Development Only Code

[Section titled “Development Only Code”](#development-only-code)

One of the most useful tools in your toolkit for debugging is the ability to add debugging statements in your code. However, you generally don’t want these to end up in production, which is where the ability to check whether you’re running in development mode or not comes in handy.

### In Rust

[Section titled “In Rust”](#in-rust)

```
fn main() {

// Whether the current instance was started with `tauri dev` or not.

#[cfg(dev)]

{

// `tauri dev` only code

}

if cfg!(dev) {

// `tauri dev` only code

} else {

// `tauri build` only code

}

let is_dev: bool = tauri::is_dev();

// Whether debug assertions are enabled or not. This is true for `tauri dev` and `tauri build --debug`.

#[cfg(debug_assertions)]

{

// Debug only code

}

if cfg!(debug_assertions) {

// Debug only code

} else {

// Production only code

}

}
```

## Rust Console

[Section titled “Rust Console”](#rust-console)

The first place to look for errors is in the Rust Console. This is in the terminal where you ran, e.g., `tauri dev`. You can use the following code to print something to that console from within a Rust file:

```
println!("Message from Rust: {}", msg);
```

Sometimes you may have an error in your Rust code, and the Rust compiler can give you lots of information. If, for example, `tauri dev` crashes, you can rerun it like this on Linux and macOS:

```
RUST_BACKTRACE=1 tauri dev
```

or like this on Windows (PowerShell):

```
$env:RUST_BACKTRACE=1

tauri dev
```

This command gives you a granular stack trace. Generally speaking, the Rust compiler helps you by
giving you detailed information about the issue, such as:

```
error[E0425]: cannot find value `sun` in this scope

--> src/main.rs:11:5

|

11 |     sun += i.to_string().parse::().unwrap();

|     ^^^ help: a local variable with a similar name exists: `sum`

error: aborting due to previous error

For more information about this error, try `rustc --explain E0425`.
```

## WebView Console

[Section titled “WebView Console”](#webview-console)

Right-click in the WebView, and choose `Inspect Element`. This opens up a web-inspector similar to the Chrome or Firefox dev tools you are used to.
You can also use the `Ctrl + Shift + i` shortcut on Linux and Windows, and `Command + Option + i` on macOS to open the inspector.

The inspector is platform-specific, rendering the webkit2gtk WebInspector on Linux, Safari’s inspector on macOS and the Microsoft Edge DevTools on Windows.

### Opening Devtools Programmatically

[Section titled “Opening Devtools Programmatically”](#opening-devtools-programmatically)

You can control the inspector window visibility by using the [`WebviewWindow::open_devtools`](https://docs.rs/tauri/2.0.0/tauri/webview/struct.WebviewWindow.html#method.open_devtools) and [`WebviewWindow::close_devtools`](https://docs.rs/tauri/2.0.0/tauri/webview/struct.WebviewWindow.html#method.close_devtools) functions:

```
tauri::Builder::default()

.setup(|app| {

#[cfg(debug_assertions)] // only include this code on debug builds

{

let window = app.get_webview_window("main").unwrap();

window.open_devtools();

window.close_devtools();

}

Ok(())

});
```

### Using the Inspector in Production

[Section titled “Using the Inspector in Production”](#using-the-inspector-in-production)

By default, the inspector is only enabled in development and debug builds unless you enable it with a Cargo feature.

#### Create a Debug Build

[Section titled “Create a Debug Build”](#create-a-debug-build)

To create a debug build, run the `tauri build --debug` command.

- [npm](#tab-panel-0-0)
- [yarn](#tab-panel-0-1)
- [pnpm](#tab-panel-0-2)
- [deno](#tab-panel-0-3)
- [bun](#tab-panel-0-4)
- [cargo](#tab-panel-0-5)

```
npm run tauri build -- --debug
```

```
yarn tauri build --debug
```

```
pnpm tauri build --debug
```

```
deno task tauri build --debug
```

```
bun tauri build --debug
```

```
cargo tauri build --debug
```

Like the normal build and dev processes, building takes some time the first time you run this command but is significantly faster on subsequent runs.
The final bundled app has the development console enabled and is placed in `src-tauri/target/debug/bundle`.

You can also run a built app from the terminal, giving you the Rust compiler notes (in case of errors) or your `println` messages. Browse to the file `src-tauri/target/(release|debug)/[app name]` and run it in directly in your console or double-click the executable itself in the filesystem (note: the console closes on errors with this method).

##### Enable Devtools Feature

[Section titled “Enable Devtools Feature”](#enable-devtools-feature)

Danger

The devtools API is private on macOS. Using private APIs on macOS prevents your application from being accepted to the App Store.

To enable the devtools in **production builds**, you must enable the `devtools` Cargo feature in the `src-tauri/Cargo.toml` file:

```
[dependencies]

tauri = { version = "...", features = ["...", "devtools"] }
```

## Debugging the Core Process

[Section titled “Debugging the Core Process”](#debugging-the-core-process)

The Core process is powered by Rust so you can use GDB or LLDB to debug it. You can follow the [Debugging in VS Code](/develop/debug/vscode/) guide to learn how to use the LLDB VS Code Extension to debug the Core Process of Tauri applications.

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/develop/Debug/index.mdx)

Last updated: Mar 29, 2025

[Previous  
App Icons](/develop/icons/)[Next  
CrabNebula DevTools](/develop/debug/crabnebula-devtools/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
