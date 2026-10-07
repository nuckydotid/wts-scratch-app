# worktrees-studio-asset-cache

JS-only module. Downloads assets (fonts, images) from the API server to local disk cache on first launch, serves from local `file://` URI thereafter.

## Dependencies

- `worktrees-studio-mmkv` — tracks cache version and pending downloads
- `expo-file-system` — file operations

## API

```typescript
import { getAssetUrl, ensureAssetsCached } from "worktrees-studio-asset-cache";
```

### `getAssetUrl(relativePath, apiOrigin)`

Returns a local `file://` URI if the asset is cached, or falls back to `${apiOrigin}/api/assets/${relativePath}`.

### `ensureAssetsCached(apiOrigin)`

1. Fetches `${apiOrigin}/api/assets/manifest.json`
2. Compares `version` against cached version in MMKV
3. Downloads all files from manifest to `<cacheDir>/assets_cache/`
4. Updates cached version on success

Returns `boolean`.

## Cache Flow

```
ensureAssetsCached(apiOrigin)
  → fetch manifest.json
  → if version matches: return
  → set MMKV pending=1 (getAssetUrl falls back to server URLs during download)
  → download each file
  → write to local cache directory
  → set MMKV pending=0, update version
```

## Integration

Called once on app launch in `_layout.tsx`. Errors are caught silently.

```typescript
await ensureAssetsCached(apiOrigin);
```
