# Tauri v2 — Build, Bundle, Sign, Distribute (macOS-first)

> Distilled from `raw/distribute.md`, `raw/distribute-dmg.md`, `raw/distribute-macos-application-bundle.md`, `raw/distribute-sign-macos.md`, `raw/plugin-updater.md`.

## Bundle outputs

```zsh
bun run tauri build
# → src-tauri/target/release/bundle/
#     dmg/<name>_<version>_aarch64.dmg
#     macos/<name>.app
```

`bundle.targets` in `tauri.conf.json` selects artifacts (`["dmg", "app"]` for now; add `"updater"` bundle + `appimage`/`msi` when Windows/Linux ship). Replaces `gui/build-app.sh` (ad-hoc sign + Desktop copy).

## macOS bundle layout (what `tauri build` produces)

```
Worktrees Studio Commands.app/Contents/
  MacOS/<binary>          # Rust core
  Resources/              # frontendDist files, resources/, icons
  Frameworks/             # WebView deps where needed
  Info.plist              # from tauri.conf.json app metadata
```

Icons: `bun run tauri icon assets/icon.png` generates `src-tauri/icons/*.icns/.ico/.png` up front. Category `DeveloperTool`, identifier `id.sch.myapp.commands` (match future notarization profile).

## Signing (macOS)

Ad-hoc (`codesign -s -`) suffices for local dev — same as today. Distribution requires:

1. Apple Developer ID Application certificate in keychain.
2. `bun run tauri build` picks it up via `APPLE_CERTIFICATE` / keychain identity env.
3. Notarize: `xcrun notarytool submit <dmg> --keychain-profile <profile> --wait`, then `xcrun stapler staple`.
4. Env-gated in CI (`distribute/pipelines/github` upstream pattern): sign+notarize only on `release` tags; PR builds stay unsigned.

See `raw/distribute-sign-macos.md` for env var names and hardened-runtime entitlements (WebView + sidecar execution need `com.apple.security.cs.allow-unsigned-executable-memory` and file-access exceptions where applicable).

## Updater artifacts

With `plugins.updater.active`, `tauri build` additionally emits `.tar.gz` + `.sig` per target plus `latest.json`. Publish all three + the installer to the release endpoint; the client diffs `current_version` vs manifest. Rotate the minisign keypair per environment (staging key ≠ prod key).

## Release checklist

- [ ] `productName`, `version`, `identifier` bumped (single source: workspace `package.json` → `tauri.conf.json`).
- [ ] Capability files reviewed (no `args: true` without `cwd`, no secret env).
- [ ] Icons regenerated if changed.
- [ ] Signed + notarized DMG attached to GitHub release with `latest.json`.
- [ ] Sprint file records DMG checksum + install smoke (replaces `build-app.sh` Desktop-copy evidence).
