/** Single source of truth for brand primary colors (was triplicated). */

export const DEFAULT_PRIMARY_COLOR = "#079789";

export type BrandColorId = "teal" | "emerald" | "blue" | "indigo" | "rose" | "amber";

export const PRIMARY_COLOR_PRESETS: readonly { id: BrandColorId; color: string }[] = [
  { id: "teal", color: "#079789" },
  { id: "emerald", color: "#10b981" },
  { id: "blue", color: "#0284c7" },
  { id: "indigo", color: "#6366f1" },
  { id: "rose", color: "#e11d48" },
  { id: "amber", color: "#ea580c" },
];

export const PRIMARY_COLOR_BY_ID: Record<BrandColorId, string> = Object.fromEntries(
  PRIMARY_COLOR_PRESETS.map((p) => [p.id, p.color])
) as Record<BrandColorId, string>;

/**
 * Spinner color on brand/accent buttons. White by design in both themes
 * (matches --accent-foreground); centralized so all submit spinners change
 * together.
 */
export const SPINNER_ON_ACCENT = "#FFFFFF";

/** Base constants for non-theme surfaces (camera overlays, print capture). */
export const WHITE = "#FFFFFF";
export const BLACK = "#000000";

/** Dim scrim behind overlay sheets (constant across themes). */
export const OVERLAY_SCRIM = "rgba(0,0,0,0.5)";
