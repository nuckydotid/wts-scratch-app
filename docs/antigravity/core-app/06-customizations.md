# Antigravity Customizations: MCP, Skills, Rules, Hooks, Plugins & Sidecars

Google Antigravity provides a modular customization architecture allowing developers to customize agent behavior, inject external tools, enforce repository rules, and hook into agent lifecycle events.

---

## 1. Customization System Overview & Loading Priority

Customizations are discovered and merged across three hierarchical levels (highest priority wins):

```mermaid
graph TD
    Workspace[Workspace Customizations .gemini/antigravity/ or .agentrules/]
    Global[User Global Customizations ~/.gemini/antigravity/]
    Builtin[System Built-in Capabilities / Builtin Skills]

    Workspace -->|Overrides| Global
    Global -->|Overrides| Builtin
```

| Customization Type               | File / Directory Format                             | Primary Purpose                                                                                |
| :------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Model Context Protocol (MCP)** | `mcp.json` / `settings.json`                        | Exposes external tools, databases, APIs, and resources via standardized MCP protocol.          |
| **Skills**                       | `SKILL.md` in skill directories                     | Reusable multi-file instruction packages with scripts, references, and tool scopes.            |
| **Rules**                        | `AGENTS.md`, `.agentrules`                          | Continuous, persistent repository conventions, architectural patterns, and coding standards.   |
| **Workflows**                    | `.agentworkflows`, `.gemini/antigravity/workflows/` | Deterministic multi-step task playbooks triggered by name or slash command.                    |
| **Hooks**                        | `hooks.json`, `.gemini/antigravity/hooks.json`      | Event-driven triggers executed before/after tools, on agent startup, or prompt entry.          |
| **Plugins**                      | `plugin.json` in plugin bundle                      | Self-contained distributable packages bundling skills, rules, hooks, and MCP servers.          |
| **Sidecars**                     | `sidecar.json`, `.gemini/antigravity/sidecars/`     | Persistent background processes and local language servers providing real-time data to agents. |

---

## 2. Model Context Protocol (MCP)

MCP enables Antigravity to interact securely with local databases, cloud APIs, issue trackers, and third-party tools via `stdio` or `sse` transports.

### Configuration Format (`mcp.json`)

Location: `~/.gemini/antigravity/mcp.json` or `.gemini/antigravity/mcp.json`

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost:5432/mydb"
      ],
      "env": {
        "PGSSLMODE": "disable"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "remote-service": {
      "url": "https://mcp.internal.company.com/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer ${COMPANY_MCP_TOKEN}"
      }
    }
  }
}
```

---

## 3. Agent Skills (`SKILL.md`)

A **Skill** is a specialized capability folder containing instructions, reference docs, and optional automation scripts.

### Directory Structure

```
my-custom-skill/
├── SKILL.md              # Required: YAML frontmatter + markdown instructions
├── scripts/              # Optional: Helper scripts executable by the agent
├── references/           # Optional: In-depth technical reference docs
└── examples/             # Optional: Reference implementations
```

### `SKILL.md` Specification

```markdown
---
name: database-migrator
description: Automates PostgreSQL zero-downtime schema migrations and index audits. Use when altering tables or adding indexes.
model: inherit
---

# Database Migration Expert

When modifying database schemas:

1. Always create backward-compatible additions first.
2. Use `CONCURRENTLY` when creating PostgreSQL indexes.
3. Validate table locking implications using the script in `scripts/check_locks.py`.
```

---

## 4. Rules (`AGENTS.md` & `.agentrules`)

Rules enforce continuous architectural guidelines, code styling, and business logic.

- **Workspace Rules**: Root `AGENTS.md` or `.agentrules` in your repository.
- **Global Rules**: `~/.gemini/antigravity/AGENTS.md`.
- **Targeted Rules**: Use path-scoped rules or `@` mentions (e.g. `@RULE[docs/app/AGENTS.md]`).

```markdown
# Repository Engineering Rules

- All React components must be functional components with TypeScript types.
- Always use Bun as the default package manager.
- Any API endpoint modification in `src/routes/` MUST include an accompanying integration test in `tests/api/`.
```

---

## 5. Hooks (`hooks.json`)

Hooks execute arbitrary shell commands or validation checks when specific agent events occur.

### Supported Hook Events

- `agent:startup` — Triggered when a new agent conversation or subagent initializes.
- `tool:pre` — Triggered immediately before an agent executes a tool (can cancel or modify parameters).
- `tool:post` — Triggered after a tool completes execution (ideal for linting or test checking).
- `session:end` — Triggered when an agent finishes its work.
- `user:prompt` — Triggered when the user submits a new prompt.

### `hooks.json` Example

```json
{
  "hooks": [
    {
      "event": "tool:post",
      "filter": {
        "tool": "replace_file_content",
        "path": "*.ts"
      },
      "command": "bun run lint:fix ${file_path}"
    },
    {
      "event": "session:end",
      "command": "bun test"
    }
  ]
}
```

---

## 6. Plugins & Sidecars

- **Plugins**: Bundles that package skills, rules, hooks, and MCP servers into a single shareable directory with a `plugin.json` manifest.
- **Sidecars**: Persistent helper processes defined in `sidecar.json` that run alongside Antigravity, exposing local metrics, AST parsers, or language daemons to the agent.
