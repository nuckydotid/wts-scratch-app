# OpenCode Full-Potential Roadmap

> Status: PLAN (nothing below is applied until approved). Goal: every OpenCode surface — config, agents, skills, commands, MCP, plugins, docs, TUI — tuned for this Bun monorepo on MacBook. Verified baselines: `opencode 1.18.13`, `debug config` valid, 14/14 custom subagents load, `worktrees-studio-guards` plugin loads.
>
> **Execution record (2026-09-09): all phases executed, proof in [baseline.md](baseline.md).**
> Deferred with rationale: agent `steps` caps (no usage data — revisit via `opencode stats`); LSP stays `true` (servers start lazily per extension; repo is TS-only so this means typescript+eslint); `plan` skill override unnecessary (global skill perm covers it).

## Phase A — Discovery wiring (docs → agents)

| #   | Item                                                                                                                                                           | Effort | Risk | Verify                                           |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--- | :----------------------------------------------- |
| A1  | `docs/onesignal/README.md` index linking all 17 pages                                                                                                          | S      | Low  | Index covers 17/17 (same script as audit)        |
| A2  | Link the 2 strays (`app` 1, `monorepo` 1) from their domain indexes                                                                                            | S      | Low  | Orphan count 2 → 0                               |
| A3  | `docs/react/` + `docs/reactflow/` (101 orphans): complete index links OR add "grep-only reference, do not bulk-read" headers                                   | M      | Low  | Orphans → 0 or explicitly waived                 |
| A4  | `docs/plans/`: archive header (`архив — historical, do not treat as current`) or delete superseded                                                             | S      | Low  | No plan presented as current guidance            |
| A5  | Convert `prompt-template/develop-app-new-feature.md` → `/new-feature` command (P0-story → plan → proceed flow; highest-value unwired workflow) | M      | Med  | `/new-feature $ARGUMENTS` scaffolds per template |
| A6  | Fix `docs/opencode/AGENTS.md` sample (trailing comma, `opencode.json` → `opencode.jsonc`, note skills normalization done)                                      | S      | Low  | Sample parses as JSONC                           |

## Phase B — Runtime config (project + global)

| #   | Item                                                                                                                                                   | Effort | Risk | Verify                            |
| :-- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--- | :-------------------------------- |
| B1  | Project `tui.json`: `theme: system`, `leader: ctrl+x`, attention sounds on (MacBook-tuned)                                                             | S      | Low  | `debug config` shows TUI merge    |
| B2  | `default_agent: build`, `subagent_depth: 1` (explicit), `compaction.reserved` keep                                                                     | S      | Low  | `debug config`                    |
| B3  | Verify `sqlite-d1` MCP live (`opencode mcp list`; confirm db path exists, else point at real D1 sqlite or disable)                                     | S      | Med  | `mcp list` shows connected        |
| B4  | Global `~/.config/opencode/opencode.jsonc` fill (OUT-OF-REPO, needs approval): `model`, `small_model`, `shell`, Context7 key via `{env:}`, skill perms | S      | Low  | `opencode models` + trial session |
| B5  | Scope LSP: `lsp: true` enables ALL built-ins — measure startup cost, disable noisy servers (`{disabled: true}`) if slow                                | S      | Med  | Cold-start timing before/after    |

## Phase C — Agent intelligence

| #   | Item                                                                                                                                                               | Effort | Risk | Verify                                              |
| :-- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--- | :-------------------------------------------------- |
| C1  | Compaction plugin (`experimental.session.compacting`): inject Worktrees Studio carry-over (active phase, touched files, P0-story state, bun-only/HeroUI/Hono-RPC invariants) | M      | Med  | Compacted session resumes without re-reading AGENTS |
| C2  | Per-agent tuning: `color` per persona, `temperature: 0.1` on remaining auditors, `steps` caps on `explore` (cost control)                                          | S      | Low  | `agent list` shows fields                           |
| C3  | Skill permission scoping: `experimental-*` → `ask`, rest `allow` (both global + `plan` override)                                                                   | S      | Low  | Skill load prompts once for experimental            |
| C4  | `plan`-agent guardrails: confirm `edit: deny` + `bash: ask` inherited correctly for this repo                                                                      | S      | Low  | Trial `/new-feature` dry-run makes zero edits       |
| C5  | Audit skill scripts actually run (`bun`/`python3` smoke: i18n-parity, ds-token, hono-rpc auditors)                                                                 | M      | Med  | Each script exits 0 on current tree                 |

## Phase D — Proof & lock-in

| #   | Item                                                                                               | Effort | Risk | Verify                                      |
| :-- | :------------------------------------------------------------------------------------------------- | :----- | :--- | :------------------------------------------ |
| D1  | End-to-end trial: `/test-all` + `/security-audit` in a scratch session, record token/time baseline | M      | Low  | Report in `docs/opencode/baseline.md` (new) |
| D2  | `docs/opencode/migration.md` sync-checklist → add A5/C1 artifacts + quarterly review reminder      | S      | Low  | Checklist matches reality                   |
| D3  | Commit as `feat(opencode): full-potential pass` with verification log in message body              | S      | Low  | Hooks green                                 |

## Non-goals (deliberately excluded)

- Copying `.agents/skills` → `.opencode/skills` (name-collision shadowing; bridge + `skills.paths` is the correct pattern).
- Pinning `model` in project config (user/global choice; would force all contributors).
- Git `references` entries (in-repo paths need none; upstream clones cost more than Context7+MCP).
- Wiring `antigravity/raw/` (declared archive) or bulk-loading 500 docs files into context.
