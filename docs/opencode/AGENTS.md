# AGENTS.md — OpenCode Rules for Worktrees Studio Monorepo

> Loaded via `instructions` (see [config.md](config.md)) + root `AGENTS.md`. Keep this file concise; reference domain docs instead of duplicating them. Upstream: [Rules](https://opencode.ai/docs/rules/) — `AGENTS.md` project root, `~/.config/opencode/AGENTS.md` global, `CLAUDE.md` fallback.

## Stack (never violate)

- **Bun only:** `bun`, `bunx`. Never `npm`/`yarn`/`pnpm`/`npx` (exception: MCP `command` examples upstream use `npx -y` — translate to `bunx -y` here).
- **UI:** HeroUI Native + Tailwind v4 tokens. No hex literals, no `StyleSheet.create`.
- **Routing:** Expo Router v57 file-based typed routes (`router.push('/(auth)/login')`). No `createStackNavigator`.
- **API:** Typed Hono RPC (`client.api.v1...`). No raw `fetch`/`axios` in app code.
- **State:** Zustand v5 + `@repo/worktrees-studio-mmkv`. No `AsyncStorage`.

## How to work in this repo

1. Read `AGENTS.md` (root) → scope file (`apps/app/AGENTS.md`, `packages/worktrees-studio-ds/AGENTS.md`, `flows/worktrees-studio/AGENTS.md`, `modules/AGENTS.md`) → relevant `docs/*/README.md`.
2. Prefer `explore` subagent for codebase questions; `plan` agent for analysis without edits; `build` (default primary) for implementation.
3. Verify with focused commands, not full sweeps:
   - `bun --filter './apps/*' --filter './packages/*' --filter './flows/*' lint`
   - `bun --filter './apps/*' --filter './packages/*' --filter './flows/*' typecheck`
   - `prettier --check '<touched-files>'` (formatters run via opencode `formatter: prettier` when enabled)
4. Document MCP use in prompts: `use context7` / `use the gh_grep tool` when docs/code examples needed (see [tools-mcp-plugins.md](tools-mcp-plugins.md)).

## Instruction wiring (`opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "AGENTS.md",
    "docs/opencode/AGENTS.md",
    ".agents/rules/*.md",
    "apps/app/AGENTS.md",
    "packages/worktrees-studio-ds/AGENTS.md",
    "flows/worktrees-studio/AGENTS.md",
    "modules/AGENTS.md",
  ],
}
```

Matches the live `opencode.jsonc`. Supports globs (`packages/*/AGENTS.md`) and remote URLs (5s fetch timeout). All files combine with `AGENTS.md`.

- Lazy-load pattern for `SKILL.md` / rule refs: when `AGENTS.md` mentions `@path/to/file`, `Read` it only when the task needs it.

## Skills bridge (Antigravity → OpenCode)

- Existing skills live in `.agents/skills/*/SKILL.md` (e.g. `worktrees-studio-fullstack-scaffolder`, `d1-drizzle-studio`, `hono-rpc-auditor`). OpenCode auto-discovers `.agents/skills/*/SKILL.md` by walking up to the git worktree — no copy needed.
- New OpenCode-native skills go in `.opencode/skills/<name>/SKILL.md` (checked into git) so `/init`-generated guidance stays portable. Naming/frontmatter rules: [skills.md](skills.md).
- `.agents/skills` frontmatter is OpenCode-valid (`name` + `description` only); script paths live under `.agents/skills/*/scripts/`. See [migration.md](migration.md).

## Safety

- `.env*` reads denied by default (see [agents-commands-permissions.md](agents-commands-permissions.md)). Never paste secrets; use `{env:VAR}` / `{file:~/.secrets/...}` in config.
- `bash` patterns must keep `bun *` allowed and `npm *`/`npx *` denied or ask (this repo's anti-pattern guard).
- `external_directory` defaults to `ask`. Reference dirs (`references.*.path`) bypass the boundary but normal `permission` still applies.
