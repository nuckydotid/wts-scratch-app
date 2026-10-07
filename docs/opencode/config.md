# Config — Precedence, Files, MacBook Templates

> Upstream: [Config](https://opencode.ai/docs/config/), schema `https://opencode.ai/config.json` + `https://opencode.ai/tui.json`. Unknown top-level keys → `ConfigInvalidError` (hard fail). After edits: **restart opencode**.

## Precedence (later wins on conflicting keys, rest merges)

1. Remote `.well-known/opencode` (org defaults)
2. Global `~/.config/opencode/opencode.json[c]` (+ `tui.json`)
3. `OPENCODE_CONFIG` custom path
4. Project `./opencode.json` (+ `./tui.json`) — walks up from cwd to git worktree
5. `.opencode/{agents,commands,skills,plugins,tools,themes}/`
6. `OPENCODE_CONFIG_CONTENT` inline JSON
7. Managed `/Library/Application Support/opencode/` + MDM `ai.opencode.managed` (highest, not overridable)

Escape hatches for broken config: `OPENCODE_DISABLE_PROJECT_CONFIG=1`, `OPENCODE_CONFIG=/path/file.json`, `OPENCODE_CONFIG_CONTENT='{"$schema":"https://opencode.ai/config.json"}'`, `OPENCODE_PURE=1`, `OPENCODE_DISABLE_EXTERNAL_SKILLS=1`.

## File layout on this MacBook

- Global config: `~/.config/opencode/opencode.jsonc` — today just `{"$schema": ...}`. Put user-wide `model`, `shell`, `provider`, `permission` here.
- Project config (create): `./opencode.json` — checked into git, project-specific `instructions`, `formatter`, `lsp`, `mcp`, `permission`.
- TUI config: `~/.config/opencode/tui.json` + `./tui.json`. Do **not** put `theme`/`keybinds` in `opencode.json` (deprecated, auto-migrated).
- Variables: `{env:VAR}` (empty string if unset), `{file:path}` (relative to config, `~`/absolute allowed) — use for keys, never commit secrets.

## Recommended project `opencode.json` (Worktrees Studio, copy-paste)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "/bin/zsh",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "default_agent": "build",
  "share": "manual",
  "autoupdate": "notify",
  "snapshot": true,
  "instructions": [
    "AGENTS.md",
    "docs/opencode/AGENTS.md",
    "apps/app/AGENTS.md",
    "packages/worktrees-studio-ds/AGENTS.md",
    "flows/worktrees-studio/AGENTS.md",
    "modules/AGENTS.md",
  ],
  "formatter": {
    "prettier": {},
  },
  // `true` enables all built-in servers (needs `typescript`/`eslint` deps).
  // Per-server `{}` overrides are rejected by the schema unless they carry
  // an explicit `command` — verified via `opencode debug config`.
  "lsp": true,
  "permission": {
    "bash": {
      "*": "ask",
      "bun *": "allow",
      "bunx *": "allow",
      "git status *": "allow",
      "git diff *": "allow",
      "git log *": "allow",
      "grep *": "allow",
      "rg *": "allow",
      "npm *": "deny",
      "npx *": "deny",
      "yarn *": "deny",
      "pnpm *": "deny",
      "rm -rf *": "deny",
    },
    "edit": "ask",
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow",
    },
    "external_directory": "ask",
  },
  "mcp": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" },
  },
  "compaction": { "auto": true, "reserved": 10000 },
  "watcher": {
    "ignore": [
      "node_modules/**",
      "dist/**",
      ".git/**",
      "apps/*/node_modules/**",
    ],
  },
}
```

Notes:

- `shell: /bin/zsh` matches macOS default; agent `bash` tool uses compatible shells.
- `formatter.prettier` works because repo has `prettier` in root `package.json`. Set `"formatter": true` to enable all built-ins, `false` to disable all.
- `lsp` omitted = disabled. Above enables TS + ESLint (both need `typescript`/`eslint` deps in project). Disable one via `{"disabled": true}`.
- `permission` object order matters: **last match wins** — put `"*"` first, specifics last.
- `model` format is always `provider/model-id` (e.g. `opencode/gpt-5.1-codex` on Zen). Verify with `opencode models`.

## Recommended `tui.json` (MacBook)

```jsonc
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "system", // adapts to terminal bg; or tokyonight / catppuccin
  "scroll_speed": 3,
  "scroll_acceleration": { "enabled": true }, // overrides scroll_speed when true
  "diff_style": "auto",
  "cursor": { "style": "block", "blinking": true },
  "mouse": true,
  "attention": {
    "enabled": true,
    "notifications": true,
    "sound": true,
    "volume": 0.4,
  },
  "keybinds": { "leader": "ctrl+x", "command_list": "ctrl+p" },
}
```

Custom path: `OPENCODE_TUI_CONFIG=/path/tui.json`. Validate with `opencode debug config`.
