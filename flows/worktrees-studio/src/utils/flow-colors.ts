import type { ScreenCategory } from "../data/screens-tree-data";

/**
 * Single source of truth for canvas colors that must be raw hex/CSS values
 * because they feed @xyflow inline-style APIs (Handle, MiniMap, edge
 * stroke) which cannot consume Tailwind classes.
 *
 * Everything theme-aware stays as Tailwind classes at the call sites;
 * only these canvas primitives live here.
 */

/** Node handle + MiniMap dot color per screen category. */
export const CATEGORY_HANDLE_COLOR: Record<ScreenCategory, string> = {
  root: "#64748b", // slate-500
  public: "#f59e0b", // amber-500
  admin: "#8b5cf6", // violet-500
  member: "#10b981", // emerald-500
  staff: "#0284c7", // sky-600
  e2e: "#71717a", // zinc-500
};

/** Edge stroke color per navigation transition kind. */
export const TRANSITION_STROKE_COLOR: Record<string, string> = {
  fork: "#a855f7", // purple-500
  push: "#10b981", // emerald-500
  replace: "#f59e0b", // amber-500
  redirect: "#64748b", // slate-500
  tab: "#0284c7", // sky-600
  drawer: "#818cf8", // indigo-400
  sheet: "#ec4899", // pink-500 (generic overlay fallback)
  teleport: "#8b5cf6", // violet-500
  "bottom-sheet": "#ec4899", // pink-500
  "full-sheet": "#8b5cf6", // violet-500
};

/** Stroke override when an edge is hovered/selected. */
export const HIGHLIGHT_STROKE_COLOR = "#38bdf8"; // sky-400

/** Stroke override for dimmed (filtered-out) edges. */
export const DIMMED_STROKE_COLOR = "var(--color-border, #475569)";

/** Muted chrome color for canvas controls (MiniMap dots, control icons). */
export const MUTED_CANVAS_COLOR = "var(--color-muted, #94a3b8)";

export function categoryHandleColor(
  category: ScreenCategory | undefined,
): string {
  return category
    ? CATEGORY_HANDLE_COLOR[category]
    : CATEGORY_HANDLE_COLOR.root;
}

export function transitionStrokeColor(kind: string | undefined): string {
  return (
    (kind ? TRANSITION_STROKE_COLOR[kind] : undefined) ??
    TRANSITION_STROKE_COLOR.redirect
  );
}
