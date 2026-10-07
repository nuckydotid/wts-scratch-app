import type { ControlDef } from "./index";

// ── Common control factories ──────────────────────────

export function select(options: readonly string[], defaultVal: string): ControlDef {
  return { type: "select", options, default: defaultVal };
}

export function bool(defaultVal = false): ControlDef {
  return { type: "boolean", default: defaultVal };
}

export function txt(defaultVal = ""): ControlDef {
  return { type: "text", default: defaultVal };
}

// ── Shared option arrays ──────────────────────────────

export const SIZES = ["sm", "md", "lg"] as const;
export const ORIENTATIONS = ["horizontal", "vertical"] as const;

export const COLORS_5 = ["accent", "default", "success", "warning", "danger"] as const;
export const COLORS_5_ALT = ["default", "accent", "success", "warning", "danger"] as const;
export const COLORS_4 = ["default", "success", "warning", "danger"] as const;
export const COLORS_TEXT = ["default", "muted"] as const;

export const VARIANTS_PS = ["primary", "secondary"] as const;
export const VARIANTS_PSTT_SOFT = ["primary", "secondary", "tertiary", "soft"] as const;
export const VARIANTS_DSTT = ["default", "secondary", "tertiary", "transparent"] as const;
export const VARIANTS_DS = ["default", "surface"] as const;
export const VARIANTS_SOFT = ["default", "soft"] as const;
export const VARIANTS_THIN = ["thin", "thick"] as const;
export const VARIANTS_SHIM = ["shimmer", "pulse", "none"] as const;

export const SELECTION_SINGLE = ["single", "multiple"] as const;
export const SELECTION_ALL = ["none", "single", "multiple"] as const;

export const FEEDBACK_VARIANTS = ["scale-highlight", "scale-ripple", "scale", "none"] as const;

export const TEXT_TYPES = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "body",
  "body-sm",
  "body-xs",
  "code",
] as const;

export const TEXT_ALIGNS = ["start", "center", "end", "justify"] as const;
export const TEXT_WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;

export const INDICATOR_VARIANTS = ["checkbox", "radio", "switch"] as const;

// ── Preset controls ───────────────────────────────────

export const size = select(SIZES, "md");
export const isDisabled = bool(false);
export const isInvalid = bool(false);
export const isSelected = bool(true);
export const isRequired = bool(false);
export const isLoading = bool(true);
export const isCollapsible = bool(true);
export const truncate = bool(false);
export const hideOnInvalid = bool(false);
export const primarySecondary = select(VARIANTS_PS, "primary");
export const defaultSurface = select(VARIANTS_DS, "default");
export const defaultTertiary = select(VARIANTS_DSTT, "default");
export const orientation = select(ORIENTATIONS, "horizontal");
