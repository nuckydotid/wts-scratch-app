# Agents, Commands, Permissions

> Upstream: [Agents](https://opencode.ai/docs/agents/), [Commands](https://opencode.ai/docs/commands/), [Permissions](https://opencode.ai/docs/permissions/). Legacy `tools: {x: bool}` is deprecated → use `permission`.

## Agents

Types: `primary` (you talk to; `Tab` cycles; `build` default, `plan` restricted) vs `subagent` (`@mention` or auto-invoked; `general` full-access, `explore` read-only fast, `scout` external-docs/dependency cache). Hidden system: `compaction`, `title`, `summary`.

| Agent     | Mode                                  | Use in Worktrees Studio                                                 |
| :-------- | :------------------------------------ | :------------------------------------------------------------ |
| `build`   | primary, all tools                    | Implementation (default)                                      |
| `plan`    | primary, `edit`/`bash` ask-by-default | Analysis, no code changes                                     |
| `general` | subagent, full (except todo)          | Multi-step research/parallel work                             |
| `explore` | subagent, read-only, no file mods     | `find files by pattern`, `search keywords`, `how does X work` |
| `scout`   | subagent, read-only                   | Upstream lib source in opencode cache vs local code           |

Switch primary: `Tab` / `switch_agent` keybind. Invoke subagent: `@general help me search...`. Child-session nav: `session_child_first` (`<leader>+Down`), cycle `Right`/`Left`, back `Up`.

### Define (prefer files over inline JSON)

`.opencode/agents/review.md` (filename = agent name):

```markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-5
temperature: 0.1
permission:
  edit: deny
  bash: deny
---

You are in code review mode. Focus on: quality, bugs/edge cases, perf, security. No direct changes.
```

Inline equivalent under `agent: { <name>: {...} }` in `opencode.json`. Allowed frontmatter: `name, model, variant, description, mode, hidden, color, steps, options, permission, disable, temperature, top_p` (+ passthrough `options` to provider, e.g. `reasoningEffort`). `description` required. `mode: primary|subagent|all` (default `all`). `default_agent` must be non-hidden primary. `subagent_depth` default `1` (`0` = no launches). `hidden: true` hides subagent from `@` menu only. `permission.task: {"*": deny, "orchestrator-*": allow}` gates Task-tool invocation (last-match-wins; `@` menu still works). Disable built-in: `{"agent": {"build": {"disable": true}}}`. Scaffold: `opencode agent create` (or `opencode agent list`).

Worktrees Studio mapping: mirror `.agents/agents/*.md` (ds-architect, hono-d1-backend, maestro-e2e-qa, ...) as `.opencode/agents/*.md` subagents with `edit: deny` for auditors, `temperature: 0.1` for analysis.

## Commands (`/name`)

Files: `.opencode/commands/<name>.md` (or global `~/.config/opencode/commands/`). Body = `template` (required, the prompt). Frontmatter: `description`, `agent`, `model`, `subtask` (force subagent, keeps primary context clean). JSON form: `command: { test: { template, description, agent, model } }`. Custom overrides built-in (`/init`, `/undo`, `/redo`, `/share`, `/help`, ...).

```markdown
---
description: Run tests with coverage
agent: build
---

Run the full test suite with coverage report and show any failures. Focus on failing tests and suggest fixes.
```

Prompt features: `$ARGUMENTS` / `$1 $2...`, shell inject `` !`bun test` `` (runs in project root), file inject `@src/components/Button.tsx`.

Worktrees Studio starters: `/lint` (`!bun --filter ... lint` + fix), `/typecheck`, `/scaffold $1 $2` (calls `.agents/skills/worktrees-studio-fullstack-scaffolder` script), `/review-changes` (`` !`git log --oneline -10` ``).

## Permissions

Actions: `allow` (no prompt) / `ask` (once/always/reject UI) / `deny` (block). Default: most `allow`; `doom_loop`+`external_directory` `ask`; `read` allow except `.env` denied (`*.env`, `*.env.*` deny, `*.env.example` allow).

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "*": "ask",
    "bash": {
      "*": "ask",
      "bun *": "allow",
      "git *": "allow",
      "git commit *": "deny",
      "git push *": "deny",
      "rm *": "deny",
    },
    "edit": { "*": "deny", "packages/web/src/content/docs/*.mdx": "allow" },
    "external_directory": { "~/projects/personal/**": "allow" },
    "skill": { "*": "allow", "experimental-*": "ask" },
  },
}
```

- Keys: `read, edit (covers write/edit/apply_patch), glob, grep, list, bash, task, external_directory, lsp, skill` accept shorthand **or** `{pattern: action}`; `question, webfetch, websearch, todowrite, doom_loop` flat action only. MCP tools match `servername_*` (e.g. `"mymcp_*": deny`).
- **Last matching rule wins** — `"*"` first, specifics last. `~`/`$HOME` expand. `external_directory` gates any tool touching paths outside worktree (refs bypass boundary but not tool perms).
- Per-agent merge (agent wins): `agent.<name>.permission`. `--auto` flag auto-approves non-`deny` (TUI palette toggles, `auto` indicator).
