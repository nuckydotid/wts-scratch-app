# OpenCode Baseline (2026-09-09)

> Environment: MacBook Air ARM64, `/bin/zsh`, `bun 1.3.14`, `opencode 1.18.13`, provider `opencode-go` (model `muse-spark-1.3-contributor`, small `glm-5.3-flash`).

## Resolved config (`opencode debug config`)

- model / small_model / default_agent(`build`) / subagent_depth(`1`) resolve from global + project merge.
- `plugin_origins`: `gk-hooks.js` (global) + `.opencode/plugins/worktrees-studio-guards.ts` (local, incl. compaction hook).
- `command`: **14** (13 workflow mirrors + `/new-feature`); `agent`: **14** custom subagents (+ built-ins).
- MCP: `context7` connected; `sqlite-d1` failed until `wrangler dev` materializes `api/.wrangler/.../<db-id>.sqlite` (documented, harmless).

## Trial session (D1)

`opencode run --agent plan --command test-suite --auto "<scoped prompt>"`:

- Plan agent loaded `/test-suite`, cited `.agents/workflows/workflow-test-suite.md:1-24`, enumerated all 5 steps, ran only step 1 as instructed.
- `bun run lint`: **PASS exit 0** — shared-ids, ds (0 errors / 26 pre-existing warnings), app, flows all green.
- **Zero files modified** (plan `edit: deny` held).

## Skill script smoke (C5, all exit 0)

i18n-parity ✓ · hono-rpc (21 routes, 1 advisory warning) ✓ · d1 constraints ✓ · ds-tokens (0 warnings) ✓ · convex schema ✓ · react-standards (664 files, 0 recommendations) ✓ · sonar (1 advisory sort note) ✓ · tanstack-query (13 files) ✓ · native-modules ✓ · ota packager (`--help`) ✓ · scaffolder (`--help`) ✓ · image script (usage) ✓ · maestro runner (usage shape) ✓.

## Docs reachability

Non-`raw/` orphans: **0** (audited via index-link script). `raw/` archives + `docs/plans/` history explicitly marked reference-only.

## Known follow-ups (not blocking)

- `steps` caps on agents deferred — no usage data; revisit after session stats (`opencode stats`).
- `sqlite-d1` connects on next `wrangler dev` run; re-check with `opencode mcp list`.
- DS lint carries 26 pre-existing warnings (untouched by this pass).
