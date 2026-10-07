# worktrees-studio-ota-updates

Custom OTA (over-the-air) update system. Downloads JS bundles as ZIP files, verifies integrity via SHA-256, and applies them with cold-start mounting.

## Platforms

iOS, Android, Web.

## API

```typescript
import {
  getRuntimeConfig,
  getCurrentBundleId,
  getPendingBundleId,
  downloadUpdateAsync,
  applyUpdateAsync,
  addDownloadListener,
} from "worktrees-studio-ota-updates";
```

### `getRuntimeConfig()`

```typescript
type RuntimeConfig = {
  bundleId: number;
  nativeVersion: string;
  otaEnabled: boolean;
  apiUrl: string;
  otaAppKey: string;
};
```

### `downloadUpdateAsync(zipUrl, bundleId, zipSize?, zipSha256?)`

Downloads and verifies an OTA bundle. Returns `boolean`.

### `applyUpdateAsync()`

Applies the pending update and reloads the app.

### `addDownloadListener(listener)`

Subscribes to download progress events.

```typescript
type DownloadProgressEvent = {
  downloaded: number;
  total: number;
  percent: number;
};
```

## Config Plugin

The `app.plugin.js` (338 lines) does extensive native project modification:

**Android:**

- Injects `OTA_API_URL` and `OTA_APP_KEY` as BuildConfig fields
- Adds metadata to AndroidManifest
- Modifies `MainApplication.kt` — replaces `ExpoReactHostFactory` with `WorktreesStudioExpoReactHostFactory`, overrides `getResources()`/`getAssets()` for OTA overlay, calls `WorktreesStudioOtaBootstrap.configureOta()`
- Syncs 3 Kotlin templates to app source dir

**iOS:**

- Injects `OTA_API_URL` and `OTA_APP_KEY` into Info.plist
- Modifies `AppDelegate` to resolve OTA bundle URL

## Integration

```json
{
  "expo": {
    "plugins": [
      [
        "worktrees-studio-ota-updates",
        {
          "apiUrl": "https://api.example.com",
          "otaAppKey": "your-app-key"
        }
      ]
    ]
  }
}
```

## OTA Lifecycle

```
Cold start → initOtaRuntimeConfig()
  → evaluateMobileVersionPolicy() after defer (1.5-4s)
    → if mandatory: show OTA screen → downloadUpdateAsync() → applyUpdateAsync()
    → if optional: show modal → user can download later
```

## Android Architecture

- `OtaBundleLoader` — manages `AssetManager.addAssetPath` for ZIP mounting, SHA-256 verification
- `OtaManager` — SharedPreferences-based bundle tracking, download with progress
- `WorktreesStudioExpoReactHostFactory` — resolves JS bundle path at load time via OTA
- `WorktreesStudioOtaBootstrap.configureOta()` — called from `MainApplication.onCreate()`

## iOS Architecture

- `OtaManager` — download + extract using ZIPFoundation, SHA-256, UserDefaults
- `OtaBundleLoader` — resolve OTA bundle URL at cold start
- `applyUpdateAsync` calls `appContext.reloadAppAsync()`
