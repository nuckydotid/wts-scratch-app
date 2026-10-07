/**
 * Shared API + query constants. Hono query params serialize as strings on the wire, so helpers return
 * strings while the canonical values stay numeric here.
 */

/** Default list page size (canonical number; stringify at the call site). */
export const DEFAULT_PAGE_SIZE = 20;

/** Paged-list query params for Hono `$get({ query })` calls. */
export function pageQuery(page: number): { page: string; pageSize: string } {
  return { page: String(page), pageSize: String(DEFAULT_PAGE_SIZE) };
}

/** TanStack Query global defaults. */
export const QUERY_DEFAULTS = {
  retry: 1,
  staleTime: 30_000,
} as const;

/** Realtime data (chat over WebSocket) bypasses cache + retry. */
export const QUERY_DEFAULTS_REALTIME = {
  staleTime: 0,
  retry: false,
} as const;

/** Initial chat history window. */
export const CHAT_INITIAL_ITEMS = 100;

/** Upload/display percentage scale. */
export const UPLOAD_PERCENT_MAX = 100;

/** Backend API paths (same-origin via the base URL from `project.config.json`). */
export const API_PATHS = {
  otaCheckUpdate: "/api/ota/check-update",
  uploadsDirect: "/api/uploads/direct",
} as const;

/** Fetch timeout for API calls. */
export const API_FETCH_TIMEOUT_MS = 20_000;
