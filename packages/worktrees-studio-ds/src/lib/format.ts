/**
 * Video duration display. Two house styles:
 * - "clock" → `m:ss` (parent gallery overlays)
 * - "suffixed" → `8s` (teacher gallery badges; suffix localized by caller)
 */
export function formatVideoDuration(
  totalSeconds: number,
  style: "clock" | "suffixed" = "clock",
  suffix = "s"
): string {
  if (style === "suffixed") return `${Math.round(totalSeconds)}${suffix}`;
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}
