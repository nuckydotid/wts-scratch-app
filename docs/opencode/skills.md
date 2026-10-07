# Skills — `SKILL.md` Authoring + Worktrees Studio Bridge

> Upstream: [Skills](https://opencode.ai/docs/skills/). Skills surface in the native `skill` tool (`<available_skills>` list) and load on demand via `skill({name})`.

## Discovery paths (project walks up to git worktree + globals)

- `.opencode/skills/<name>/SKILL.md` (project, preferred for new)
- `~/.config/opencode/skills/<name>/SKILL.md` (global — this Mac has 9: agents-sdk, cloudflare*, durable-objects, sandbox-sdk, turnstile-spin, web-perf, workers-best-practices, wrangler)
- `.claude/skills/<name>/SKILL.md` + `~/.claude/skills/<name>/SKILL.md` (Claude compat)
- `.agents/skills/<name>/SKILL.md` + `~/.agents/skills/<name>/SKILL.md` (agent compat — **this is where Worktrees Studio's 20 skills live**, auto-loaded, no copy needed)

Extra search roots: `skills.paths[]` (recursive `**/SKILL.md` scan), `skills.urls[]` (remote lists).

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": { "paths": [".opencode/skills"], "urls": [] },
}
```

Note: `skills` is an **object** (`paths`/`urls`), not an array. Disable scans: `OPENCODE_DISABLE_EXTERNAL_SKILLS=1`, `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1`.

## Frontmatter (only these keys recognized)

```markdown
---
name: git-release
description: Create consistent releases and changelogs. Use when preparing a tagged release with gh release create.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

## What I do

- Draft release notes from merged PRs
- Propose version bump
- Provide copy-pasteable `gh release create` command

## When to use me

Use when preparing a tagged release. Ask if versioning scheme unclear.
```

- `name`: required, `^[a-z0-9]+(-[a-z0-9]+)*$`, 1–64 chars, **must match folder name**, file must be exactly `SKILL.md` (caps).
- `description`: effectively required (missing = filtered out), 1–1024 chars, third person, front-load trigger keywords/filenames. Gate narrow skills with `Use ONLY when...`.
- Unknown frontmatter keys ignored — so existing Worktrees Studio `model: inherit` is inert; migrate to `description`-first style.

## Permissions + per-agent override + disable

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "skill": { "*": "allow", "internal-*": "deny", "experimental-*": "ask" },
  },
  "agent": { "plan": { "permission": { "skill": { "internal-*": "allow" } } } },
}
```

- `allow` loads immediately, `deny` hides from agent, `ask` prompts. Wildcards: `internal-*`.
- Custom agent frontmatter: `permission: { skill: { "documents-*": allow } }`.
- Disable tool entirely: custom agent `tools: { skill: false }`, built-in: `{"agent": {"plan": {"tools": {"skill": false}}}}` → `<available_skills>` omitted.

## Worktrees Studio migration checklist

1. Keep `.agents/skills/*` as-is (discovered). Audit each `SKILL.md` has valid `name` (= folder) + 1–1024 char `description` with trigger words (`Hono`, `Drizzle`, `Maestro`, `HeroUI`, `i18n`, ...).
2. New skills → `.opencode/skills/<kebab-name>/SKILL.md` so `opencode.json` + `skills.paths` stay portable.
3. Add skill hints to `AGENTS.md` (e.g. `When you need docs, use context7 tools`) rather than stuffing bodies into instructions.
4. Troubleshoot missing skill: caps filename? `name`+`description` present? Unique across all roots? `deny` permission?

Example from upstream docs (`skill({name: "git-release"})`) maps directly to Worktrees Studio e.g. `skill({name: "hono-rpc-auditor"})`, `skill({name: "ds-token-auditor"})`.
