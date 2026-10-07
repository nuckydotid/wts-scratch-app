# Tools, MCP, Formatters, LSP, Plugins, Custom Tools, References

> Upstream: [Tools](https://opencode.ai/docs/tools/), [MCP](https://opencode.ai/docs/mcp-servers/), [Formatters](https://opencode.ai/docs/formatters/), [LSP](https://opencode.ai/docs/lsp/), [Plugins](https://opencode.ai/docs/plugins/), [Custom Tools](https://opencode.ai/docs/custom-tools/), [References](https://opencode.ai/docs/references/).

## Built-in tools (all enabled by default; gate via `permission`)

`bash` (shell cmds), `edit` (exact-replace), `write`+`apply_patch` (both gated by `edit` perm), `read` (ranges), `grep`/`glob` (ripgrep, respects `.gitignore`; un-ignore via `.ignore` with `!dist/`), `lsp` (needs `OPENCODE_EXPERIMENTAL_LSP_TOOL=1`), `skill`, `todowrite` (off for subagents by default), `webfetch` (URL→content), `websearch` (needs Zen/Go provider or `OPENCODE_ENABLE_EXA=1`/`OPENCODE_ENABLE_PARALLEL=1`), `question` (clarifying UI).

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": "deny",
    "bash": "ask",
    "webfetch": "allow",
    "mymcp_*": "ask",
  },
}
```

## MCP servers (`mcp: {name: {type, ...}}`)

`command` is **array** (`["bun","x","cmd"]`, not string), `type` required. `environment`, `cwd`, `timeout` (default 5000ms), `enabled`. Headers/tokens support `{env:VAR}` (not `${VAR}`). Context cost warning: each server adds tokens — enable per-agent for large sets (`tools: {mymcp_*: false}` globally, `true` in agent).

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
    },
    "gh_grep": { "type": "remote", "url": "https://mcp.grep.app" },
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {},
    },
    "local-docs": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command"],
      "enabled": true,
      "environment": { "BROWSER": "chromium" },
    },
  },
}
```

- OAuth auto (401 → Dynamic Client Registration RFC7591, tokens in `~/.local/share/opencode/mcp-auth.json`): `opencode mcp auth <name> | list | logout`, `opencode mcp debug <name>`, `opencode mcp add`. Disable per-server: `"oauth": false` (API-key servers).
- Use in prompt: `Configure Worker cache... use context7`, or `AGENTS.md`: `When you need docs, use context7 tools.`
- Worktrees Studio: prefer `bun x` over `npx -y`; keep D1/SQLite inspection in `.agents/mcp_config.json` for Antigravity, mirror minimal set here.

## Formatters (disabled unless configured)

Built-ins: `prettier` (needs dep in `package.json` — ✅ this repo has it), `biome`, `gofmt`, `rustfmt`, `ruff`/`uv`, `shfmt`, `terraform`, `clang-format`, ... `oxfmt` needs `OPENCODE_EXPERIMENTAL_OXFMT=1`.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "formatter": {
    "prettier": {
      "command": ["bun", "x", "prettier", "--write", "$FILE"],
      "extensions": [".js", ".ts", ".jsx", ".tsx"],
    },
  },
}
```

`true` = all on, `false`/`omit` = all off, `{name: {disabled: true}}` = single off. `$FILE` placeholder. Runs in background after write/edit.

## LSP (disabled unless configured; diagnostics feedback)

Built-ins cover `typescript`/`eslint`/`oxlint` (need dep), `gopls`, `rust-analyzer`, `pyright`, `sourcekit-lsp` (Xcode Swift), `tailwind` via others, etc. Auto-download unless `OPENCODE_DISABLE_LSP_DOWNLOAD=1`.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": true, // all built-ins; entries like `"typescript": {}` are schema-invalid without explicit `command`
}
```

Custom server (entries WITH `command` are valid):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": {
    "custom-lsp": {
      "command": ["custom-lsp-server", "--stdio"],
      "extensions": [".custom"],
      "env": { "RUST_LOG": "debug" },
      "initialization": { "preferences": {} },
    },
  },
}
```

Guidance: for this repo prefer `bun lint/typecheck` CLI feedback in `AGENTS.md` over always-on LSP (LSP can desync + use memory). Enable TS/ESLint only.

## Plugins (extend via hooks + tools)

Auto-load: `.opencode/plugins/*.ts|js` + `~/.config/opencode/plugins/` (this Mac: `gk-hooks.js` GitKraken forwarder). npm: `"plugin": ["opencode-helicone-session", "@my-org/x", "./local.ts", ["name", {opt}]]` (array, not object; Bun installs to `~/.cache/opencode/node_modules/`). Needs `Plugin = (input) => Promise<Hooks>` function export (not object). Deps: `.opencode/package.json` + `bun install` at startup.

```ts
import type { Plugin } from "@opencode-ai/plugin";
export default (async ({ client, $, directory }) => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "read" && output.args.filePath.includes(".env"))
      throw new Error("Do not read .env");
  },
  "shell.env": async (input, output) => {
    output.env.MY_API_KEY = "secret";
  },
  tool: {/* custom tools via tool() helper */},
})) satisfies Plugin;
```

Hooks: `event`, `config`, `chat.message/params/headers`, `tool.execute.before/after`, `tool.definition`, `shell.env`, `permission.ask`, `command.execute.before` (`command.executed`), `file.edited`, `session.*`, `todo.updated`, `tui.*`, `experimental.session.compacting` (push `output.context` or replace `output.prompt`). Log via `client.app.log({body:{service,level,message}})` not `console.log`. macOS notify example: `` await $`osascript -e 'display notification "done" with title "opencode"'` ``.

## Custom tools (`.opencode/tools/*.ts`)

Filename = tool name; multiple exports → `<file>_<export>`; same-name overrides built-in (prefer unique).

```ts
// .opencode/tools/database.ts
import { tool } from "@opencode-ai/plugin";
export default tool({
  description: "Query the project database",
  args: { query: tool.schema.string().describe("SQL query") },
  async execute(args, ctx) {
    return `Executed: ${args.query} in ${ctx.directory} (worktree ${ctx.worktree})`;
  },
});
```

Any language: wrap script via `Bun.$\`python3 ${script} ...\``.

## References (`references: {alias: {path|repository}}`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "references": {
    "docs": {
      "path": "../product-docs",
      "description": "Use for product behavior",
    },
    "worktrees-studio-docs": "../docs",
    "effect": {
      "repository": "Effect-TS/effect",
      "branch": "main",
      "description": "Use for Effect impl",
    },
  },
}
```

`path` (relative/absolute/`~/`) or `repository` (Git URL / `owner/repo`, async clone) + `branch`, `description` (advertised to agents; no desc = autocomplete only), `hidden` (hide `@` menu only). Use: `@alias` / `@alias/file`. Alias bans `/`, whitespace, backticks, commas. Suggested here: `"worktrees-studio-docs": "../docs"` is redundant in-repo; useful in global config pointing at this checkout.
