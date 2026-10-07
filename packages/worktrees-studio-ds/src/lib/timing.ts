import { useCallback, useEffect, useRef, useState } from "react";

/** Search input debounce (template searchable lists). */
export const SEARCH_DEBOUNCE_MS = 700;

/** Fake pull-to-refresh spinner duration. */
export const FAKE_REFRESH_MS = 1000;

/** Crop sheet dismiss delay (lets the close animation start). */
export const CROP_DISMISS_MS = 350;

/** Toast auto-dismiss delay. */
export const TOAST_DISMISS_MS = 3000;

/**
 * Pull-to-refresh state with a fake spinner window. Returns the local
 * refreshing flag, its setter (for externally-controlled variants), and a
 * stable onRefresh callback.
 */
export function useFakeRefresh(onRefreshProp?: () => void) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    onRefreshProp?.();
    setTimeout(() => setRefreshing(false), FAKE_REFRESH_MS);
  }, [onRefreshProp]);
  return { refreshing, setRefreshing, onRefresh };
}

/**
 * Debounced value — updates `delayMs` after the last change. Use for
 * search inputs driving expensive work (list filtering, layout).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Debounced callback that does NOT re-arm when the callback identity
 * changes (hosts often pass inline arrows). The latest callback is kept in
 * a ref; only `query` re-arms the timer.
 */
export function useDebouncedSearch(
  query: string,
  onDebounced: (query: string) => void,
  delayMs: number = SEARCH_DEBOUNCE_MS
): void {
  const ref = useRef(onDebounced);
  useEffect(() => {
    ref.current = onDebounced;
  });
  useEffect(() => {
    const timer = setTimeout(() => ref.current(query), delayMs);
    return () => clearTimeout(timer);
  }, [query, delayMs]);
}
