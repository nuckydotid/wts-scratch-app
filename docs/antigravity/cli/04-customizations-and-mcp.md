# CLI Customizations & MCP Integration

Extend `agy` with Model Context Protocol (MCP) servers, community plugins, custom skills, statusline formatting, and window title formatting.

---

## 1. MCP Configuration for CLI

The Antigravity CLI automatically loads MCP servers defined in `~/.gemini/antigravity/mcp.json` or `.gemini/antigravity/mcp.json`.

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./dev.db"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

Check loaded MCP servers in `agy`:

```bash
agy mcp list
```

---

## 2. Status Line Customization (`/statusline`)

Customize the status bar rendered at the bottom of the `agy` TUI using template tokens:

### Supported Tokens

- `{model}` — Active reasoning model (e.g., `Gemini 3.7 Flash`)
- `{git_branch}` — Current git branch
- `{tokens_used}` — Session token count
- `{quota_remaining}` — Remaining daily AI credits percentage
- `{subagents_count}` — Number of running background subagents

### Example Configuration (`settings.json`)

```json
{
  "statusline": {
    "format": "⚡ {model} | 🌿 {git_branch} | 🪙 {tokens_used} tokens | 🤖 {subagents_count} active agents"
  }
}
```

---

## 3. Terminal Title Customization (`/title`)

Keep your terminal tabs organized by dynamically formatting window titles:

```json
{
  "terminalTitle": {
    "format": "agy: {project_name} [{git_branch}] - {session_status}"
  }
}
```
