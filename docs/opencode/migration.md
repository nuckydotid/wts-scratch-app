# Antigravity → OpenCode Migration Map

> One-way mirror created 2026-09-09. Source of truth stays in `.agents/` (Antigravity); `.opencode/` + `opencode.jsonc` are the OpenCode port. Re-run the converter note under each table when sources change.

## File map

| Antigravity source                       | OpenCode port                                                | Notes                                                                                                                                                     |
| :--------------------------------------- | :----------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agents/settings.json`                  | `opencode.jsonc`                                             | Allowlist/denylist → `permission.bash`; `urls` → `permission.webfetch`; `model: gemini-3.7-flash` dropped (not an opencode provider ID)                   |
| `.agents/hooks.json` safety-guard        | `.opencode/plugins/worktrees-studio-guards.ts` (`tool.execute.before`) | Same 4 destructive patterns + `sudo` / `curl \| bash`; throws to deny                                                                                     |
| `.agents/hooks.json` auto-formatter      | `opencode.jsonc` `formatter: true`                           | Prettier built-in (repo already depends on prettier)                                                                                                      |
| `.agents/hooks.json` verify-on-stop      | — (no port)                                                  | OpenCode `session.idle` needs no approval response                                                                                                        |
| `.agents/mcp_config.json` sqlite-d1      | `opencode.jsonc` `mcp.sqlite-d1`                             | `npx` → `bunx` per bun-only rule; same `--db-path`                                                                                                        |
| `.agents/agents/*.md` (14)               | `.opencode/agents/*.md` (14)                                 | `name:`/`model:`/`workspace:` dropped; `mode: subagent` added; auditors get `permission.edit: deny`, security/performance/i18n get `temperature: 0.1`     |
| `.agents/workflows/*.md` (13)            | `.opencode/commands/*.md` (13)                               | `workflow-` prefix stripped; `agent:` assigned; scaffolds get `subtask: true` + `$ARGUMENTS`                                                              |
| `.agents/rules/*.md` (7)                 | `opencode.jsonc` `instructions` glob                         | `.agents/rules/*.md` — no copy, referenced in place                                                                                                       |
| `.agents/skills/*/SKILL.md` (22)         | — (no copy, auto-discovered)                                 | OpenCode already scans `.agents/skills/`; normalized in place: removed `model:`/`workspace:` frontmatter, rewrote `.gemini/…` script paths to `.agents/…` |
| `.agents/settings.json` theme/statusline | — (no port)                                                  | `theme: dark` → set `theme` in `tui.json` if desired; statusline format has no TUI equivalent                                                             |
| `prompt-template/*.md`                   | `/fullstack-feature`, `/screen-scaffold`, `/api-scaffold`    | P0-story → plan → proceed flow now invocable as slash commands                                                                                            |

## Command names (`/` in TUI)

`d1-migrate`, `e2e-maestro`, `test-all`, `api-scaffold`, `d1-migration`, `e2e-run`, `fullstack-feature`, `i18n-sync`, `ota-release`, `patch-verify`, `screen-scaffold`, `security-audit`, `test-suite`.

## Skills: why no `.opencode/skills/` copy

Skill names must be unique across all discovery roots. Copying would shadow `.agents/skills/` with identical names (`hono-rpc-auditor`, …). The bridge is `skills.paths: [".agents/skills"]` in `opencode.jsonc` plus the in-place frontmatter normalization above.

## Sync checklist (when `.agents/` changes)

1. Agents: re-run converter (`convert.py` in scratch dir) or hand-port frontmatter (`description` + `mode: subagent` + `color`; `temperature: 0.1` for auditors).
2. Workflows + prompt-templates: add `.opencode/commands/<name>.md` with `description` + `agent` (+ `$ARGUMENTS`, `subtask: true` only when no review gates are needed).
3. Skills: keep `name` (= folder) + 1–1024 char `description`; no `model:`/`workspace:` keys; script paths under `.agents/skills/`; smoke-test scripts after changes.
4. Verify: `bunx prettier --check opencode.jsonc .opencode/`, `opencode debug config`, `opencode agent list`, `opencode mcp list`.
5. Restart opencode (config loads once at startup).
6. Quarterly: re-run the docs-orphan audit (see [baseline.md](baseline.md)), `opencode stats` for `steps`-cap data, clean `docs/plans/` history.
