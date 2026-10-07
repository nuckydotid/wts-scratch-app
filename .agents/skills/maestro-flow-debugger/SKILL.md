---
name: maestro-flow-debugger
description: Diagnostics skill for running, debugging, and inspecting Maestro mobile E2E flows against Android staging.
---

# Maestro Flow Debugger Skill

Use this skill when developing, debugging, or validating Maestro mobile E2E test flows.

## Zero-Retry Standard

All Maestro test flows in this codebase adhere to a **Zero-Retry Standard** (`retry:` blocks are strictly prohibited).

- Do not add `retry: maxRetries: N` to workaround dropped taps or race conditions.
- If a tap is dropped, ensure the target query uses `placeholderData: keepPreviousData` in `apps/app/src/lib/`.
- Use explicit synchronization with `extendedWaitUntil: visible: ... timeout: 30000`.

## Flow Validation

Run `bun run e2e:check` to verify that all element testIDs exist in source code and no English strings leak.

## Helper Script

Run `.agents/skills/maestro-flow-debugger/scripts/run_flow.sh <flow-name>` to execute a single flow and capture hierarchy dumps on failure.
