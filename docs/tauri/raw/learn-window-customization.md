# Window Customization

> Scraped from `https://v2.tauri.app/learn/window-customization/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Window Customization

Tauri provides lots of options for customizing the look and feel of your app’s window. You can create custom titlebars, have transparent windows, enforce size constraints, and more.

## Configuration

[Section titled “Configuration”](#configuration)

There are three ways to change the window configuration:

- [Through
  tauri.conf.json](/reference/config/#windowconfig)
- [Through the JavaScript
  API](/reference/javascript/api/namespacewindow/#window)
- [Through the Window in
  Rust](https://docs.rs/tauri/2.0.0/tauri/window/struct.Window.html)

## Usage

[Section titled “Usage”](#usage)

- [Creating a Custom Titlebar](#creating-a-custom-titlebar)
- [(macOS) Transparent Titlebar with Custom Window Background Color](#macos-transparent-titlebar-with-custom-window-background-color)

### Creating a Custom Titlebar

[Section titled “Creating a Custom Titlebar”](#creating-a-custom-titlebar)

A common use of these window features is creating a custom titlebar. This short tutorial will guide you through that process.

Note

For macOS, using a custom titlebar will also lose some features provided by the system, such as [moving or aligning the window](https://support.apple.com/guide/mac-help/work-with-app-windows-mchlp2469/mac). Another approach to customizing the titlebar but keeping native functions could be making the titlebar transparent and setting the window background color. See the usage [(macOS) Transparent Titlebar with Custom Window Background Color](#macos-transparent-titlebar-with-custom-window-background-color).

#### tauri.conf.json

[Section titled “tauri.conf.json”](#tauriconfjson)

Set `decorations` to `false` in your `tauri.conf.json`:

tauri.conf.json

```
"tauri": {

"windows": [

{

"decorations": false

}

]

}
```

#### Permissions

[Section titled “Permissions”](#permissions)

Add window permissions in capability file.

By default, all plugin commands are blocked and cannot be accessed. You must define a list of permissions in your `capabilities` configuration.

See the [Capabilities Overview](/security/capabilities/) for more information and the [step by step guide](/learn/security/using-plugin-permissions/) to use plugin permissions.

src-tauri/capabilities/default.json

```
{

"$schema": "../gen/schemas/desktop-schema.json",

"identifier": "main-capability",

"description": "Capability for the main window",

"windows": ["main"],

"permissions": [

"core:window:default",

"core:window:allow-close",

"core:window:allow-minimize",

"core:window:allow-toggle-maximize",

"core:window:allow-start-dragging"

]

}
```

| Permission                                   | Description                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `core:window:default`                        | Default permissions for the plugin. This includes `core:window:allow-internal-toggle-maximize`. |
| `core:window:allow-close`                    | Enables the close command without any pre-configured scope.                                     |
| `core:window:allow-minimize`                 | Enables the minimize command without any pre-configured scope.                                  |
| `core:window:allow-start-dragging`           | Enables the start\_dragging command without any pre-configured scope.                           |
| `core:window:allow-toggle-maximize`          | Enables the toggle\_maximize command without any pre-configured scope.                          |
| `core:window:allow-internal-toggle-maximize` | Enables the internal\_toggle\_maximize command without any pre-configured scope.                |

#### CSS

[Section titled “CSS”](#css)

Add this CSS sample to keep it at the top of the screen and style the buttons:

```
.titlebar {

height: 30px;

background: #329ea3;

user-select: none;

display: grid;

grid-template-columns: auto max-content;

position: fixed;

top: 0;

left: 0;

right: 0;

}

.titlebar > .controls {

display: flex;

}

.titlebar button {

appearance: none;

padding: 0;

margin: 0;

border: none;

display: inline-flex;

justify-content: center;

align-items: center;

width: 30px;

background-color: transparent;

}

.titlebar button:hover {

background: #5bbec3;

}
```

#### HTML

[Section titled “HTML”](#html)

Put this at the top of your tag:

```
<div class="titlebar">

<div data-tauri-drag-region>div>

<div class="controls">

<button id="titlebar-minimize" title="minimize">

<svg

xmlns="http://www.w3.org/2000/svg"

width="24"

height="24"

viewBox="0 0 24 24"

>

<path fill="currentColor" d="M19 13H5v-2h14z" />

svg>

button>

<button id="titlebar-maximize" title="maximize">

<svg

xmlns="http://www.w3.org/2000/svg"

width="24"

height="24"

viewBox="0 0 24 24"

>

<path fill="currentColor" d="M4 4h16v16H4zm2 4v10h12V8z" />

svg>

button>

<button id="titlebar-close" title="close">

<svg

xmlns="http://www.w3.org/2000/svg"

width="24"

height="24"

viewBox="0 0 24 24"

>

<path

fill="currentColor"

d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"

/>

svg>

button>

div>

div>
```

Note that you may need to move the rest of your content down so that the titlebar doesn’t cover it.

Tip

On Windows, if you just want a title bar that doesn’t need custom interactions, you can use

```
*[data-tauri-drag-region] {

app-region: drag;

}
```

to make the title bar work with touch and pen inputs

#### JavaScript

[Section titled “JavaScript”](#javascript)

Use this code snippet to make the buttons work:

```
import { getCurrentWindow } from '@tauri-apps/api/window';

// when using `"withGlobalTauri": true`, you may use

// const { getCurrentWindow } = window.__TAURI__.window;

const appWindow = getCurrentWindow();

document

.getElementById('titlebar-minimize')

?.addEventListener('click', () => appWindow.minimize());

document

.getElementById('titlebar-maximize')

?.addEventListener('click', () => appWindow.toggleMaximize());

document

.getElementById('titlebar-close')

?.addEventListener('click', () => appWindow.close());
```

Note that if you are using a Rust-based frontend, you can copy the code above into a
