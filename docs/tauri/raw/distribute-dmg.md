# DMG

> Scraped from `https://v2.tauri.app/distribute/dmg/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# DMG

The DMG (Apple Disk Image) format is a common macOS installer file that wraps your [App Bundle](/distribute/macos-application-bundle/) in a user-friendly installation window.

The installer window includes your app icon and the Applications folder icon, where the user is expected to drag the app icon to the Applications folder icon to install it.
It is the most common installation method for macOS applications distributed outside the App Store.

This guide only covers details for distributing apps outside the App Store using the DMG format.
See the [App Bundle distribution guide](/distribute/macos-application-bundle/) for more information on macOS distribution options and configurations.
To distribute your macOS app in the App Store, see the [App Store distribution guide](/distribute/app-store/).

To create an Apple Disk Image for your app you can use the Tauri CLI and run the `tauri build` command in a Mac computer:

- [npm](#tab-panel-0-0)
- [yarn](#tab-panel-0-1)
- [pnpm](#tab-panel-0-2)
- [deno](#tab-panel-0-3)
- [bun](#tab-panel-0-4)
- [cargo](#tab-panel-0-5)

```
npm run tauri build -- --bundles dmg
```

```
yarn tauri build --bundles dmg
```

```
pnpm tauri build --bundles dmg
```

```
deno task tauri build --bundles dmg
```

```
bun tauri build --bundles dmg
```

```
cargo tauri build --bundles dmg
```

Note

GUI apps on macOS and Linux do not inherit the `$PATH` from your shell dotfiles (`.bashrc`, `.bash_profile`, `.zshrc`, etc). Check out Tauri’s [fix-path-env-rs](https://github.com/tauri-apps/fix-path-env-rs) crate to fix this issue.

## Window background

[Section titled “Window background”](#window-background)

You can set a custom background image to the DMG installation window with the [`tauri.conf.json > bundle > macOS > dmg > background`] configuration option:

tauri.conf.json

```
{

"bundle": {

"macOS": {

"dmg": {

"background": "./images/"

}

}

}

}
```

For instance your DMG background image can include an arrow to indicate to the user that it must drag the app icon to the Applications folder.

## Window size and position

[Section titled “Window size and position”](#window-size-and-position)

The default window size is 660x400. If you need a different size to fit your custom background image, set the [`tauri.conf.json > bundle > macOS > dmg > windowSize`] configuration:

tauri.conf.json

```
{

"bundle": {

"macOS": {

"dmg": {

"windowSize": {

"width": 800,

"height": 600

}

}

}

}

}
```

Additionally you can set the initial window position via [`tauri.conf.json > bundle > macOS > dmg > windowPosition`]:

tauri.conf.json

```
{

"bundle": {

"macOS": {

"dmg": {

"windowPosition": {

"x": 400,

"y": 400

}

}

}

}

}
```

## Icon position

[Section titled “Icon position”](#icon-position)

You can change the app and _Applications folder_ icon position
with the [appPosition](/reference/config/#appposition) and [applicationFolderPosition](/reference/config/#applicationfolderposition) configuration values respectively:

tauri.conf.json

```
{

"bundle": {

"macOS": {

"dmg": {

"appPosition": {

"x": 180,

"y": 220

},

"applicationFolderPosition": {

"x": 480,

"y": 220

}

}

}

}

}
```

Caution

Due to a known issue, icon sizes and positions are not applied when creating DMGs on CI/CD platforms.
See [tauri-apps/tauri#1731](https://github.com/tauri-apps/tauri/issues/1731) for more information.

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/distribute/dmg.mdx)

Last updated: Jul 21, 2025

[Previous  
Debian](/distribute/debian/)[Next  
Flathub](/distribute/flatpak/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
