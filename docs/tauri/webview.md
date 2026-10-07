# Tauri v2 — Windows, Webviews, Panels, Tray, Splashscreen

> Distilled from `raw/learn-window-customization.md`, `raw/learn-system-tray.md`, `raw/learn-splashscreen.md`, plus the multi-webview pattern from upstream `reference/javascript/api/namespacewebview*`.

## Super-app layout → Tauri surfaces

| Panel             | Implementation (Phase 0)                     | Later option Passo                          |
| :---------------- | :------------------------------------------- | :------------------------------------------ |
| Commands (left)   | React route in main window                   | own webview with narrowed capability        |
| Git tree (center) | React route in main window (`@xyflow/react`) | own webview, `git:` event stream            |
| Flows `:8086`     | `<iframe>` right tab                         | second webview over `http://localhost:8086` |
| DS `:8085`        | `<iframe>` right tab                         | same, second tab target                     |
| Terminal (bottom) | `xterm.js` + `Channel` stream                | detachable `WebviewWindow`                  |

Phase 0 is single-window + iframes (CSS grid, no Rust windowing code). Multi-webview is the hardening step.

## Right-panel iframe (Phase 0)

```tsx
function FlowsPanel({ node }: { node?: string }) {
  const [online, setOnline] = useState(false);
  useEffect(() => {
    fetch("http://localhost:8086", { mode: "no-cors" })
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);
  if (!online)
    return (
      <EmptyPanel
        port={8086}
        startCmd="bun run start:web"
        cwd="flows/worktrees-studio"
      />
    );
  return (
    <iframe
      title="flows"
      src={`http://localhost:8086/${node ? `?node=${node}` : ""}`}
      className="h-full w-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
```

The `openURL` field ported from `AppCommands.swift` becomes this `src`. Requires `frame-src http://localhost:*` in CSP (`capabilities.md`).

## Multi-webview split (hardening)

```ts
import { Webview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";

const win = getCurrentWindow();
const { width, height } = await win.innerSize();
// Right-half webview hosting Flows dev server:
const flows = new Webview(win, "flows", {
  url: "http://localhost:8086",
  x: Math.floor(width / 2),
  y: 0,
  width: Math.ceil(width / 2),
  height,
});
await flows.once("tauri://created", () => {});
// Re-layout on window resize via win.onResized → flows.setSize/setPosition
```

Independent reload/crash isolation per panel; cost is manual resize sync. Keep as follow-up issue.

## Window customization

Decorations, transparency, always-on-top, and per-platform chrome live in `tauri.conf.json > app.windows[]` and the JS `Window` API (`setTitle`, `minimize`, `setFullscreen`). Custom titlebar = `decorations: false` + own drag region (`data-tauri-drag-region`). Detail: `raw/learn-window-customization.md`.

## System tray

Long-running super-app lives in the tray with menu actions (open Commands, start Flows server, quit):

```rust
// lib.rs sketch — full sample in raw/learn-system-tray.md
use tauri::menu::{Menu, MenuItem};
let open = MenuItem::with_id(app, "open", "Open Commands", true, None::<&str>)?;
let menu = Menu::with_items(app, &[&open])?;
app.tray_by_id("main").unwrap().set_menu(Some(menu))?;
```

## Splashscreen

Two-window pattern: `splashscreen` window shows instantly, `main` stays hidden until frontend `emit("ready")`, then splash closes. Needed once cold start includes server health checks; defer until Phase 1. See `raw/learn-splashscreen.md`.
