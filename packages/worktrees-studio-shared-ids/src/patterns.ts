/** Shared regex + string helpers (single definitions, import everywhere). */

export const OTP_RE = /^\d+$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const NAME_NO_DIGIT_RE = /^[^\d]+$/u;
export const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i;
export const VIDEO_EXT_RE = /\.(mp4|mov|webm)$/i;
export const LEADING_SLASH_RE = /^\//;
export const TRAILING_SLASH_RE = /\/$/;

export function stripSlashes(path: string): string {
  return path.replace(LEADING_SLASH_RE, "").replace(TRAILING_SLASH_RE, "");
}

export function isImageUrl(url: string): boolean {
  return IMAGE_EXT_RE.test(url) || url.startsWith("image/");
}

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT_RE.test(url) || url.startsWith("video/");
}
