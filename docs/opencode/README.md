# OpenCode on MacBook — IDE Config Guide

> Scraped from `https://opencode.ai/docs/` (last fetch: 2026-09-09, opencode `1.18.13`) and tailored to this Bun monorepo on Apple Silicon MacBook Air (`Darwin ARM64`, `/bin/zsh`, `bun 1.3.14`).
> Full schema source of truth: `https://opencode.ai/config.json` (runtime) + `https://opencode.ai/tui.json` (TUI). Declare `"$schema"` in every JSON file so editors validate.

## What lives here

| File                                                             | Covers                                                                                                         | Upstream docs distilled                                                                                                                                                                                                                                                                                                                    |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                           | Agent instructions for opencode in Worktrees Studio (bun-only, HeroUI, Expo Router, Hono RPC, MMKV)                      | [Rules](https://opencode.ai/docs/rules/)                                                                                                                                                                                                                                                                                                   |
| [ide-macbook.md](ide-macbook.md)                                 | VS Code / Cursor / Windsurf extension, `Cmd+Esc`, `EDITOR`, truecolor                                          | [IDE](https://opencode.ai/docs/ide/), [TUI#editor-setup](https://opencode.ai/docs/tui/)                                                                                                                                                                                                                                                    |
| [config.md](config.md)                                           | Precedence (remote → global → project), `opencode.json` + `tui.json` copy-paste templates                      | [Config](https://opencode.ai/docs/config/)                                                                                                                                                                                                                                                                                                 |
| [skills.md](skills.md)                                           | `SKILL.md` discovery, frontmatter, naming regex, permissions, `.agents/skills` bridge                          | [Skills](https://opencode.ai/docs/skills/)                                                                                                                                                                                                                                                                                                 |
| [agents-commands-permissions.md](agents-commands-permissions.md) | `build` / `plan` / `general` / `explore` / `scout`, custom `/commands`, `permission` last-match-wins           | [Agents](https://opencode.ai/docs/agents/), [Commands](https://opencode.ai/docs/commands/), [Permissions](https://opencode.ai/docs/permissions/)                                                                                                                                                                                           |
| [tools-mcp-plugins.md](tools-mcp-plugins.md)                     | Built-in tools, MCP local/remote/OAuth, Prettier formatters, TypeScript LSP, plugins, custom tools, references | [Tools](https://opencode.ai/docs/tools/), [MCP](https://opencode.ai/docs/mcp-servers/), [Formatters](https://opencode.ai/docs/formatters/), [LSP](https://opencode.ai/docs/lsp/), [Plugins](https://opencode.ai/docs/plugins/), [Custom Tools](https://opencode.ai/docs/custom-tools/), [References](https://opencode.ai/docs/references/) |
| [tui-cli-models.md](tui-cli-models.md)                           | TUI `/commands`, CLI `run/serve/web/attach`, models/providers (`/connect`, `/models`), themes, keybinds        | [TUI](https://opencode.ai/docs/tui/), [CLI](https://opencode.ai/docs/cli/), [Models](https://opencode.ai/docs/models/), [Providers](https://opencode.ai/docs/providers/), [Themes](https://opencode.ai/docs/themes/), [Keybinds](https://opencode.ai/docs/keybinds/)                                                                       |
| [migration.md](migration.md)                                     | Antigravity → OpenCode file map + sync checklist                                                               | `.agents/` → `.opencode/` port (2026-09-09)                                                                                                                                                                                                                                                                                                |
| [roadmap.md](roadmap.md)                                         | Full-potential phased plan (wiring, runtime, intelligence, proof)                                              | This repo — execution tracker                                                                                                                                                                                                                                                                                                              |
| [baseline.md](baseline.md)                                       | Resolved-config + trial-session verification log (2026-09-09)                                                  | This repo — proof record                                                                                                                                                                                                                                                                                                                   |

## 60-second MacBook quickstart

```zsh
# 1. Shell + package manager (this repo is Bun-only)
echo $SHELL            # expect /bin/zsh
bun --version          # expect 1.3.x
opencode --version     # expect 1.18.x

# 2. Global config is minimal today (~/.config/opencode/opencode.jsonc = {"$schema": ...})
#    Keep secrets OUT of git: use /connect (writes ~/.local/share/opencode/auth.json)
opencode auth login

# 3. Run from repo root so project opencode.json is found
opencode .

# 4. Inside TUI
/connect   # add provider
/models    # pick e.g. anthropic/claude-sonnet-4-5
/init      # (re)generates AGENTS.md guidance
```

## Global vs project split (this machine)

- **Global** `~/.config/opencode/opencode.jsonc`: user-wide model, shell `/bin/zsh`, TUI prefs. Currently only `$schema` — see [config.md](config.md) for recommended fill.
- **Global plugins**: `~/.config/opencode/plugins/gk-hooks.js` (GitKraken hook forwarder — leave alone).
- **Global skills**: `~/.config/opencode/skills/` (agents-sdk, cloudflare, wrangler, etc. — auto-loaded).
- **Project** (to create): `./opencode.json` + `.opencode/{agents,commands,skills,plugins,tools}/` — checked into git, overrides global. See templates in [config.md](config.md).
- **TUI**: `~/.config/opencode/tui.json` (global) + `./tui.json` (project). Legacy `theme`/`keybinds`/`tui` keys inside `opencode.json` are deprecated — use `tui.json`.

> Config is loaded once at startup, not hot-reloaded. After any `opencode.json` / agent / skill / plugin change: **quit and restart opencode**.

## IDE hooks (Mac keys)

- `Cmd+Esc` — open/focus opencode split terminal.
- `Cmd+Shift+Esc` — new session.
- `Cmd+Option+K` — insert `@File#L37-42` reference.
- Selection/active tab is shared automatically.
- Requires IDE CLI on `PATH` (`code`, `cursor`, `windsurf`, `codium`). On this MacBook `code`/`cursor` were **not found** — fix via `Cmd+Shift+P` → `Shell Command: Install 'code' command in PATH`. Full steps: [ide-macbook.md](ide-macbook.md).

## Verify after wiring

```zsh
opencode debug config   # resolved merged config (remote → global → project → managed)
opencode models         # exact provider/model IDs for config
opencode mcp list       # MCP connection status
opencode agent list     # build, plan, general, explore (+ custom)
echo $COLORTERM         # want truecolor/24bit for themes; else export COLORTERM=truecolor
```
