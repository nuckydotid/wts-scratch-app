import type { Plugin } from "@opencode-ai/plugin";

/**
 * Worktrees Studio guards — OpenCode port of `.agents/hooks.json`.
 *
 * - `safety-guard` (PreToolUse run_command)  -> `tool.execute.before`: blocks
 *   destructive shell commands before they run.
 * - `auto-formatter` (PostToolUse write)      -> covered by `formatter: true`
 *   in `opencode.jsonc` (Prettier built-in); the `tool.execute.after` hook
 *   below is a no-op fallback that never blocks.
 * - `verify-on-stop` (Stop)                   -> no equivalent needed; OpenCode
 *   `session.idle` requires no approval response.
 *
 * Plus `experimental.session.compacting`: injects Worktrees Studio carry-over context
 * so compacted sessions resume with stack invariants + P0-story state intact.
 *
 * Hooks must never block OpenCode except by throwing to deny a tool call.
 */

const BLOCKED_BASH = [
  /rm\s+-rf\s+[/~*]/,
  /git\s+reset\s+--hard/,
  /git\s+push\s+--force/,
  /git\s+clean\s+-fd/,
  /(^|[;&|]\s*)sudo\s+/,
  /curl\b[^|]*\|\s*(ba)?sh/,
];

function commandOf(args: Record<string, unknown>): string {
  for (const key of ["command", "CommandLine", "cmd"]) {
    const value = args[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return "";
}

export default (async () => ({
  "tool.execute.before": async (input, _output) => {
    if (input.tool !== "bash") return;
    const raw = input.args as Record<string, unknown> | undefined;
    const cmd = commandOf(raw ?? {}).trim();
    if (!cmd) return;
    for (const pattern of BLOCKED_BASH) {
      if (pattern.test(cmd)) {
        throw new Error(`Destructive command blocked by worktrees-studio-guards: ${cmd}`);
      }
    }
  },

  "tool.execute.after": async () => {
    // Formatting is handled by the Prettier built-in (`formatter: true`).
  },

  "experimental.session.compacting": async (_input, output) => {
    output.context.push(
      [
        "## Worktrees Studio carry-over (preserve across compaction)",
        "- Stack invariants: bun/bunx only (never npm/npx/yarn/pnpm); HeroUI Native + Tailwind v4 tokens (no hex/StyleSheet); Expo Router v57 typed routes; typed Hono RPC client (no raw fetch/axios); Zustand v5 + @repo/worktrees-studio-mmkv (no AsyncStorage).",
        "- If a P0 expo-story review or per-phase 'proceed' gate was pending, it is STILL pending — never auto-approve, never skip to implementation.",
        "- Keep: current feature + phase (P0→P4), files being modified, decisions made, out-of-scope list, last verification results (lint/typecheck/test).",
        "- Generated sources of truth: flows screens-tree-data.ts (regen via `bun run sync:tree`, never hand-edit); testIDs anchored, locale-independent (app default `id`).",
      ].join("\n"),
    );
  },
})) satisfies Plugin;
